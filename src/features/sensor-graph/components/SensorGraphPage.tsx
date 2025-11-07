import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, Database, LineChart as LineChartIcon, Wifi, WifiOff } from 'lucide-react';

import { DeviceSelector } from '@/features/sensor-data/components/DeviceSelector';
import { DateRangeFilter } from '@/features/sensor-data/components/filters/DateRangeFilter';
import { useDevicesPageQuery } from '@/features/sensor-data/hooks/useSensorDataPageQuery';
import type { Device, DateRange } from '@/features/sensor-data/types';

import { useSensorSeriesQuery } from '../hooks/useSensorSeriesQuery';
import type { SeriesGranularity, SeriesMetric } from '../services/sensorSeriesService';
import { LineChart } from './LineChart';
import { useTranslation } from 'react-i18next';

const getDefaultDateRange = (): DateRange => ({
  from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  to: new Date(),
});

const METRIC_COLORS: Record<SeriesMetric, string> = {
  temperature: '#ef4444', // red-500
  ph: '#3b82f6',          // blue-500
  tds: '#8b5cf6',         // violet-500
  do_level: '#10b981',    // emerald-500
};

export const SensorGraphPage: React.FC = () => {
  const { t, i18n } = useTranslation('devices');
  const locale = i18n.language === 'id' ? 'id-ID' : 'en-US';
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange());
  const [granularity, setGranularity] = useState<SeriesGranularity | 'auto'>('auto');
  const [activeMetrics, setActiveMetrics] = useState<SeriesMetric[]>(['temperature', 'ph', 'tds', 'do_level']);

  const { data: devices } = useDevicesPageQuery();

  useEffect(() => {
    if (devices && devices.length > 0 && !selectedDevice) {
      setSelectedDevice(devices[0]);
    }
  }, [devices, selectedDevice]);

  const { data: seriesRes, isLoading, error, refetch } = useSensorSeriesQuery(
    {
      deviceId: selectedDevice?.device_id || '',
      from: dateRange.from.toISOString(),
      to: dateRange.to.toISOString(),
      granularity,
      metrics: activeMetrics,
      order: 'ASC',
      maxPoints: 500,
      format: 'series',
    },
    !!selectedDevice,
  );

  const chartSeries = useMemo(() => {
    if (!seriesRes?.data) return [];
    return seriesRes.data.map((ms) => ({
      name: ms.metric,
      color: METRIC_COLORS[ms.metric],
      points: ms.points.map(([t, v]) => ({ x: new Date(t).getTime(), y: v })),
    }));
  }, [seriesRes]);

  const ConnectionStatus = () => {
    const isOnline = selectedDevice?.status === 'online';
    return (
      <div className="flex items-center gap-2 text-sm">
        {isOnline ? (
          <>
            <Wifi className="h-4 w-4 text-green-600" />
            <span className="text-green-600">{t('card.badge.online')}</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4 text-red-600" />
            <span className="text-red-600">{t('card.badge.offline')}</span>
          </>
        )}
      </div>
    );
  };

  const toggleMetric = (m: SeriesMetric) => {
    setActiveMetrics((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('sensorTrends.title')}</h1>
            <p className="text-muted-foreground">{t('sensorTrends.description')}</p>
          </div>
          <div className="flex items-center gap-2">
            <LineChartIcon className="h-5 w-5 text-muted-foreground" />
            {selectedDevice && <ConnectionStatus />}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="min-w-[280px]">
              <DeviceSelector
                devices={devices || []}
                selectedDevice={selectedDevice}
                onDeviceSelect={setSelectedDevice}
              />
            </div>

            <DateRangeFilter dateRange={dateRange} onDateRangeChange={setDateRange} />

            <Select value={granularity} onValueChange={(v) => setGranularity(v as any)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder={t('sensorTrends.controls.granularityPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">{t('sensorTrends.options.auto')}</SelectItem>
                <SelectItem value="hourly">{t('sensorTrends.options.hourly')}</SelectItem>
                <SelectItem value="daily">{t('sensorTrends.options.daily')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Metrics toggles */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3">
            {(['temperature', 'ph', 'tds', 'do_level'] as SeriesMetric[]).map((m) => (
              <label key={m} className="flex items-center gap-2 text-sm">
                <Checkbox checked={activeMetrics.includes(m)} onCheckedChange={() => toggleMetric(m)} />
                <span className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: METRIC_COLORS[m] }} />
                  {t(`sensorTrends.metrics.${m}`)}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Errors */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{t('sensorTrends.error.load')}</span>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              {t('sensorTrends.actions.retry')}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Main */}
      {!selectedDevice ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Database className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t('sensorTrends.empty.selectDevice')}</p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Card>
          <CardHeader />
          <CardContent>
            <div className="h-[280px] w-full animate-pulse rounded-md bg-muted" />
          </CardContent>
        </Card>
      ) : !seriesRes?.data?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t('sensorTrends.empty.noData')}</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader />
          <CardContent>
            <LineChart series={chartSeries} />
          </CardContent>
        </Card>
      )}

      {/* Footer info */}
      {selectedDevice && seriesRes?.data && seriesRes.data.length > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>
                  {t('sensorTrends.summary.device')}: <strong>{selectedDevice.name}</strong>
                </span>
                <span>
                  {t('sensorTrends.summary.granularity')}: <strong>
                    {t(`sensorTrends.options.${seriesRes.metadata.effectiveGranularity || granularity}`, {
                      defaultValue: seriesRes.metadata.effectiveGranularity || granularity,
                    })}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span>
                  {t('sensorTrends.summary.period')}: <strong>
                    {dateRange.from.toLocaleDateString(locale)} - {dateRange.to.toLocaleDateString(locale)}
                  </strong>
                </span>
                <ConnectionStatus />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
