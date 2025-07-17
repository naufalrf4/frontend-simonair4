import { WifiOff, CheckCircle, AlertTriangle } from 'lucide-react';
import type { Sensor } from './dashboardUtils';

export const getStatusIcon = (status: string, online: boolean) => {
  if (!online) {
    return <WifiOff className="h-4 w-4 text-red-500" />;
  }

  switch (status.toLowerCase()) {
    case 'normal':
      return <CheckCircle className="h-4 w-4 text-emerald-500" />;
    case 'bermasalah':
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    default:
      return <AlertTriangle className="h-4 w-4 text-gray-400" />;
  }
};

export const getStatusBadgeVariant = (
  status: string,
  online: boolean,
): 'default' | 'destructive' | 'secondary' | 'outline' => {
  if (!online) return 'destructive';

  switch (status.toLowerCase()) {
    case 'normal':
      return 'default';
    case 'bermasalah':
      return 'destructive';
    default:
      return 'outline';
  }
};

export const getStatusText = (status: string, online: boolean) => {
  if (!online) return 'Offline';
  return status;
};

export const getCalibrationStatus = (sensors: Sensor[]) => {
  const sensorsWithCalibration = sensors.filter((s) => s.calibrated_ok !== undefined);
  if (sensorsWithCalibration.length === 0) return null;

  const calibratedSensors = sensorsWithCalibration.filter((s) => s.calibrated_ok === true).length;
  const totalSensors = sensorsWithCalibration.length;

  return {
    calibrated: calibratedSensors,
    total: totalSensors,
    percentage: Math.round((calibratedSensors / totalSensors) * 100),
  };
};
