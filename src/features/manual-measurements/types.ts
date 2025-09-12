export type MeasurementType = 'temperature' | 'ph' | 'tds' | 'do_level';

export interface ManualValues {
  temperature?: number | null;
  ph?: number | null;
  tds?: number | null;
  do_level?: number | null;
}

export interface ManualMeasurementUser {
  id: string;
  name?: string | null;
  email?: string | null;
}

export interface ManualMeasurementDevice {
  device_id: string;
  device_name?: string | null;
}

export interface MeasurementComparison {
  sensor_data_available: boolean;
  sensor_timestamp: string | null;
  time_difference_minutes: number | null;
  temperature_difference?: number | null;
  ph_difference?: number | null;
  tds_difference?: number | null;
  do_level_difference?: number | null;
  accuracy_assessment:
    | 'EXCELLENT'
    | 'GOOD'
    | 'FAIR'
    | 'POOR'
    | 'VERY_POOR'
    | 'UNAVAILABLE';
  flags?: string[];
  sensor_values?: ManualValues | null;
  manual_values: ManualValues;
}

export interface ManualMeasurement {
  id: string;
  device_id: string;
  measured_by: string;
  measurement_timestamp: string; // ISO
  temperature?: number | null;
  ph?: number | null;
  tds?: number | null;
  do_level?: number | null;
  notes?: string | null;
  created_at: string; // ISO
  user?: ManualMeasurementUser;
  device?: ManualMeasurementDevice;
  comparison?: MeasurementComparison;
}

export interface MeasurementComparisonResponse {
  manual_measurement_id: string;
  device_id: string;
  manual_timestamp: string;
  sensor_data_available: boolean;
  sensor_timestamp: string | null;
  time_difference_minutes: number | null;
  search_window_minutes: number;
  manual_values: ManualValues;
  sensor_values?: ManualValues | null;
  absolute_differences?: ManualValues | null;
  percentage_differences?: ManualValues | null;
  accuracy_assessment: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'UNAVAILABLE';
  flags?: string[];
  summary?: string;
  recommendations?: string[];
  compared_at: string;
  comparison_quality_score?: number;
}

export interface ManualMeasurementsListParams {
  deviceId: string;
  startDate?: string; // ISO or YYYY-MM-DD
  endDate?: string; // ISO or YYYY-MM-DD
  page?: number; // 1-based
  limit?: number; // 1..100
  sortBy?: 'measurement_timestamp' | 'created_at' | 'temperature' | 'ph' | 'tds' | 'do_level';
  sortOrder?: 'ASC' | 'DESC';
  search?: string; // notes contains
  includeComparison?: boolean;
  measurementType?: MeasurementType;
  measuredBy?: string; // uuid, admins only
}

export interface ManualMeasurementsListResponse {
  items: ManualMeasurement[];
  total: number;
  page: number;
  pageCount: number;
  limit: number;
}

export interface CreateManualMeasurementDto extends ManualValues {
  measurement_timestamp: string; // ISO
  notes?: string | null;
  compare_with_sensor?: boolean;
}

export interface UpdateManualMeasurementDto extends ManualValues {
  measurement_timestamp?: string; // ISO
  notes?: string | null;
  compare_after_update?: boolean;
}

export interface CompareManualMeasurementDto {
  manual_measurement_id: string;
  compare_timestamp?: string;
  time_window?: number; // minutes
  include_accuracy?: boolean;
  include_statistics?: boolean;
}

export const manualMeasurementKeys = {
  all: ['manual-measurements'] as const,
  list: (params: ManualMeasurementsListParams) => [...manualMeasurementKeys.all, 'list', params] as const,
  detail: (id: string) => [...manualMeasurementKeys.all, 'detail', id] as const,
  compare: (id: string, body: CompareManualMeasurementDto) => [...manualMeasurementKeys.all, 'compare', id, body] as const,
  compareLatest: (deviceId: string, timeWindow: number) => [...manualMeasurementKeys.all, 'compare-latest', deviceId, timeWindow] as const,
};

