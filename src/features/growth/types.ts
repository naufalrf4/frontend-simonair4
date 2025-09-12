export type ConditionIndicator = 'Poor' | 'Good' | 'Excellent';

export interface FishGrowth {
  id: string;
  device_id: string;
  measurement_date: string; // ISO
  length_cm?: number | null;
  weight_gram?: number | null;
  condition_indicator?: ConditionIndicator | null;
  notes?: string | null;
  created_at: string; // ISO
}

export interface GrowthListParams {
  deviceId: string;
  startDate?: string; // ISO
  endDate?: string;   // ISO
  limit?: number;
  page?: number; // 1-based
  sortBy?: 'measurement_date' | 'created_at' | 'weight_gram' | 'length_cm';
  sortOrder?: 'ASC' | 'DESC';
  minWeight?: number;
  maxWeight?: number;
  minLength?: number;
  maxLength?: number;
  conditionIndicator?: ConditionIndicator;
  search?: string;
}

export interface GrowthListResponse {
  items: FishGrowth[];
  total: number;
  page: number;
  pageCount: number;
  limit: number;
}

