import React, { useEffect, useState } from 'react';
import { SENSOR_CONFIG } from '../utils/calibrationUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import PHCalibration from './ph_sensor/PHCalibration';
import TDSCalibration from './tds_sensor/TDSCalibration';
import DOCalibration from './do_sensor/DOCalibration';
import SensorSelectionGrid from './SensorSelectionGrid';
import DeviceStatusCard from './DeviceStatusCard';
import HelpText from './HelpText';
import { getSensorData, isDeviceReady } from '../utils/calibrationUtils';

interface Device {
  id: string;
  nama: string;
  status: string;
  online: boolean;
  lastOnline: string;
  lastData: string;
  sensors: Array<{
    label: string;
    value: number | string;
    unit: string;
    status: 'GOOD' | 'BAD' | 'WARNING' | '-';
    raw?: number;
    voltage?: number;
    calibrated?: number;
    calibrated_ok?: boolean;
  }>;
}

interface CalibrationModalProps {
  open: boolean;
  deviceId: string;
  sensorType: '' | 'ph' | 'tds' | 'do';
  onClose: () => void;
  onSensorSelect: (sensorType: '' | 'ph' | 'tds' | 'do') => void;
  currentDeviceData?: Device;
  onSubmit: (calibrationData: any) => Promise<void>;
}

const CalibrationModal: React.FC<CalibrationModalProps> = ({
  open,
  deviceId,
  sensorType,
  onClose,
  onSensorSelect,
  currentDeviceData,
  onSubmit,
}) => {
  const [isCalibrating, setIsCalibrating] = useState(false);

  // Debug props
  useEffect(() => {
    if (open) {
      console.log('🔧 CalibrationModal props:', {
        open,
        deviceId,
        sensorType,
        hasDeviceData: !!currentDeviceData,
        deviceData: currentDeviceData,
      });
    }
  }, [open, deviceId, sensorType, currentDeviceData]);

  // Reset state when modal closes
  const handleClose = () => {
    setIsCalibrating(false);
    onClose();
  };

  // Go back to sensor selection
  const handleBack = () => {
    onSensorSelect('');
    setIsCalibrating(false);
  };

  // Check if device is ready (computed via utility)
  const ready = isDeviceReady(currentDeviceData);

  // Render sensor selection screen
  const renderSensorSelection = () => (
    <div className="space-y-6">
      <DeviceStatusCard deviceData={currentDeviceData} isReady={!!ready} deviceId={deviceId} />
      {!ready && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg leading-relaxed">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <div className="font-medium text-amber-800 mb-1">Perangkat Tidak Siap</div>
            <div className="text-amber-700">
              Pastikan perangkat online dan mengirim data sensor sebelum melakukan kalibrasi.
            </div>
          </div>
        </div>
      )}
      <SensorSelectionGrid
        deviceData={currentDeviceData}
        isReady={!!ready}
        onSelect={onSensorSelect}
        getSensor={(type) => getSensorData(currentDeviceData, type)}
      />
      <HelpText />
    </div>
  );

  const renderCalibrationComponent = () => {
    if (!sensorType) return renderSensorSelection();
    const sensorData = getSensorData(currentDeviceData, sensorType);

    const commonProps = {
      deviceId,
      onClose: handleClose,
      onBack: handleBack,
      isCalibrating,
      setIsCalibrating,
      onSubmit,
      currentVoltage: sensorData?.voltage ?? 0,
      currentTemp: (() => {
        const tempSensor = currentDeviceData?.sensors?.find((s) => {
          const label = s.label.toLowerCase();
          return (
            label === 'temperature' ||
            label === 'suhu' ||
            label === 'temp' ||
            label.includes('suhu') ||
            label.includes('temp') ||
            label.includes('temperature')
          );
        });

        if (tempSensor?.value !== undefined) {
          const parsed =
            typeof tempSensor.value === 'string' ? parseFloat(tempSensor.value) : tempSensor.value;
          console.log('✅ Suhu ditemukan dari sensors[]:', parsed);
          return parsed;
        }

        const directTemp = (currentDeviceData as any)?.temperature?.value;
        if (typeof directTemp === 'number') {
          return directTemp;
        }

        return 25;
      })(),

      currentRaw: sensorData?.raw ?? 0,
      isConnected: currentDeviceData?.online ?? false,
    };

    switch (sensorType) {
      case 'ph':
        return <PHCalibration {...commonProps} />;
      case 'tds':
        return <TDSCalibration {...commonProps} />;
      case 'do':
        return <DOCalibration {...commonProps} />;
      default:
        return renderSensorSelection();
    }
  };

  // Don't render if no device data is available
  if (open && !currentDeviceData) {
    console.warn('⚠️ CalibrationModal: No device data available for deviceId:', deviceId);
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Calibration</DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="text-muted-foreground">Loading device data...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100vw-1rem)] h-[calc(100vh-2rem)] max-w-4xl sm:h-auto sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6 sm:rounded-lg sm:my-8">
        <DialogHeader className="sm:pr-8 mb-2 sm:mb-0">
          <div className="flex items-center gap-3">
            {sensorType && (
              <Button variant="ghost" size="sm" onClick={handleBack} className="p-2 sm:flex hidden">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <DialogTitle className="text-xl font-bold">
              {sensorType ? (
                <>
                  Kalibrasi{' '}
                  {(typeof SENSOR_CONFIG !== 'undefined' && SENSOR_CONFIG[sensorType]?.name) ||
                    sensorType.toUpperCase()}{' '}
                  - {currentDeviceData?.nama || deviceId}
                </>
              ) : (
                'Pilih Sensor untuk Kalibrasi'
              )}
            </DialogTitle>
          </div>
        </DialogHeader>
        <div className="mt-3 sm:mt-4 space-y-4 sm:space-y-6">{renderCalibrationComponent()}</div>
      </DialogContent>
    </Dialog>
  );
};

export default CalibrationModal;
