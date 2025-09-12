import { useQuery } from '@tanstack/react-query'
import { WaterChangesService, waterChangesKeys } from '../services/waterChangesService'
import type { WaterChangesListParams, WaterChangesListResponse } from '../types'

export function useWaterChangesListQuery(params: WaterChangesListParams) {
  return useQuery<WaterChangesListResponse>({
    queryKey: waterChangesKeys.list(params),
    queryFn: () => WaterChangesService.list(params),
    enabled: Boolean(params.deviceId),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.response?.status >= 400 && error?.response?.status < 500) return false
      return failureCount < 3
    },
  })
}

