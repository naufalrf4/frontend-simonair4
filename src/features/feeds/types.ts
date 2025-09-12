export type FeedType = 'natural' | 'artificial';

export interface FeedRecord {
  id: string;
  deviceId: string;
  feedName: string;
  feedType: FeedType;
  feedAmountKg: number;
  feedingSchedule?: Record<string, any> | null;
  fedAt?: string; // ISO event time
  createdAt: string; // ISO
}

export interface FeedListParams {
  deviceId: string;
  page?: number;
  limit?: number;
  startDate?: string; // ISO or YYYY-MM-DD
  endDate?: string;   // ISO or YYYY-MM-DD
}

export interface FeedListResponse {
  items: FeedRecord[];
  total: number;
  page: number;
  limit: number;
}
