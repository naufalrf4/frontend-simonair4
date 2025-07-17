import { apiClient } from '@/utils/apiClient';
import type {
  Device,
  DevicesResponse,
  GetDevicesParams,
  CreateDeviceData,
  UpdateDeviceData,
} from '../types';
import {
  parseApiError,
  DeviceError,
  DeviceErrorType,
  isRetryableError,
  calculateRetryDelay,
  sleep,
  RETRY_CONFIG,
} from '../utils/errorHandling';

export class DevicesService {
  /**
   * Execute API call with retry logic
   */
  private static async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    let lastError: DeviceError;
    
    for (let attempt = 1; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        const deviceError = parseApiError(error);
        lastError = deviceError;
        
        // Don't retry if error is not retryable or if this is the last attempt
        if (!isRetryableError(deviceError) || attempt === RETRY_CONFIG.maxRetries) {
          console.error(`${operationName} failed after ${attempt} attempts:`, deviceError);
          throw deviceError;
        }
        
        // Calculate delay and wait before retry
        const delay = calculateRetryDelay(attempt);
        console.warn(`${operationName} failed (attempt ${attempt}/${RETRY_CONFIG.maxRetries}), retrying in ${delay}ms:`, deviceError.message);
        await sleep(delay);
      }
    }
    
    throw lastError!;
  }

  /**
   * Fetch devices with pagination and search
   */
  static async getDevices(params: GetDevicesParams = {}): Promise<DevicesResponse> {
    return this.executeWithRetry(async () => {
      const { page = 1, limit = 10, search = '' } = params;
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });

      try {
        const response = await apiClient.get(`/devices?${queryParams}`);
        // Handle the nested response structure from the API
        const { data } = response.data;
        
        // Sort devices: online devices first, then by name
        const sortedData = data.sort((a: any, b: any) => {
          const aOnline = !!a.last_seen && new Date(a.last_seen) > new Date(Date.now() - 5 * 60 * 1000);
          const bOnline = !!b.last_seen && new Date(b.last_seen) > new Date(Date.now() - 5 * 60 * 1000);
          
          // Online devices first
          if (aOnline !== bOnline) {
            return bOnline ? 1 : -1;
          }
          
          // Then sort by device name
          return a.device_name.localeCompare(b.device_name);
        });
        
        return {
          data: sortedData.map((device: any) => ({
            ...device,
            // Transform latestSensorData if needed
            latestSensorData: device.latestSensorData ? {
              id: device.device_id, // Use device_id
              device_id: device.device_id,
              timestamp: device.latestSensorData.timestamp,
              ph: device.latestSensorData.ph?.calibrated || device.latestSensorData.ph?.raw,
              tds: device.latestSensorData.tds?.calibrated || device.latestSensorData.tds?.raw,
              do: device.latestSensorData.do_level?.calibrated || device.latestSensorData.do_level?.raw,
              temperature: device.latestSensorData.temperature?.value,
              created_at: device.latestSensorData.time,
            } : null,
            // Add online property based on last_seen (5 minutes threshold)
            online: !!device.last_seen && new Date(device.last_seen) > new Date(Date.now() - 5 * 60 * 1000), // 5 minutes
          })),
          pagination: {
            page,
            limit,
            total: data.length,
            totalPages: Math.ceil(data.length / limit),
          }
        };
      } catch (error) {
        throw parseApiError(error);
      }
    }, 'getDevices');
  }

  /**
   * Fetch a single device by device_id
   */
  static async getDevice(deviceId: string): Promise<Device> {
    if (!deviceId || typeof deviceId !== 'string') {
      throw new DeviceError(
        'ID perangkat wajib diisi dan harus berupa string yang valid',
        DeviceErrorType.VALIDATION_ERROR
      );
    }

    return this.executeWithRetry(async () => {
      try {
        const response = await apiClient.get(`/devices/${deviceId}`); // Using device_id in URL
        const device = response.data.data;
        
        return {
          ...device,
          // Add online property based on last_seen (5 minutes threshold)
          online: !!device.last_seen && new Date(device.last_seen) > new Date(Date.now() - 5 * 60 * 1000), // 5 minutes
          // Transform latestSensorData if needed
          latestSensorData: device.latestSensorData ? {
            id: device.device_id, // Use device_id
            device_id: device.device_id,
            timestamp: device.latestSensorData.timestamp,
            ph: device.latestSensorData.ph?.calibrated || device.latestSensorData.ph?.raw,
            tds: device.latestSensorData.tds?.calibrated || device.latestSensorData.tds?.raw,
            do: device.latestSensorData.do_level?.calibrated || device.latestSensorData.do_level?.raw,
            temperature: device.latestSensorData.temperature?.value,
            created_at: device.latestSensorData.time,
          } : null,
        };
      } catch (error) {
        throw parseApiError(error);
      }
    }, 'getDevice');
  }

  /**
   * Create a new device
   */
  static async createDevice(data: CreateDeviceData): Promise<Device> {
    // Validate required fields
    if (!data.device_id || !data.device_name) {
      throw new DeviceError(
        'ID dan nama perangkat wajib diisi',
        DeviceErrorType.VALIDATION_ERROR
      );
    }

    return this.executeWithRetry(async () => {
      try {
        const response = await apiClient.post('/devices', data);
        const device = response.data.data;
        
        return {
          ...device,
          online: false, // New devices are offline by default
        };
      } catch (error) {
        throw parseApiError(error);
      }
    }, 'createDevice');
  }

  /**
   * Update an existing device (using device_id, not id)
   */
  static async updateDevice(deviceId: string, data: UpdateDeviceData): Promise<Device> {
    if (!deviceId || typeof deviceId !== 'string') {
      throw new DeviceError(
        'ID perangkat wajib diisi dan harus berupa string yang valid',
        DeviceErrorType.VALIDATION_ERROR
      );
    }

    return this.executeWithRetry(async () => {
      try {
        // API uses PATCH method for updates
        const response = await apiClient.patch(`/devices/${deviceId}`, data); // Using device_id in URL
        const device = response.data.data;
        
        return {
          ...device,
          online: !!device.last_seen && new Date(device.last_seen) > new Date(Date.now() - 5 * 60 * 1000), // 5 minutes
        };
      } catch (error) {
        throw parseApiError(error);
      }
    }, 'updateDevice');
  }

  /**
   * Delete a device (using device_id, not id)
   */
  static async deleteDevice(deviceId: string): Promise<void> {
    if (!deviceId || typeof deviceId !== 'string') {
      throw new DeviceError(
        'ID perangkat wajib diisi dan harus berupa string yang valid',
        DeviceErrorType.VALIDATION_ERROR
      );
    }

    return this.executeWithRetry(async () => {
      try {
        await apiClient.delete(`/devices/${deviceId}`); // Using device_id in URL
      } catch (error) {
        throw parseApiError(error);
      }
    }, 'deleteDevice');
  }

  /**
   * Check if device ID is available
   */
  static async checkDeviceIdAvailability(deviceId: string): Promise<boolean> {
    if (!deviceId || typeof deviceId !== 'string') {
      throw new DeviceError(
        'ID perangkat wajib diisi dan harus berupa string yang valid',
        DeviceErrorType.VALIDATION_ERROR
      );
    }

    return this.executeWithRetry(async () => {
      try {
        const response = await apiClient.get(`/devices/check-availability/${deviceId}`);
        return response.data.available;
      } catch (error) {
        const deviceError = parseApiError(error);
        
        // Special handling for 404 - device ID is available
        if (deviceError.type === DeviceErrorType.NOT_FOUND_ERROR) {
          return true;
        }
        
        throw deviceError;
      }
    }, 'checkDeviceIdAvailability');
  }
}

// Query keys for TanStack Query
export const deviceKeys = {
  all: ['devices'] as const,
  lists: () => [...deviceKeys.all, 'list'] as const,
  list: (params: GetDevicesParams) => [...deviceKeys.lists(), params] as const,
  details: () => [...deviceKeys.all, 'detail'] as const,
  detail: (deviceId: string) => [...deviceKeys.details(), deviceId] as const, // Changed to deviceId
  availability: (deviceId: string) => [...deviceKeys.all, 'availability', deviceId] as const,
};