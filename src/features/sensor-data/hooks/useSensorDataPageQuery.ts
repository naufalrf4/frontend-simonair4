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
  granularity?: 'auto' | 'hourly' | 'daily';
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
  granularity: granularityPref = 'auto',
  enabled = true
}: UseSensorDataQueryOptions) => {
  // Determine granularity for aggregated table per docs: ≤31 days -> hourly, else daily
  const rangeMs = dateRange?.to?.getTime?.() - dateRange?.from?.getTime?.();
  const days = isFinite(rangeMs) ? Math.max(1, Math.floor(rangeMs / (24 * 60 * 60 * 1000))) : 7;
  const computedGranularity: 'hourly' | 'daily' = days <= 31 ? 'hourly' : 'daily';
  const granularity: 'hourly' | 'daily' = granularityPref === 'hourly' || granularityPref === 'daily'
    ? granularityPref
    : computedGranularity;
  if (limit === 'all') {
    // Fetch all pages within range
    const result = useQuery({
      queryKey: [...sensorDataKeys.historyByDevice(deviceId), 'all', {
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString(),
        orderBy,
        granularity,
      }],
      queryFn: () => SensorDataService.getAllSensorData({
        deviceId,
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString(),
        orderBy,
        granularity,
      }),
      enabled: enabled && !!deviceId,
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
    });

    return {
      ...result,
      data: result.data?.data,
      metadata: result.data?.metadata,
    } as typeof result & { data: any; metadata: any };
  }

  const params: SensorHistoryParams = {
    deviceId,
    page,
    limit,
    from: dateRange.from.toISOString(),
    to: dateRange.to.toISOString(),
    orderBy,
    granularity,
  };

  const result = useSensorDataQuery(params, enabled);

  return {
    ...result,
    data: result.data?.data, // Extract the data array from the response
    metadata: result.data?.metadata,
  } as typeof result & { data: any; metadata: any };
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
