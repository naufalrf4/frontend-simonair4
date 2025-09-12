import { useQuery } from '@tanstack/react-query';
import { SensorSeriesService, type SensorSeriesParams, seriesKeys } from '../services/sensorSeriesService';

export function useSensorSeriesQuery(params: SensorSeriesParams, enabled = true) {
  return useQuery({
    queryKey: seriesKeys.withParams(params),
    queryFn: () => SensorSeriesService.getSeries(params),
    enabled: enabled && !!params.deviceId,
    staleTime: 5 * 60 * 1000,
  });
}

