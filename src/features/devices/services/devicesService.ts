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
  getMaxRetryCount,
  sleep,
  createErrorContext,
  logErrorWithContext,
  deviceCircuitBreaker,
  RETRY_CONFIG,
} from '../utils/errorHandling';

export class DevicesService {
  /**
   * Execute API call with enhanced retry logic and circuit breaker
   */
  private static async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
    url?: string,
    method?: string
  ): Promise<T> {
    return deviceCircuitBreaker.execute(async () => {
      let lastError: DeviceError;
      const maxRetries = RETRY_CONFIG.maxRetries;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        const context = createErrorContext(operationName, attempt, maxRetries, {
          url,
          method,
          requestId: `${operationName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        });
        
        try {
          const result = await operation();
          
          // Log successful retry if this wasn't the first attempt
          if (attempt > 1) {
            console.info(`${operationName} succeeded on attempt ${attempt}/${maxRetries}`);
          }
          
          return result;
        } catch (error) {
          const deviceError = parseApiError(error);
          lastError = deviceError;
          
          // Log error with context
          logErrorWithContext(deviceError, context);
          
          // Get max retry count for this specific error type
          const maxRetriesForError = getMaxRetryCount(deviceError.type);
          const shouldRetry = isRetryableError(deviceError) && attempt < Math.min(maxRetries, maxRetriesForError);
          
          if (!shouldRetry) {
            console.error(`${operationName} failed permanently after ${attempt} attempts:`, {
              error: deviceError.message,
              type: deviceError.type,
              statusCode: deviceError.statusCode,
              context,
            });
            throw deviceError;
          }
          
          // Calculate delay with error-type specific adjustments
          const delay = calculateRetryDelay(attempt, deviceError.type);
          console.warn(`${operationName} failed (attempt ${attempt}/${maxRetriesForError}), retrying in ${delay}ms:`, {
            error: deviceError.message,
            type: deviceError.type,
            statusCode: deviceError.statusCode,
            nextRetryIn: `${delay}ms`,
          });
          
          await sleep(delay);
        }
      }
      
      throw lastError!;
    });
  }

  /**
   * Fetch devices with pagination and search
   */
  static async getDevices(params: GetDevicesParams = {}): Promise<DevicesResponse> {
    const { page = 1, limit = 10, search = '' } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    });
    const url = `/devices?${queryParams}`;
    
    return this.executeWithRetry(async () => {
      try {
        const response = await apiClient.get(url);
        // Handle the nested response structure from the API
        const { data, metadata } = response.data;

        // Sort devices: online devices first, then by name (client-side convenience)
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
        
        const normalized = sortedData.map((device: any) => {
          const lsd = device.latestSensorData;
          const normalizedLsd = lsd
            ? {
                id: device.device_id,
                device_id: device.device_id,
                timestamp: lsd.timestamp,
                // Accept both numeric and object shapes per docs/api/devices.md
                ph:
                  typeof lsd.ph === 'number'
                    ? lsd.ph
                    : lsd?.ph?.calibrated ?? lsd?.ph?.raw,
                tds:
                  typeof lsd.tds === 'number'
                    ? lsd.tds
                    : lsd?.tds?.calibrated ?? lsd?.tds?.raw,
                do:
                  typeof lsd.do_level === 'number'
                    ? lsd.do_level
                    : lsd?.do_level?.calibrated ?? lsd?.do_level?.raw,
                temperature:
                  typeof lsd.temperature === 'number'
                    ? lsd.temperature
                    : lsd?.temperature?.value,
                created_at: lsd.time ?? lsd.timestamp,
              }
            : null;

          return {
            ...device,
            latestSensorData: normalizedLsd,
            // Add online property based on last_seen (5 minutes threshold)
            online: !!device.last_seen && new Date(device.last_seen) > new Date(Date.now() - 5 * 60 * 1000),
          };
        });

        // Use metadata from API for pagination (align with docs)
        const totalFromMeta = metadata?.total ?? normalized.length;
        const pageFromMeta = metadata?.page ?? page;
        const limitFromMeta = metadata?.limit ?? limit;

        return {
          data: normalized,
          pagination: {
            page: pageFromMeta,
            limit: limitFromMeta,
            total: totalFromMeta,
            totalPages: Math.ceil(totalFromMeta / limitFromMeta),
          },
        };
      } catch (error) {
        throw parseApiError(error);
      }
    }, 'getDevices', url, 'GET');
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

    const url = `/devices/${deviceId}`;
    return this.executeWithRetry(async () => {
      try {
        const response = await apiClient.get(url); // Using device_id in URL
        const device = response.data.data;

        const lsd = device.latestSensorData;
        const normalizedLsd = lsd
          ? {
              id: device.device_id,
              device_id: device.device_id,
              timestamp: lsd.timestamp,
              ph: typeof lsd.ph === 'number' ? lsd.ph : lsd?.ph?.calibrated ?? lsd?.ph?.raw,
              tds: typeof lsd.tds === 'number' ? lsd.tds : lsd?.tds?.calibrated ?? lsd?.tds?.raw,
              do:
                typeof lsd.do_level === 'number' ? lsd.do_level : lsd?.do_level?.calibrated ?? lsd?.do_level?.raw,
              temperature:
                typeof lsd.temperature === 'number' ? lsd.temperature : lsd?.temperature?.value,
              created_at: lsd.time ?? lsd.timestamp,
            }
          : null;

        return {
          ...device,
          online: !!device.last_seen && new Date(device.last_seen) > new Date(Date.now() - 5 * 60 * 1000),
          latestSensorData: normalizedLsd,
        };
      } catch (error) {
        throw parseApiError(error);
      }
    }, 'getDevice', url, 'GET');
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

    const url = '/devices';
    return this.executeWithRetry(async () => {
      try {
        const response = await apiClient.post(url, data);
        const device = response.data.data;
        
        return {
          ...device,
          online: false, // New devices are offline by default
        };
      } catch (error) {
        throw parseApiError(error);
      }
    }, 'createDevice', url, 'POST');
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

    const url = `/devices/${deviceId}`;
    return this.executeWithRetry(async () => {
      try {
        // API uses PATCH method for updates
        const response = await apiClient.patch(url, data); // Using device_id in URL
        const device = response.data.data;
        
        return {
          ...device,
          online: !!device.last_seen && new Date(device.last_seen) > new Date(Date.now() - 5 * 60 * 1000), // 5 minutes
        };
      } catch (error) {
        throw parseApiError(error);
      }
    }, 'updateDevice', url, 'PATCH');
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
