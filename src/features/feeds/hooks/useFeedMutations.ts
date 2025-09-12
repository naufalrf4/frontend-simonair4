import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FeedsService, feedKeys } from '../services/feedsService';
import type { FeedListParams, FeedRecord, FeedType } from '../types';

export function useCreateFeedMutation(params?: Partial<FeedListParams>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { deviceId: string; feedName: string; feedType: FeedType; feedAmountKg: number; feedingSchedule?: Record<string, any> | null }) =>
      FeedsService.create(data),
    onSuccess: (_, variables) => {
      if (variables?.deviceId) {
        qc.invalidateQueries({ queryKey: feedKeys.list({ deviceId: variables.deviceId, page: params?.page, limit: params?.limit, startDate: params?.startDate, endDate: params?.endDate }) });
      } else {
        qc.invalidateQueries({ queryKey: feedKeys.all as any });
      }
    },
  });
}

export function useUpdateFeedMutation(params?: Partial<FeedListParams>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Pick<FeedRecord, 'feedName' | 'feedType' | 'feedAmountKg' | 'feedingSchedule'>> }) =>
      FeedsService.update(id, data as any),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: feedKeys.detail((variables as any).id) });
      qc.invalidateQueries({ queryKey: feedKeys.all as any });
      if (params?.deviceId) {
        qc.invalidateQueries({ queryKey: feedKeys.list(params as FeedListParams) });
      }
    },
  });
}

export function useUpdateScheduleMutation(params?: Partial<FeedListParams>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, schedule }: { id: string; schedule: Record<string, any> }) => FeedsService.updateSchedule(id, schedule),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: feedKeys.detail((variables as any).id) });
      if (params?.deviceId) {
        qc.invalidateQueries({ queryKey: feedKeys.list(params as FeedListParams) });
      }
    },
  });
}

