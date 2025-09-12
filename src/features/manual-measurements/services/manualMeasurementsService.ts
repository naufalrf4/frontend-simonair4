import { apiClient } from '@/utils/apiClient';
import type {
  ManualMeasurementsListParams,
  ManualMeasurementsListResponse,
  ManualMeasurement,
  CreateManualMeasurementDto,
  UpdateManualMeasurementDto,
  MeasurementComparisonResponse,
  CompareManualMeasurementDto,
} from '../types';

function mapManualValues(raw: any) {
  if (!raw || typeof raw !== 'object') return {} as any;
  return {
    temperature: raw.temperature ?? raw.temp ?? null,
    ph: raw.ph ?? null,
    tds: raw.tds ?? null,
    do_level: raw.do_level ?? raw.doLevel ?? raw.do ?? null,
  } as any;
}

function mapComparisonResponse(raw: any): MeasurementComparisonResponse {
  const manualValues = mapManualValues(raw?.manual_values ?? raw?.manualValues);
  const sensorValues = raw?.sensor_values ?? raw?.sensorValues ? mapManualValues(raw?.sensor_values ?? raw?.sensorValues) : null;
  const absDiff = raw?.absolute_differences ?? raw?.absoluteDifferences ? mapManualValues(raw?.absolute_differences ?? raw?.absoluteDifferences) : null;
  const pctDiff = raw?.percentage_differences ?? raw?.percentageDifferences ? mapManualValues(raw?.percentage_differences ?? raw?.percentageDifferences) : null;

  return {
    manual_measurement_id: raw?.manual_measurement_id ?? raw?.manualMeasurementId ?? '',
    device_id: raw?.device_id ?? raw?.deviceId ?? '',
    manual_timestamp: raw?.manual_timestamp ?? raw?.manualTimestamp ?? '',
    sensor_data_available: Boolean(raw?.sensor_data_available ?? raw?.sensorDataAvailable),
    sensor_timestamp: raw?.sensor_timestamp ?? raw?.sensorTimestamp ?? null,
    time_difference_minutes: raw?.time_difference_minutes ?? raw?.timeDifferenceMinutes ?? null,
    search_window_minutes: raw?.search_window_minutes ?? raw?.searchWindowMinutes ?? 0,
    manual_values: manualValues,
    sensor_values: sensorValues,
    absolute_differences: absDiff,
    percentage_differences: pctDiff,
    accuracy_assessment: raw?.accuracy_assessment ?? raw?.accuracyAssessment ?? 'UNAVAILABLE',
    flags: raw?.flags ?? [],
    summary: raw?.summary ?? undefined,
    recommendations: raw?.recommendations ?? undefined,
    compared_at: raw?.compared_at ?? raw?.comparedAt ?? new Date().toISOString(),
    comparison_quality_score: raw?.comparison_quality_score ?? raw?.comparisonQualityScore ?? undefined,
  } as MeasurementComparisonResponse;
}

function mapListResponse(raw: any): ManualMeasurementsListResponse {
  const data = raw?.data ?? [];
  const meta = raw?.meta ?? {};
  const total = meta?.total ?? (Array.isArray(data) ? data.length : 0);
  const page = meta?.page ?? 1;
  const limit = (meta?.limit ?? (Array.isArray(data) ? data.length : undefined)) || 10;
  const pageCount = meta?.totalPages ?? Math.max(1, Math.ceil(total / Math.max(1, limit)));
  return {
    items: data as ManualMeasurement[],
    total,
    page,
    pageCount,
    limit,
  };
}

export class ManualMeasurementsService {
  static async list(deviceId: string, params: ManualMeasurementsListParams): Promise<ManualMeasurementsListResponse> {
    const query = new URLSearchParams();
    // Date filters (ISO); backend accepts startDate/endDate
    if (params.startDate) query.set('startDate', params.startDate);
    if (params.endDate) query.set('endDate', params.endDate);

    // Pagination: backend expects limit + offset (not page). Compute offset.
    const limit = params.limit ?? 10;
    const page = params.page ?? 1;
    const offset = Math.max(0, (page - 1) * limit);
    query.set('limit', String(limit));
    query.set('offset', String(offset));

    // Sorting
    if (params.sortBy) query.set('sortBy', params.sortBy);
    if (params.sortOrder) query.set('sortOrder', params.sortOrder.toUpperCase() as 'ASC' | 'DESC');

    // Search & options
    if (params.search) query.set('search', params.search);
    if (params.includeComparison !== undefined) query.set('include_comparison', String(params.includeComparison));
    if (params.measurementType) query.set('measurement_type', params.measurementType);
    if (params.measuredBy) query.set('measured_by', params.measuredBy);

    const res = await apiClient.get(`/manual-measurements/${encodeURIComponent(deviceId)}?${query.toString()}`);
    return mapListResponse(res.data);
  }

  static async create(deviceId: string, dto: CreateManualMeasurementDto): Promise<ManualMeasurement> {
    const res = await apiClient.post(`/manual-measurements/${encodeURIComponent(deviceId)}`, dto);
    const payload = (res.data?.data ?? res.data) as ManualMeasurement;
    return payload;
  }

  static async update(id: string, dto: UpdateManualMeasurementDto): Promise<ManualMeasurement> {
    const res = await apiClient.patch(`/manual-measurements/record/${encodeURIComponent(id)}`, dto);
    const payload = (res.data?.data ?? res.data) as ManualMeasurement;
    return payload;
  }

  static async detail(id: string, includeComparison = false): Promise<ManualMeasurement> {
    const res = await apiClient.get(`/manual-measurements/record/${encodeURIComponent(id)}?include_comparison=${includeComparison}`);
    const payload = (res.data?.data ?? res.data) as ManualMeasurement;
    return payload;
  }

  static async compare(id: string, body: Omit<CompareManualMeasurementDto, 'manual_measurement_id'> & { manual_measurement_id: string }): Promise<MeasurementComparisonResponse> {
    const res = await apiClient.post(`/manual-measurements/record/${encodeURIComponent(id)}/compare`, body);
    const raw = res.data?.data ?? res.data;
    return mapComparisonResponse(raw);
  }
}

export const manualMeasurementsKeys = {
  all: ['manual-measurements'] as const,
  list: (deviceId: string, params: ManualMeasurementsListParams) => [...manualMeasurementsKeys.all, 'list', deviceId, params] as const,
  detail: (id: string, includeComparison = false) => [...manualMeasurementsKeys.all, 'detail', id, includeComparison] as const,
  compare: (id: string, body: CompareManualMeasurementDto) => [...manualMeasurementsKeys.all, 'compare', id, body] as const,
};
