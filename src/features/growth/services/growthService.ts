import { apiClient } from '@/utils/apiClient';
import type { FishGrowth, GrowthListParams, GrowthListResponse } from '../types';

function mapListResponse(raw: any): GrowthListResponse {
  const data = raw?.data ?? raw?.items ?? [];
  const total = raw?.total ?? raw?.meta?.total ?? data.length;
  const page = raw?.page ?? raw?.meta?.page ?? 1;
  const limit = raw?.limit ?? raw?.meta?.limit ?? 20;
  const pageCount = raw?.pageCount ?? raw?.totalPages ?? raw?.meta?.totalPages ?? Math.max(1, Math.ceil(total / Math.max(1, limit)));
  return { items: data as FishGrowth[], total, page, pageCount, limit };
}

export class GrowthService {
  static async listPaginated(params: GrowthListParams): Promise<GrowthListResponse> {
    const { deviceId } = params;
    const query = new URLSearchParams();
    if (params.startDate) query.set('startDate', params.startDate);
    if (params.endDate) query.set('endDate', params.endDate);
    const limit = params.limit ?? 20;
    const page = params.page ?? 1;
    const offset = Math.max(0, (page - 1) * limit);
    query.set('limit', String(limit));
    query.set('offset', String(offset));
    if (params.sortBy) query.set('sortBy', params.sortBy);
    if (params.sortOrder) query.set('sortOrder', params.sortOrder);
    if (params.minWeight !== undefined) query.set('minWeight', String(params.minWeight));
    if (params.maxWeight !== undefined) query.set('maxWeight', String(params.maxWeight));
    if (params.minLength !== undefined) query.set('minLength', String(params.minLength));
    if (params.maxLength !== undefined) query.set('maxLength', String(params.maxLength));
    if (params.conditionIndicator) query.set('conditionIndicator', params.conditionIndicator);
    if (params.search) query.set('search', params.search);

    const res = await apiClient.get(`/fish/growth/device/${encodeURIComponent(deviceId)}/paginated?${query.toString()}`);
    return mapListResponse(res.data);
  }

  static async create(deviceId: string, dto: Partial<Pick<FishGrowth,'measurement_date'|'length_cm'|'weight_gram'|'notes'|'condition_indicator'>>): Promise<FishGrowth> {
    const res = await apiClient.post(`/fish/growth/device/${encodeURIComponent(deviceId)}`, dto);
    return res.data as FishGrowth;
  }

  static async update(id: string, dto: Partial<Pick<FishGrowth,'measurement_date'|'length_cm'|'weight_gram'|'notes'|'condition_indicator'>>): Promise<FishGrowth> {
    const res = await apiClient.put(`/fish/growth/${encodeURIComponent(id)}`, dto);
    return res.data as FishGrowth;
  }

  static async remove(id: string): Promise<{ message: string }> {
    const res = await apiClient.delete(`/fish/growth/${encodeURIComponent(id)}`);
    return res.data ?? { message: 'Deleted' };
  }

  static async detail(id: string): Promise<FishGrowth> {
    const res = await apiClient.get(`/fish/growth/${encodeURIComponent(id)}`);
    return res.data as FishGrowth;
  }
}

export const growthKeys = {
  all: ['growth'] as const,
  list: (params: GrowthListParams) => [...growthKeys.all, 'list', params] as const,
  detail: (id: string) => [...growthKeys.all, 'detail', id] as const,
};
