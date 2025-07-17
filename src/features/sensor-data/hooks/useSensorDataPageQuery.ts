import { useSensorDataQuery, useDevicesQuery as useDevicesQueryBase } from './useSensorDataQuery';
import type { DateRange, SensorHistoryParams } from '../types';

interface UseSensorDataQueryOptions {
  deviceId: string;
  dateRange: DateRange;
  page?: number;
  limit?: number;
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
  limit = 1000,
  orderBy = 'DESC',
  enabled = true
}: UseSensorDataQueryOptions) => {
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