import { useQuery } from '@tanstack/react-query';
import { FeedsService, feedKeys } from '../services/feedsService';
import type { FeedListParams, FeedListResponse } from '../types';

export function useFeedsListQuery(params: FeedListParams) {
  return useQuery<FeedListResponse>({
    queryKey: feedKeys.list(params),
    queryFn: () => FeedsService.list(params),
    enabled: Boolean(params.deviceId),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.response?.status >= 400 && error?.response?.status < 500) return false;
      return failureCount < 3;
    },
  });
}

