import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Database, Wifi, WifiOff } from 'lucide-react';
import { toast } from 'sonner';

// Import our sensor data components
// import { useSensorDataErrorHandler } from './ErrorBoundary';
import { DeviceSelector } from './DeviceSelector';
import { DateRangeFilter } from './filters/DateRangeFilter';
import { ExcelExportButton } from './ExcelExportButton';
// Unified table view (single table)
import { DataTable } from '@/components/ui/data-table';
// import { 
//   SensorDataPageSkeleton, 
//   SensorTableCardSkeleton,
//   LoadingOverlay 
// } from './LoadingStates';
// import { 
//   NoDeviceSelectedState, 
//   NoDataAvailableState, 
//   NoDevicesFoundState,
//   DeviceOfflineState 
// } from './EmptyStates';

// Import hooks and services
import { useSensorDataPageQuery, useDevicesPageQuery } from '../hooks/useSensorDataPageQuery';

// Import types
import type { Device, DateRange, SensorReading } from '../types';
import type { ColumnDef } from '@tanstack/react-table';
import { formatSensorValue, formatTDSValue, formatDOValue, formatTemperatureValue } from '../utils/sensorDataFormatters';
import { format } from 'date-fns';
import { enUS, id as idLocale } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';

// Default date range (7 days)
const getDefaultDateRange = (): DateRange => ({
  from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  to: new Date()
});

export const SensorDataPage: React.FC = () => {
  const { t, i18n } = useTranslation('devices');
  const locale = i18n.language === 'id' ? 'id-ID' : 'en-US';
  const dateFnsLocale = i18n.language === 'id' ? idLocale : enUS;
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange());
  const [limit, setLimit] = useState<number | 'all'>(50);
  const [aggGranularity, setAggGranularity] = useState<'auto' | 'hourly' | 'daily'>('auto');
  const [page, setPage] = useState<number>(1);
  // Single-table design — no per-sensor data-type filters

  // Data fetching hooks
  const {
    data: devices,
    isLoading: devicesLoading,
    error: devicesError
  } = useDevicesPageQuery();

  const {
    data: sensorData,
    isLoading: sensorDataLoading,
    error: sensorDataError,
    refetch: refetchSensorData,
    metadata: sensorMeta,
  } = useSensorDataPageQuery({
    deviceId: selectedDevice?.device_id || '',
    dateRange,
    page,
    limit,
    granularity: aggGranularity,
    enabled: !!selectedDevice
  });

  // Auto-select first device when devices are loaded
  useEffect(() => {
    if (devices && devices.length > 0 && !selectedDevice) {
      setSelectedDevice(devices[0]);
    }
  }, [devices, selectedDevice]);

  // Format date like: Monday. 08 Sep 2025 with time below
  const formatPrettyDateParts = useCallback((ts: string | Date) => {
    try {
      const dt = typeof ts === 'string' ? new Date(ts) : ts;
      return {
        date: format(dt, 'EEEE, dd MMM yyyy', { locale: dateFnsLocale }),
        time: format(dt, 'HH:mm:ss', { locale: dateFnsLocale }),
      };
    } catch {
      return { date: t('sensorData.table.invalid'), time: t('sensorData.table.noTime') };
    }
  }, [dateFnsLocale, t]);

  // Columns for the unified table
  const columns: ColumnDef<SensorReading>[] = useMemo(
    () => [
      {
        accessorKey: 'timestamp',
        header: t('sensorData.table.timestamp'),
        cell: ({ row }) => {
          const ts = row.original.timestamp || row.original.time;
          const f = formatPrettyDateParts(ts);
          return (
            <div className="flex flex-col min-w-[140px]">
              <span className="text-sm font-semibold">{f.date}</span>
              <span className="text-xs text-muted-foreground leading-tight">{f.time}</span>
            </div>
          );
        },
      },
      {
        id: 'device',
        header: t('sensorData.table.device'),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-sm font-medium">{selectedDevice?.name || row.original.device_id}</span>
            <span className="text-xs text-muted-foreground">{row.original.device_id}</span>
          </div>
        ),
      },
      {
        id: 'ph',
        header: t('sensorData.table.ph'),
        cell: ({ row }) => (
          <span className="font-mono text-sm">
            {formatSensorValue(row.original.ph?.calibrated, { precision: 2, unit: 'pH' })}
          </span>
        ),
      },
      {
        id: 'tds',
        header: t('sensorData.table.tds'),
        cell: ({ row }) => (
          <span className="font-mono text-sm">{formatTDSValue(row.original.tds?.calibrated)}</span>
        ),
      },
      {
        id: 'do',
        header: t('sensorData.table.do'),
        cell: ({ row }) => (
          <span className="font-mono text-sm">{formatDOValue(row.original.do_level?.calibrated)}</span>
        ),
      },
      {
        id: 'temp',
        header: t('sensorData.table.temperature'),
        cell: ({ row }) => (
          <span className="font-mono text-sm">{formatTemperatureValue(row.original.temperature?.value)}</span>
        ),
      },
    ],
    [formatPrettyDateParts, selectedDevice, t],
  );

  // Handle device selection
  const handleDeviceSelect = (device: Device | null) => {
    setSelectedDevice(device);
    setPage(1);
    if (device) {
      toast.success(t('sensorData.toasts.deviceSelected', { name: device.name }));
    }
  };

  // Handle date range change
  const handleDateRangeChange = (newDateRange: DateRange) => {
    setDateRange(newDateRange);
    setPage(1);
    if (selectedDevice) {
      toast.info(t('sensorData.toasts.dateRangeLoading'));
    }
  };

  // Handle manual pagination change from DataTable (0-based index)
  const handlePageChange = (pageIndex: number) => {
    setPage(pageIndex + 1);
  };

  // Loading state component
  const LoadingSkeleton = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map(j => (
                  <Skeleton key={j} className="h-12 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // Error state component
  const ErrorDisplay = ({ error, onRetry, retryLabel }: { error: string; onRetry?: () => void; retryLabel?: string }) => (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>{error}</span>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-sm underline hover:no-underline"
          >
            {retryLabel}
          </button>
        )}
      </AlertDescription>
    </Alert>
  );

  // Empty state component
  const EmptyState = ({ message, icon: Icon }: { message: string; icon: React.ComponentType<{ className?: string }> }) => (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Icon className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-center">{message}</p>
      </CardContent>
    </Card>
  );

  // Connection status indicator
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

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('sensorData.title')}</h1>
            <p className="text-muted-foreground">{t('sensorData.description')}</p>
          </div>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-muted-foreground" />
            {selectedDevice && <ConnectionStatus />}
          </div>
        </div>

        {/* Controls Section */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Device Selector */}
            <div className="min-w-[280px]">
              <DeviceSelector
                devices={devices || []}
                selectedDevice={selectedDevice}
                onDeviceSelect={handleDeviceSelect}
                isLoading={devicesLoading}
                error={devicesError}
              />
            </div>

            {/* Date Range Filter */}
            <DateRangeFilter
              dateRange={dateRange}
              onDateRangeChange={handleDateRangeChange}
            />

            {/* Granularity Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{t('sensorData.controls.granularity')}</span>
              <Select value={aggGranularity} onValueChange={(v) => { setAggGranularity(v as any); setPage(1); }}>
                <SelectTrigger className="h-8 w-[130px]">
                  <SelectValue placeholder={t('sensorData.controls.granularityPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">{t('sensorData.controls.options.auto')}</SelectItem>
                  <SelectItem value="hourly">{t('sensorData.controls.options.hourly')}</SelectItem>
                  <SelectItem value="daily">{t('sensorData.controls.options.daily')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Page Size / Limit Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{t('sensorData.controls.limit')}</span>
              <Select value={String(limit)} onValueChange={(v) => { setLimit(v === 'all' ? 'all' as any : Number(v)); setPage(1); }}>
                <SelectTrigger className="h-8 w-[90px]">
                  <SelectValue placeholder={t('sensorData.controls.limitPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="all">{t('sensorData.controls.options.all')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Export Button */}
          {selectedDevice && sensorData && sensorData.length > 0 && (
            <ExcelExportButton
              data={sensorData}
              device={selectedDevice}
              dateRange={dateRange}
              variant="default"
              size="default"
            />
          )}
        </div>
      </div>

      {/* Error States */}
      {devicesError && (
        <ErrorDisplay 
          error={t('sensorData.errors.devices')}
          onRetry={() => window.location.reload()}
          retryLabel={t('errors.actions.retry')}
        />
      )}

      {sensorDataError && selectedDevice && (
        <ErrorDisplay 
          error={t('sensorData.errors.sensorData')}
          onRetry={() => refetchSensorData()}
          retryLabel={t('errors.actions.retry')}
        />
      )}

      {/* Main Content */}
      {!selectedDevice ? (
        <EmptyState 
          message={t('sensorData.empty.selectDevice')}
          icon={Database}
        />
      ) : sensorDataLoading ? (
        <LoadingSkeleton />
      ) : !sensorData || sensorData.length === 0 ? (
        <EmptyState 
          message={t('sensorData.empty.noData')}
          icon={AlertCircle}
        />
      ) : (
        <Card>
          <CardHeader />
          <CardContent>
            <DataTable<SensorReading, unknown>
              columns={columns}
              data={sensorData as SensorReading[]}
              isLoading={sensorDataLoading}
              pagination={
                limit === 'all'
                  ? undefined
                  : {
                      pageIndex: Math.max(0, page - 1),
                      pageSize: typeof limit === 'number' ? limit : 50,
                      pageCount:
                        (sensorMeta?.totalPages as number | undefined) ??
                        (typeof sensorMeta?.hasNext === 'boolean'
                          ? (sensorMeta.hasNext ? page + 1 : page)
                          : 1),
                      onPageChange: handlePageChange,
                    }
              }
            />
          </CardContent>
        </Card>
      )}

      {/* Data Info Footer */}
      {selectedDevice && sensorData && sensorData.length > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm text-muted-foreground">
             <div className="flex items-center gap-4">
                <span>{t('sensorData.summary.device')}: <strong>{selectedDevice.name}</strong></span>
                <span>{t('sensorData.summary.rows')}: <strong>{sensorMeta?.total ?? sensorData.length}</strong></span>
              </div>
              <div className="flex items-center gap-4">
                <span>
                  {t('sensorData.summary.period')}: <strong>
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
