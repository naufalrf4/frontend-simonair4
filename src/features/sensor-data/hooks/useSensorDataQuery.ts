import { useQuery, useQueryClient } from '@tanstack/react-query';
import { SensorDataService, sensorDataKeys } from '../services/sensorDataService';
import type { SensorHistoryParams, SensorDataError } from '../types';

/**
 * Hook for fetching sensor history data with caching and error handling
 */
export function useSensorDataQuery(params: SensorHistoryParams, enabled = true) {
  return useQuery({
    queryKey: sensorDataKeys.historyWithParams(params),
    queryFn: () => SensorDataService.getSensorData(params),
    enabled: enabled && !!params.deviceId,
    staleTime: 30 * 1000, // 30 seconds - data is relatively fresh
    gcTime: 5 * 60 * 1000, // 5 minutes - keep in cache for navigation
    retry: (failureCount, error: any) => {
      // Don't retry validation errors or data errors
      if (error && typeof error === 'object' && 'type' in error) {
        const sensorError = error as SensorDataError;
        if (sensorError.type === 'validation' || sensorError.type === 'data') {
          return false;
        }
        // Only retry network errors
        return sensorError.type === 'network' && failureCount < 3;
      }
      
      // Fallback retry logic for unknown error types
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false; // Don't retry client errors
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
}

/**
 * Hook for fetching devices for device selector with caching
 */
export function useDevicesQuery(enabled = true) {
  return useQuery({
    queryKey: sensorDataKeys.devices(),
    queryFn: () => SensorDataService.getDevices(),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes - devices don't change frequently
    gcTime: 10 * 60 * 1000, // 10 minutes - keep devices in cache longer
    retry: (failureCount, error: any) => {
      // Don't retry validation errors or data errors
      if (error && typeof error === 'object' && 'type' in error) {
        const sensorError = error as SensorDataError;
        if (sensorError.type === 'validation' || sensorError.type === 'data') {
          return false;
        }
        // Only retry network errors
        return sensorError.type === 'network' && failureCount < 3;
      }
      
      // Fallback retry logic for unknown error types
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false; // Don't retry client errors
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
}

/**
 * Hook for checking if a device exists (used for validation)
 */
export function useDeviceExistsQuery(deviceId: string, enabled = true) {
  return useQuery({
    queryKey: [...sensorDataKeys.devices(), 'exists', deviceId],
    queryFn: () => SensorDataService.checkDeviceExists(deviceId),
    enabled: enabled && !!deviceId,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry existence checks
  });
}

/**
 * Hook for prefetching sensor data (useful for preloading next page)
 */
export function usePrefetchSensorData() {
  const queryClient = useQueryClient();
  
  return (params: SensorHistoryParams) => {
    queryClient.prefetchQuery({
      queryKey: sensorDataKeys.historyWithParams(params),
      queryFn: () => SensorDataService.getSensorData(params),
      staleTime: 30 * 1000,
    });
  };
}

/**
 * Hook for invalidating sensor data cache (useful for real-time updates)
 */
export function useInvalidateSensorData() {
  const queryClient = useQueryClient();
  
  return {
    // Invalidate all sensor data
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: sensorDataKeys.all });
    },
    
    // Invalidate sensor data for specific device
    invalidateDevice: (deviceId: string) => {
      queryClient.invalidateQueries({ queryKey: sensorDataKeys.historyByDevice(deviceId) });
    },
    
    // Invalidate devices list
    invalidateDevices: () => {
      queryClient.invalidateQueries({ queryKey: sensorDataKeys.devices() });
    },
    
    // Manually update sensor data cache with new data
    updateSensorData: (params: SensorHistoryParams, newData: any) => {
      queryClient.setQueryData(sensorDataKeys.historyWithParams(params), newData);
    }
  };
}