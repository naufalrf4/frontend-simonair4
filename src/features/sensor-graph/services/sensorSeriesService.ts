import { apiClient } from '@/utils/apiClient';

export type SeriesMetric = 'temperature' | 'ph' | 'tds' | 'do_level';
export type SeriesGranularity = 'auto' | 'hourly' | 'daily';

export type SeriesPoint = [string, number | null];

export interface MetricSeries {
  metric: SeriesMetric;
  unit?: string;
  points: SeriesPoint[];
}

export interface SensorSeriesResponse {
  status: 'success' | 'error';
  data: MetricSeries[];
  metadata: {
    from: string;
    to: string;
    granularity: SeriesGranularity | 'auto';
    effectiveGranularity?: SeriesGranularity;
    order: 'ASC' | 'DESC';
    maxPoints?: number;
    downsampled?: boolean;
  };
}

export interface SensorSeriesParams {
  deviceId: string;
  from: string; // ISO
  to: string;   // ISO
  granularity?: SeriesGranularity | 'auto';
  metrics?: SeriesMetric[];
  order?: 'ASC' | 'DESC';
  maxPoints?: number;
  fill?: 'none' | 'gaps';
  format?: 'series' | 'flat';
}

export class SensorSeriesService {
  static async getSeries(params: SensorSeriesParams): Promise<SensorSeriesResponse> {
    const {
      deviceId,
      from,
      to,
      granularity = 'auto',
      metrics,
      order = 'ASC',
      maxPoints = 500,
      fill = 'none',
      format = 'series',
    } = params;

    if (!deviceId) throw new Error('deviceId is required');

    // Compute effective granularity when 'auto' may not be supported server-side
    const fromMs = new Date(from).getTime();
    const toMs = new Date(to).getTime();
    const rangeHours = Math.max(1, Math.floor((toMs - fromMs) / (60 * 60 * 1000)));
    const effectiveGranularity: SeriesGranularity = granularity === 'auto'
      ? (rangeHours <= 72 ? 'hourly' : 'daily')
      : granularity;

    const search = new URLSearchParams({
      from,
      to,
      granularity: effectiveGranularity,
      order,
      maxPoints: String(maxPoints),
      fill,
      format,
    });
    // Many backends default to all metrics; only send when subset is requested
    const ALL: SeriesMetric[] = ['temperature', 'ph', 'tds', 'do_level'];
    const isAll = !metrics || metrics.length === 0 || ALL.every((m) => metrics.includes(m));
    if (!isAll && metrics) search.set('metrics', metrics.join(','));

    try {
      const res = await apiClient.get(`/sensors/${deviceId}/series?${search.toString()}`);
      const raw = res.data;

      // If backend returns series format (array with { metric, points }) just pass-through
      if (raw?.data && Array.isArray(raw.data)) {
        return raw as SensorSeriesResponse;
      }

      // If backend returns flat format: { data: { metrics: [...], points: [[ts, v1, v2...], ...] } }
      if (raw?.data && raw.data.metrics && Array.isArray(raw.data.points)) {
        const metricsArr = raw.data.metrics as SeriesMetric[];
        const points = raw.data.points as Array<[string, ...number[]]>;

        const seriesMap: Record<string, MetricSeries> = {};
        metricsArr.forEach((m) => {
          seriesMap[m] = { metric: m, points: [] } as MetricSeries;
        });

        for (const row of points) {
          const [ts, ...vals] = row as [string, ...number[]];
          metricsArr.forEach((m, idx) => {
            const val = vals[idx] ?? null;
            seriesMap[m].points.push([ts, Number.isFinite(val as number) ? (val as number) : null]);
          });
        }

        const normalized: SensorSeriesResponse = {
          status: raw.status || 'success',
          data: Object.values(seriesMap),
          metadata: {
            from: raw.metadata?.from ?? (params.from as string),
            to: raw.metadata?.to ?? (params.to as string),
            granularity: raw.metadata?.granularity ?? effectiveGranularity,
            effectiveGranularity: raw.metadata?.effectiveGranularity ?? effectiveGranularity,
            order: raw.metadata?.order ?? (params.order || 'ASC'),
            maxPoints: raw.metadata?.maxPoints ?? params.maxPoints,
            downsampled: raw.metadata?.downsampled,
          },
        };
        return normalized;
      }

      // Fallback - return as-is (let UI handle gracefully)
      return raw as SensorSeriesResponse;
    } catch (err: any) {
      // If server rejects (e.g., granularity=auto not supported), try aggregate fallback
      const status = err?.response?.status;
      if (status === 400 || status === 404 || status === 422) {
        // Aggregate fallback
        const aggParams = new URLSearchParams({
          from,
          to,
          granularity: effectiveGranularity,
          orderBy: 'ASC',
          page: '1',
          limit: '2000',
        });
        const aggRes = await apiClient.get(`/sensors/${deviceId}/aggregate?${aggParams.toString()}`);
        const rawAgg = aggRes.data;
        const rows: Array<{ bucket: string; [k: string]: number | string }> = rawAgg?.data ?? [];

        const metricsFromRows: SeriesMetric[] = ['temperature', 'ph', 'tds', 'do_level'].filter((m) =>
          rows.some((r) => typeof r[`avg_${m}`] !== 'undefined')
        ) as SeriesMetric[];

        const seriesMap: Record<string, MetricSeries> = {};
        metricsFromRows.forEach((m) => (seriesMap[m] = { metric: m, points: [] } as MetricSeries));
        for (const r of rows) {
          const ts = String(r.bucket);
          metricsFromRows.forEach((m) => {
            const v = r[`avg_${m}`] as number | undefined;
            seriesMap[m].points.push([ts, typeof v === 'number' && Number.isFinite(v) ? v : null]);
          });
        }

        return {
          status: 'success',
          data: Object.values(seriesMap),
          metadata: {
            from,
            to,
            granularity: effectiveGranularity,
            effectiveGranularity: effectiveGranularity,
            order: 'ASC',
            maxPoints,
            downsampled: false,
          },
        };
      }

      // Last resort fallback: build series from /history flat rows
      try {
        const fieldsMetrics: SeriesMetric[] = metrics && metrics.length > 0 ? (metrics as SeriesMetric[]) : ['temperature', 'ph', 'tds', 'do_level'];
        const histParams = new URLSearchParams({
          page: '1',
          limit: String(Math.max(10, Math.min(2000, maxPoints || 1000))),
          from,
          to,
          orderBy: 'ASC',
          fields: fieldsMetrics.join(','),
          format: 'flat',
        });
        const histRes = await apiClient.get(`/sensors/${deviceId}/history?${histParams.toString()}`);
        const rawHist = histRes.data;
        const rows: Array<{ time: string; [k: string]: number | string }> = rawHist?.data ?? [];

        const seriesMap: Record<string, MetricSeries> = {};
        (['temperature', 'ph', 'tds', 'do_level'] as SeriesMetric[])
          .filter((m) => fieldsMetrics.includes(m))
          .forEach((m) => (seriesMap[m] = { metric: m, points: [] } as MetricSeries));

        for (const r of rows) {
          const ts = String(r.time);
          (Object.keys(seriesMap) as SeriesMetric[]).forEach((m) => {
            const v = r[m] as number | undefined;
            seriesMap[m].points.push([ts, typeof v === 'number' && Number.isFinite(v) ? v : null]);
          });
        }

        return {
          status: 'success',
          data: Object.values(seriesMap),
          metadata: {
            from,
            to,
            granularity: effectiveGranularity,
            effectiveGranularity,
            order: 'ASC',
            maxPoints,
            downsampled: false,
          },
        };
      } catch (e) {
        throw err;
      }
    }
  }
}

export const seriesKeys = {
  all: ['sensorSeries'] as const,
  byDevice: (deviceId: string) => [...seriesKeys.all, deviceId] as const,
  withParams: (p: SensorSeriesParams) => [...seriesKeys.byDevice(p.deviceId), p] as const,
};
