import { apiClient } from '@/utils/apiClient';
import type {
  SensorHistoryResponse,
  SensorHistoryParams,
  Device,
  SensorDataError,
  SensorReading,
  SensorStatus,
} from '../types';
// import { createEnhancedError, retryWithBackoff } from '../utils/errorHandling';

/**
 * Service class for sensor data history API operations
 * Handles fetching sensor data and device information with proper error handling
 */
export class SensorDataService {
  /**
   * Parse API errors into standardized SensorDataError format
   */
  private static parseApiError(error: any): SensorDataError {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const message = error.response.data?.error?.message || error.response.data?.message || error.message;
      
      if (status === 404) {
        return {
          type: 'data',
          message: 'Data tidak ditemukan',
          code: 'NOT_FOUND'
        };
      } else if (status === 400) {
        return {
          type: 'validation',
          message: message || 'Parameter tidak valid',
          code: 'VALIDATION_ERROR'
        };
      } else if (status === 401) {
        return {
          type: 'network',
          message: 'Tidak memiliki akses. Silakan login kembali.',
          code: 'UNAUTHORIZED'
        };
      } else if (status >= 500) {
        return {
          type: 'network',
          message: 'Terjadi kesalahan server. Silakan coba lagi.',
          code: 'SERVER_ERROR'
        };
      }
    } else if (error.request) {
      // Network error
      return {
        type: 'network',
        message: 'Koneksi bermasalah. Periksa koneksi internet Anda.',
        code: 'NETWORK_ERROR'
      };
    }
    
    // Generic error
    return {
      type: 'data',
      message: error.message || 'Terjadi kesalahan tidak terduga',
      code: 'UNKNOWN_ERROR'
    };
  }

  /**
   * Execute API call with retry logic for network errors
   */
  private static async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: SensorDataError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        const sensorDataError = this.parseApiError(error);
        lastError = sensorDataError;
        
        // Don't retry for validation or data errors, only network errors
        if (sensorDataError.type !== 'network' || attempt === maxRetries) {
          console.error(`${operationName} failed after ${attempt} attempts:`, sensorDataError);
          throw sensorDataError;
        }
        
        // Wait before retry with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.warn(`${operationName} failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms:`, sensorDataError.message);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }

  /**
   * Validate sensor history parameters
   */
  private static validateSensorHistoryParams(params: SensorHistoryParams): void {
    if (!params.deviceId || typeof params.deviceId !== 'string') {
      throw {
        type: 'validation',
        message: 'ID perangkat wajib diisi dan harus berupa string yang valid',
        code: 'INVALID_DEVICE_ID'
      } as SensorDataError;
    }

    if (params.page < 1) {
      throw {
        type: 'validation',
        message: 'Nomor halaman harus lebih dari 0',
        code: 'INVALID_PAGE'
      } as SensorDataError;
    }

    if (params.limit < 1 || params.limit > 100) {
      throw {
        type: 'validation',
        message: 'Jumlah data per halaman harus antara 1-100',
        code: 'INVALID_LIMIT'
      } as SensorDataError;
    }

    // Validate date format (should be ISO 8601)
    const fromDate = new Date(params.from);
    const toDate = new Date(params.to);
    
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      throw {
        type: 'validation',
        message: 'Format tanggal tidak valid. Gunakan format ISO 8601.',
        code: 'INVALID_DATE_FORMAT'
      } as SensorDataError;
    }

    if (fromDate >= toDate) {
      throw {
        type: 'validation',
        message: 'Tanggal mulai harus lebih kecil dari tanggal akhir',
        code: 'INVALID_DATE_RANGE'
      } as SensorDataError;
    }

    // Check if date range is not too large (max 1 year)
    const maxRangeMs = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds
    if (toDate.getTime() - fromDate.getTime() > maxRangeMs) {
      throw {
        type: 'validation',
        message: 'Rentang tanggal maksimal adalah 1 tahun',
        code: 'DATE_RANGE_TOO_LARGE'
      } as SensorDataError;
    }
  }

  /**
   * Fetch sensor history data for a specific device
   * GET /sensors/{deviceId}/history
   */
  static async getSensorData(params: SensorHistoryParams): Promise<SensorHistoryResponse> {
    // Validate parameters first
    this.validateSensorHistoryParams(params);

    return this.executeWithRetry(async () => {
      try {
        // Determine granularity for aggregate endpoint
        const fromMs = new Date(params.from).getTime();
        const toMs = new Date(params.to).getTime();
        const rangeDays = Math.max(1, Math.floor((toMs - fromMs) / (24 * 60 * 60 * 1000)));
        const effectiveGranularity: 'hourly' | 'daily' = params.granularity ?? (rangeDays <= 31 ? 'hourly' : 'daily');

        const queryParams = new URLSearchParams({
          page: params.page.toString(),
          limit: params.limit.toString(),
          from: params.from,
          to: params.to,
          granularity: effectiveGranularity,
          orderBy: params.orderBy,
        });

        // Use aggregate endpoint per docs for table data
        const response = await apiClient.get(`/sensors/${params.deviceId}/aggregate?${queryParams}`);
        
        // Validate response structure
        if (!response.data || typeof response.data !== 'object') {
          throw {
            type: 'data',
            message: 'Format respons API tidak valid',
            code: 'INVALID_RESPONSE_FORMAT'
          } as SensorDataError;
        }

        const payload = response.data;
        const status = payload?.status ?? 'success';
        const rows: any[] = Array.isArray(payload?.data) ? payload.data : [];

        if (!Array.isArray(rows)) {
          throw {
            type: 'data',
            message: 'Data respons tidak lengkap atau format tidak sesuai',
            code: 'INCOMPLETE_RESPONSE'
          } as SensorDataError;
        }

        // Normalize aggregate rows (bucket + avg_* fields) into UI's SensorReading shape
        const normalized: SensorReading[] = rows.map((row: any) => {
          const time = row.bucket || row.time || row.timestamp;
          const phVal = row.avg_ph;
          const tdsVal = row.avg_tds;
          const doVal = row.avg_do_level ?? row.avg_do;
          const tempVal = row.avg_temperature ?? row.temperature;

          return {
            time: String(time),
            timestamp: String(time),
            device_id: String(row.device_id ?? params.deviceId),
            temperature: { value: Number(tempVal ?? 0), status: 'GOOD' as SensorStatus },
            ph: { raw: 0, voltage: 0, calibrated: Number(phVal ?? 0), calibrated_ok: true, status: 'GOOD' as SensorStatus },
            tds: { raw: 0, voltage: 0, calibrated: Number(tdsVal ?? 0), calibrated_ok: true, status: 'GOOD' as SensorStatus },
            do_level: { raw: 0, voltage: 0, calibrated: Number(doVal ?? 0), calibrated_ok: true, status: 'GOOD' as SensorStatus },
          } satisfies SensorReading;
        });

        // Return validated response
        return {
          status: status as 'success' | 'error',
          data: normalized,
          metadata: payload.metadata || payload.pagination || {
            timestamp: new Date().toISOString(),
            path: `/sensors/${params.deviceId}/aggregate`,
            executionTime: 0
          }
        };
      } catch (error) {
        throw this.parseApiError(error);
      }
    }, 'getSensorData');
  }

  /**
   * Fetch all sensor data within range (paginate internally)
   */
  static async getAllSensorData(args: {
    deviceId: string;
    from: string;
    to: string;
    orderBy?: 'ASC' | 'DESC';
    granularity?: 'hourly' | 'daily';
  }): Promise<SensorHistoryResponse> {
    const orderBy = args.orderBy || 'DESC';
    const pageLimit = 100; // max allowed per docs

    let page = 1;
    let allRows: any[] = [];
    let hasNext: boolean | null = null;

    // Loop pages until finished
    // Add a hard cap of 10k rows to prevent runaway in case of bad metadata
    const maxRows = 10000;
    while (true) {
      const chunk = await this.getSensorData({
        deviceId: args.deviceId,
        page,
        limit: pageLimit,
        from: args.from,
        to: args.to,
        orderBy,
        granularity: args.granularity,
      });

      allRows = allRows.concat(chunk.data);

      const meta: any = chunk.metadata || {};
      if (typeof meta.hasNext === 'boolean') {
        hasNext = meta.hasNext;
      } else if (typeof meta.totalPages === 'number' && typeof meta.page === 'number') {
        hasNext = meta.page < meta.totalPages;
      } else {
        // Fallback based on page size
        hasNext = (chunk.data?.length || 0) === pageLimit;
      }

      if (!hasNext || allRows.length >= maxRows) break;
      page += 1;
    }

    return {
      status: 'success',
      data: allRows,
      metadata: {
        timestamp: new Date().toISOString(),
        path: `/sensors/${args.deviceId}/aggregate`,
        executionTime: 0,
        total: allRows.length,
        page: 1,
        limit: allRows.length,
        totalPages: 1,
      } as any,
    };
  }

  /**
   * Fetch devices for device selector
   * GET /devices (simplified version for dropdown)
   */
  static async getDevices(): Promise<Device[]> {
    return this.executeWithRetry(async () => {
      try {
        // Use a simplified query to get all devices for dropdown
        const response = await apiClient.get('/devices?limit=1000');
        
        // Handle the nested response structure from the API
        const { data } = response.data;
        
        if (!Array.isArray(data)) {
          throw {
            type: 'data',
            message: 'Format data perangkat tidak valid',
            code: 'INVALID_DEVICES_FORMAT'
          } as SensorDataError;
        }

        // Transform and sort devices for dropdown use
        const devices: Device[] = data.map((device: any) => ({
          id: device.id || device.device_id, // Fallback for id field
          device_id: device.device_id,
          name: device.device_name || device.name || device.device_id,
          status: device.last_seen && new Date(device.last_seen) > new Date(Date.now() - 5 * 60 * 1000) 
            ? 'online' 
            : 'offline'
        }));

        // Sort devices: online devices first, then by name
        return devices.sort((a, b) => {
          // Online devices first
          if (a.status !== b.status) {
            return a.status === 'online' ? -1 : 1;
          }
          
          // Then sort by device name
          return a.name.localeCompare(b.name);
        });
      } catch (error) {
        throw this.parseApiError(error);
      }
    }, 'getDevices');
  }

  /**
   * Check if a device exists and has sensor data
   * GET /devices/{deviceId}
   */
  static async checkDeviceExists(deviceId: string): Promise<boolean> {
    if (!deviceId || typeof deviceId !== 'string') {
      return false;
    }

    try {
      await apiClient.get(`/devices/${deviceId}`);
      return true;
    } catch (error) {
      const sensorDataError = this.parseApiError(error);
      
      // Device not found is expected for non-existent devices
      if (sensorDataError.code === 'NOT_FOUND') {
        return false;
      }
      
      // For other errors, we assume device might exist but there's a different issue
      console.warn('Error checking device existence:', sensorDataError);
      return false;
    }
  }
}

// Query keys for TanStack Query integration
export const sensorDataKeys = {
  all: ['sensorData'] as const,
  devices: () => [...sensorDataKeys.all, 'devices'] as const,
  history: () => [...sensorDataKeys.all, 'history'] as const,
  historyByDevice: (deviceId: string) => [...sensorDataKeys.history(), deviceId] as const,
  historyWithParams: (params: SensorHistoryParams) => [...sensorDataKeys.historyByDevice(params.deviceId), params] as const,
};
