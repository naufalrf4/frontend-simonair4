import { useSensorDataQuery, useDevicesQuery as useDevicesQueryBase } from './useSensorDataQuery';
import { useQuery } from '@tanstack/react-query';
import { SensorDataService, sensorDataKeys } from '../services/sensorDataService';
import type { DateRange, SensorHistoryParams } from '../types';

interface UseSensorDataQueryOptions {
  deviceId: string;
  dateRange: DateRange;
  page?: number;
  limit?: number | 'all';
  orderBy?: 'ASC' | 'DESC';
  enabled?: boolean;
}

/**
 * Wrapper hook for sensor data query that matches SensorDataPage interface
 */
export const useSensorDataPageQuery = ({
  deviceId,
  dateRange,
  page = 1,
  limit = 100,
  orderBy = 'DESC',
  enabled = true
}: UseSensorDataQueryOptions) => {
  if (limit === 'all') {
    // Fetch all pages within range
    const result = useQuery({
      queryKey: [...sensorDataKeys.historyByDevice(deviceId), 'all', {
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString(),
        orderBy,
      }],
      queryFn: () => SensorDataService.getAllSensorData({
        deviceId,
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString(),
        orderBy,
      }),
      enabled: enabled && !!deviceId,
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
    });

    return {
      ...result,
      data: result.data?.data,
    };
  }

  const params: SensorHistoryParams = {
    deviceId,
    page,
    limit,
    from: dateRange.from.toISOString(),
    to: dateRange.to.toISOString(),
    orderBy
  };

  const result = useSensorDataQuery(params, enabled);

  return {
    ...result,
    data: result.data?.data, // Extract the data array from the response
  };
};

/**
 * Wrapper hook for devices query that matches SensorDataPage interface
 */
export const useDevicesPageQuery = (enabled = true) => {
  const result = useDevicesQueryBase(enabled);

  return {
    ...result,
    data: result.data, // Devices are already in the correct format
  };
};
