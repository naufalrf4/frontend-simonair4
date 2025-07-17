import { useQuery } from '@tanstack/react-query';
import { DevicesService, deviceKeys } from '../services/devicesService';
import type { GetDevicesParams } from '../types';
import { DeviceError, isRetryableError } from '../utils/errorHandling';

/**
 * Hook for fetching devices with pagination and search
 */
export function useDevicesQuery(params: GetDevicesParams = {}) {
  return useQuery({
    queryKey: deviceKeys.list(params),
    queryFn: () => DevicesService.getDevices(params),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Use enhanced error handling for retry logic
      if (error instanceof DeviceError) {
        return isRetryableError(error) && failureCount < 3;
      }
      
      // Fallback to original logic for non-DeviceError instances
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Hook for fetching a single device
 */
export function useDeviceQuery(deviceId: string, enabled = true) {
  return useQuery({
    queryKey: deviceKeys.detail(deviceId),
    queryFn: () => DevicesService.getDevice(deviceId),
    enabled: enabled && !!deviceId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Use enhanced error handling for retry logic
      if (error instanceof DeviceError) {
        return isRetryableError(error) && failureCount < 3;
      }
      
      // Fallback to original logic for non-DeviceError instances
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Hook for checking device ID availability
 */
export function useDeviceIdAvailabilityQuery(deviceId: string, enabled = true) {
  return useQuery({
    queryKey: deviceKeys.availability(deviceId),
    queryFn: () => DevicesService.checkDeviceIdAvailability(deviceId),
    enabled: enabled && !!deviceId && deviceId.length > 0,
    staleTime: 10 * 1000, // 10 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    retry: false, // Don't retry availability checks
  });
}