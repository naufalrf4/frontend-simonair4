import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSensorConfig, getStatusConfig } from '../utils/sensorUtils';

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

const SensorCard: React.FC<SensorCardProps> = ({ 
  sensor, 
  isOnline, 
  lastUpdate
}) => {
  const config = getSensorConfig(sensor.label);
  const statusConfig = getStatusConfig(sensor.status, isOnline);
  const StatusIcon = statusConfig.icon;
  const SensorIcon = config.icon;

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300 hover:shadow-lg group",
      "border-2 hover:border-opacity-60",
      isOnline ? "hover:-translate-y-1" : "opacity-75"
    )}>
      {/* Background gradient */}
      <div className={cn(
        "absolute inset-0 opacity-30",
        config.bgGradient
      )} />
      
      {/* Status indicator bar */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-1",
        statusConfig.color
      )} />

      <CardContent className="relative p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              "p-2 rounded-lg bg-white/80 shadow-sm",
              "group-hover:shadow-md transition-shadow duration-200"
            )}>
              <SensorIcon className={cn("h-4 w-4", config.iconColor)} />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-gray-800 leading-tight">
                {sensor.label}
              </h3>
              <p className="text-xs text-gray-500 truncate max-w-[100px]">
                {config.name}
              </p>
            </div>
          </div>
          
          {/* Status badge */}
          <Badge 
            variant={statusConfig.variant}
            className="text-xs px-2 py-1 flex items-center gap-1"
          >
            <StatusIcon className="h-3 w-3" />
            {statusConfig.label}
          </Badge>
        </div>

        {/* Value display */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className={cn(
                "text-2xl font-bold tracking-tight",
                config.textColor
              )}>
                {typeof sensor.value === 'number' ? sensor.value.toFixed(2) : sensor.value}
              </span>
              <span className="text-sm font-medium text-gray-600">
                {sensor.unit}
              </span>
            </div>
          </div>
        </div>

        {/* Calibration status */}
        {sensor.calibrated_ok !== undefined && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-200/50">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                sensor.calibrated_ok ? "bg-green-500" : "bg-orange-500"
              )} />
              <span className="text-xs text-gray-600">
                {sensor.calibrated_ok ? 'Terkalibrasi' : 'Perlu Kalibrasi'}
              </span>
            </div>
          </div>
        )}

        {/* Last update timestamp */}
        {lastUpdate && isOnline && (
          <div className="flex items-center gap-1 pt-1 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            <span>Update {lastUpdate}</span>
          </div>
        )}

        {/* Offline indicator */}
        {!isOnline && (
          <div className="absolute inset-0 bg-gray-900/10 flex items-center justify-center">
            <div className="bg-white/90 px-3 py-1 rounded-full text-xs font-medium text-gray-600 shadow-sm">
              Perangkat Offline
            </div>
          </div>
        )}
      </CardContent>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </Card>
  );
};

export default SensorCard;
