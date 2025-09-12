import { apiClient } from '@/utils/apiClient';
import type { FeedListParams, FeedListResponse, FeedRecord, FeedType } from '../types';

function mapApiFeed(f: any): FeedRecord {
  return {
    id: f.id,
    deviceId: f?.device?.device_id ?? f.device_id ?? f.device_uuid,
    feedName: f.feed_name,
    feedType: f.feed_type as FeedType,
    feedAmountKg: Number(f.feed_amount_kg ?? 0),
    feedingSchedule: f.feeding_schedule ?? null,
    fedAt: f.fed_at ?? null,
    createdAt: f.fed_at ?? f.created_at,
  };
}

export class FeedsService {
  static async list(params: FeedListParams): Promise<FeedListResponse> {
    const { deviceId, page = 1, limit = 10, startDate, endDate } = params;
    const query = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (startDate) query.set('startDate', startDate);
    if (endDate) query.set('endDate', endDate);

    const res = await apiClient.get(`/feed/device/${encodeURIComponent(deviceId)}?${query.toString()}`);
    const raw = res.data;
    const itemsRaw = raw?.items ?? raw?.data?.items ?? [];
    const items: FeedRecord[] = Array.isArray(itemsRaw) ? itemsRaw.map(mapApiFeed) : [];
    return {
      items,
      total: raw?.total ?? raw?.pagination?.total ?? items.length,
      page: raw?.page ?? raw?.pagination?.page ?? page,
      limit: raw?.limit ?? raw?.pagination?.limit ?? limit,
    };
  }

  static async create(data: {
    deviceId: string;
    feedName: string;
    feedType: FeedType;
    feedAmountKg: number;
    feedingSchedule?: Record<string, any> | null;
    fedAt?: string | null;
  }): Promise<FeedRecord> {
    const payload: any = {
      device_id: data.deviceId,
      feed_name: data.feedName,
      feed_type: data.feedType,
      feed_amount_kg: data.feedAmountKg,
    };
    if (data.feedingSchedule !== undefined) payload.feeding_schedule = data.feedingSchedule;
    if (data.fedAt) payload.fed_at = data.fedAt;
    const res = await apiClient.post('/feed', payload);
    const raw = res.data?.data ?? res.data;
    return mapApiFeed(raw);
  }

  static async getById(id: string): Promise<FeedRecord> {
    const res = await apiClient.get(`/feed/by-id/${encodeURIComponent(id)}`);
    const raw = res.data?.data ?? res.data;
    return mapApiFeed(raw);
  }

  static async update(
    id: string,
    data: Partial<{ feedName: string; feedType: FeedType; feedAmountKg: number; feedingSchedule: Record<string, any> | null }>,
  ): Promise<FeedRecord> {
    const payload: Record<string, any> = {};
    if (data.feedName !== undefined) payload.feed_name = data.feedName;
    if (data.feedType !== undefined) payload.feed_type = data.feedType;
    if (data.feedAmountKg !== undefined) payload.feed_amount_kg = data.feedAmountKg;
    if (data.feedingSchedule !== undefined) payload.feeding_schedule = data.feedingSchedule;
    if ((data as any).fedAt !== undefined) payload.fed_at = (data as any).fedAt;
    const res = await apiClient.put(`/feed/${encodeURIComponent(id)}`, payload);
    const raw = res.data?.data ?? res.data;
    return mapApiFeed(raw);
  }

  static async updateSchedule(id: string, schedule: Record<string, any>): Promise<FeedRecord> {
    const res = await apiClient.put(`/feed/${encodeURIComponent(id)}/schedule`, { schedule });
    const raw = res.data?.data ?? res.data;
    return mapApiFeed(raw);
  }
}

export const feedKeys = {
  all: ['feeds'] as const,
  list: (params: FeedListParams) => ['feeds', params] as const,
  detail: (id: string) => ['feeds', id] as const,
};
