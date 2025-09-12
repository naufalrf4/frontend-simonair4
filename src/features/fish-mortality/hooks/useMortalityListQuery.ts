import { useQuery } from '@tanstack/react-query'
import { MortalityService, mortalityKeys } from '../services/mortalityService'
import type { MortalityListParams, MortalityListResponse } from '../types'

export function useMortalityListQuery(params: MortalityListParams) {
  return useQuery<MortalityListResponse>({
    queryKey: mortalityKeys.list(params),
    queryFn: () => MortalityService.list(params),
    enabled: Boolean(params.deviceId),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.response?.status >= 400 && error?.response?.status < 500) return false
      return failureCount < 3
    },
  })
}

