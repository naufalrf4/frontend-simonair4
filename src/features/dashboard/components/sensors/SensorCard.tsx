import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSensorConfig, getStatusConfig } from '../utils/sensorUtils';
import { useTranslation } from 'react-i18next';

interface SensorCardProps {
  sensor: {
    label: string;
    value: number | string;
    unit: string;
    status: 'GOOD' | 'BAD';
    calibrated_ok?: boolean;
    raw?: number;
    voltage?: number;
    calibrated?: number;
  };
  isOnline: boolean;
  lastUpdate?: string;
}

const SensorCard: React.FC<SensorCardProps> = ({ sensor, isOnline, lastUpdate }) => {
  const { t } = useTranslation('dashboard');
  const config = getSensorConfig(sensor.label);
  const statusConfig = getStatusConfig(sensor.status, isOnline);
  const StatusIcon = statusConfig.icon;
  const SensorIcon = config.icon;
  const showDetails = sensor.voltage !== undefined || sensor.calibrated !== undefined;
  const sensorName = config.nameKey ? t(config.nameKey) : config.name || sensor.label;
  const statusLabel = statusConfig.labelKey ? t(statusConfig.labelKey) : '';

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-300 group',
        'border-2 hover:border-opacity-60',
        'hover:shadow-lg hover:-translate-y-1',
        'h-full',
        isOnline ? '' : 'opacity-75',
      )}
    >
      <div className={cn('absolute inset-0 opacity-10 sm:opacity-30', config.bgGradient)} />

      <div className={cn('absolute top-0 left-0 right-0 h-0.5 sm:h-1', statusConfig.color)} />

      <CardContent className="relative p-2 sm:p-4 space-y-1 sm:space-y-3">
        <div className="sm:hidden flex flex-col h-full justify-center text-center py-2">
          <div className="flex items-center justify-center mb-2">
            <SensorIcon className={cn('h-6 w-6', config.iconColor)} />
          </div>
          
          <div className="flex-1 flex flex-col justify-center space-y-1">
            <span className="text-xs font-semibold text-gray-700 truncate px-1">
              {sensor.label}
            </span>
            <div className="space-y-1">
              <span className={cn('text-2xl font-bold block leading-none', config.textColor)}>
                {typeof sensor.value === 'number' ? sensor.value.toFixed(1) : sensor.value}
              </span>
              <span className="text-xs text-gray-600 font-medium block">{sensor.unit}</span>
            </div>
          </div>
          
          <div className="flex justify-center mt-2">
            <Badge 
              variant={statusConfig.variant}
              className="text-[10px] px-2 py-0.5 h-4 flex items-center gap-1"
            >
              <StatusIcon className="h-2.5 w-2.5" />
              {statusLabel}
            </Badge>
          </div>
          
          {sensor.calibrated_ok !== undefined && (
            <div className="flex justify-center mt-1">
              <div className="flex items-center gap-1">
                <div
                  className={cn(
                    'w-2 h-2 rounded-full',
                    sensor.calibrated_ok ? 'bg-green-500' : 'bg-orange-500',
                  )}
                />
                <span className="text-[10px] text-gray-600">
                  {sensor.calibrated_ok ? t('sensorCard.mobileOk') : t('sensorCard.mobileWarn')}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="hidden sm:block space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'p-2 rounded-lg bg-white/80 shadow-sm',
                  'group-hover:shadow-md transition-shadow duration-200',
                )}
              >
                <SensorIcon className={cn('h-4 w-4', config.iconColor)} />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-800 leading-tight">
                  {sensor.label}
                </h3>
                <p className="text-xs text-gray-500 truncate max-w-[100px]">{sensorName}</p>
              </div>
            </div>

            <Badge
              variant={statusConfig.variant}
              className="text-xs px-2 py-1 flex items-center gap-1"
            >
              <StatusIcon className="h-3 w-3" />
              {statusLabel}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-1">
                <span className={cn('text-2xl font-bold tracking-tight', config.textColor)}>
                  {typeof sensor.value === 'number' ? sensor.value.toFixed(2) : sensor.value}
                </span>
                <span className="text-sm font-medium text-gray-600">{sensor.unit}</span>
              </div>
            </div>
            {showDetails && (
              <div className="text-xs text-gray-600 grid grid-cols-2 gap-2">
                {sensor.voltage !== undefined && (
                  <span className="truncate">V: {typeof sensor.voltage === 'number' ? sensor.voltage.toFixed(2) : sensor.voltage}</span>
                )}
              </div>
            )}
          </div>

          {sensor.calibrated_ok !== undefined && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-200/50">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'w-2 h-2 rounded-full',
                    sensor.calibrated_ok ? 'bg-green-500' : 'bg-orange-500',
                  )}
                />
                <span className="text-xs text-gray-600">
                  {sensor.calibrated_ok ? t('sensorCard.calibratedOk') : t('sensorCard.needsCalibration')}
                </span>
              </div>
            </div>
          )}

          {lastUpdate && isOnline && (
            <div className="flex items-center gap-1 pt-1 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>{t('sensorCard.lastUpdate', { time: lastUpdate })}</span>
            </div>
          )}
        </div>

        {!isOnline && (
          <div className="absolute inset-0 bg-gray-900/10 flex items-center justify-center">
            <div className="bg-white/90 px-1 py-0.5 sm:px-3 sm:py-1 rounded-full text-[8px] sm:text-xs font-medium text-gray-600 shadow-sm">
              <span className="sm:hidden">{t('sensorCard.mobileWarn')}</span>
              <span className="hidden sm:inline">{t('sensorCard.deviceOffline')}</span>
            </div>
          </div>
        )}
      </CardContent>

      <div className="hidden sm:block absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </Card>
  );
};

export default SensorCard;
