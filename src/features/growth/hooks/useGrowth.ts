import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GrowthService, growthKeys } from '../services/growthService';
import type { GrowthListParams, GrowthListResponse, FishGrowth } from '../types';

export function useGrowthList(params: GrowthListParams) {
  return useQuery<GrowthListResponse>({
    queryKey: growthKeys.list(params),
    queryFn: () => GrowthService.listPaginated(params),
    enabled: Boolean(params.deviceId),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}

export function useGrowthDetail(id: string) {
  return useQuery<FishGrowth>({
    queryKey: growthKeys.detail(id),
    queryFn: () => GrowthService.detail(id),
    enabled: Boolean(id),
  });
}

export function useCreateGrowth(params?: GrowthListParams) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ deviceId, dto }: { deviceId: string; dto: Partial<Pick<FishGrowth,'measurement_date'|'length_cm'|'weight_gram'|'notes'>> }) =>
      GrowthService.create(deviceId, dto),
    onSuccess: () => {
      if (params) qc.invalidateQueries({ queryKey: growthKeys.list(params) });
    },
  });
}

export function useUpdateGrowth(params?: GrowthListParams) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<Pick<FishGrowth,'measurement_date'|'length_cm'|'weight_gram'|'notes'>> }) =>
      GrowthService.update(id, dto),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: growthKeys.detail(id) });
      if (params) qc.invalidateQueries({ queryKey: growthKeys.list(params) });
    },
  });
}

export function useDeleteGrowth(params?: GrowthListParams) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => GrowthService.remove(id),
    onSuccess: () => {
      if (params) qc.invalidateQueries({ queryKey: growthKeys.list(params) });
    },
  });
}

