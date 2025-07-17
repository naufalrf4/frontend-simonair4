import React, { useState, useEffect } from 'react';
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
import { PHTable, TDSTable, DOTable, TemperatureTable } from './tables';
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
import type { Device, DateRange, DataType } from '../types';

// Default date range (7 days)
const getDefaultDateRange = (): DateRange => ({
  from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  to: new Date()
});

export const SensorDataPage: React.FC = () => {
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange());
  const [dataTypeFilters, setDataTypeFilters] = useState<{
    ph: DataType;
    tds: DataType;
    do_level: DataType;
  }>({
    ph: 'calibrated',
    tds: 'calibrated',
    do_level: 'calibrated'
  });

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
    refetch: refetchSensorData
  } = useSensorDataPageQuery({
    deviceId: selectedDevice?.device_id || '',
    dateRange,
    enabled: !!selectedDevice
  });

  // Auto-select first device when devices are loaded
  useEffect(() => {
    if (devices && devices.length > 0 && !selectedDevice) {
      setSelectedDevice(devices[0]);
    }
  }, [devices, selectedDevice]);

  // Handle data type filter changes
  const handleDataTypeChange = (sensorType: keyof typeof dataTypeFilters, dataType: DataType) => {
    setDataTypeFilters(prev => ({
      ...prev,
      [sensorType]: dataType
    }));
  };

  // Handle device selection
  const handleDeviceSelect = (device: Device | null) => {
    setSelectedDevice(device);
    if (device) {
      toast.success(`Perangkat ${device.name} dipilih`);
    }
  };

  // Handle date range change
  const handleDateRangeChange = (newDateRange: DateRange) => {
    setDateRange(newDateRange);
    if (selectedDevice) {
      toast.info('Memuat data untuk rentang tanggal baru...');
    }
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
  const ErrorDisplay = ({ error, onRetry }: { error: string; onRetry?: () => void }) => (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>{error}</span>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-sm underline hover:no-underline"
          >
            Coba lagi
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
            <span className="text-green-600">Online</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4 text-red-600" />
            <span className="text-red-600">Offline</span>
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
            <h1 className="text-3xl font-bold tracking-tight">Riwayat Data Sensor</h1>
            <p className="text-muted-foreground">
              Lihat dan analisis data historis sensor dari perangkat IoT akuarium Anda
            </p>
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
          error="Gagal memuat daftar perangkat. Periksa koneksi internet Anda."
          onRetry={() => window.location.reload()}
        />
      )}

      {sensorDataError && selectedDevice && (
        <ErrorDisplay 
          error="Gagal memuat data sensor. Silakan coba lagi."
          onRetry={() => refetchSensorData()}
        />
      )}

      {/* Main Content */}
      {!selectedDevice ? (
        <EmptyState 
          message="Pilih perangkat untuk melihat data sensor"
          icon={Database}
        />
      ) : sensorDataLoading ? (
        <LoadingSkeleton />
      ) : !sensorData || sensorData.length === 0 ? (
        <EmptyState 
          message="Tidak ada data sensor untuk perangkat dan rentang tanggal yang dipilih"
          icon={AlertCircle}
        />
      ) : (
        /* Sensor Tables Grid */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* pH Table */}
          <PHTable
            data={sensorData}
            isLoading={sensorDataLoading}
            dataType={dataTypeFilters.ph}
            onDataTypeChange={(dataType) => handleDataTypeChange('ph', dataType)}
          />

          {/* TDS Table */}
          <TDSTable
            data={sensorData}
            isLoading={sensorDataLoading}
            dataType={dataTypeFilters.tds}
            onDataTypeChange={(dataType) => handleDataTypeChange('tds', dataType)}
          />

          {/* DO Level Table */}
          <DOTable
            data={sensorData}
            isLoading={sensorDataLoading}
            dataType={dataTypeFilters.do_level}
            onDataTypeChange={(dataType) => handleDataTypeChange('do_level', dataType)}
          />

          {/* Temperature Table */}
          <TemperatureTable
            data={sensorData}
            isLoading={sensorDataLoading}
          />
        </div>
      )}

      {/* Data Info Footer */}
      {selectedDevice && sensorData && sensorData.length > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>Perangkat: <strong>{selectedDevice.name}</strong></span>
                <span>Total data: <strong>{sensorData.length}</strong></span>
              </div>
              <div className="flex items-center gap-4">
                <span>
                  Periode: <strong>
                    {dateRange.from.toLocaleDateString('id-ID')} - {dateRange.to.toLocaleDateString('id-ID')}
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