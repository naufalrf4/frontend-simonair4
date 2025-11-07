import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Wifi,
  WifiOff,
  MapPin,
  Fish,
  Ruler,
  Thermometer,
  Droplets,
  Clock,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDeviceStatus, formatTimestamp, formatSensorValue } from '../utils/deviceFormatters';
import type { Device } from '../types';
import { useTranslation } from 'react-i18next';

export interface DeviceCardProps {
  device: Device;
  onClick?: (device: Device) => void;
  onEdit?: (device: Device) => void;
  onDelete?: (device: Device) => void;
  onViewDetails?: (device: Device) => void;
  className?: string;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({
  device,
  onClick,
  onEdit,
  onDelete,
  onViewDetails,
  className,
}) => {
  const { t } = useTranslation('devices');
  const handleCardClick = () => {
    onClick?.(device);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(device);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(device);
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewDetails?.(device);
  };

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-300 group cursor-pointer',
        'bg-white/90 border-2 border-gray-200/60 hover:border-gray-300/80',
        'hover:shadow-lg hover:-translate-y-1',
        device.online ? 'hover:border-emerald-300/60' : 'opacity-90',
        className
      )}
      onClick={handleCardClick}
    >
      {/* Status indicator bar */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 h-1 transition-all duration-300',
          device.online
            ? 'bg-gradient-to-r from-emerald-500 to-cyan-500'
            : 'bg-gradient-to-r from-red-500 to-orange-500'
        )}
      />

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg truncate">
                {device.device_name}
              </h3>
              <Badge 
                variant={device.online ? 'default' : 'secondary'}
                className={cn(
                  'text-xs',
                  device.online 
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                    : 'bg-gray-100 text-gray-600 border-gray-200'
                )}
              >
                {device.online ? (
                  <>
                    <Wifi className="w-3 h-3 mr-1" /> {t('card.badge.online')}
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 mr-1" /> {t('card.badge.offline')}
                  </>
                )}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground font-mono">
              {device.device_id}
            </p>
          </div>

          {/* Actions dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={handleDropdownClick}>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">{t('card.a11y.menu')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleViewDetails}>
                <Eye className="mr-2 h-4 w-4" />
                {t('card.actions.view')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                {t('card.actions.edit')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t('card.actions.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Device Information */}
        <div className="grid grid-cols-1 gap-3">
          {device.location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">{t('card.labels.location')}:</span>
              <span className="font-medium">{device.location}</span>
            </div>
          )}

          {device.aquarium_size && (
            <div className="flex items-center gap-2 text-sm">
              <Ruler className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">{t('card.labels.size')}:</span>
              <span className="font-medium">{device.aquarium_size}</span>
            </div>
          )}

          {device.fish_count && device.fish_count > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Fish className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">{t('card.labels.fish')}:</span>
              <span className="font-medium">{device.fish_count}</span>
            </div>
          )}
        </div>

        {device.online && device.latestSensorData && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                {t('card.labels.recentSensorData')}
              </h4>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {device.latestSensorData.ph !== undefined && (
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-medium text-blue-700">
                      {t('card.labels.ph')}
                    </span>
                  </div>
                  <div className="text-lg font-bold text-blue-800 mt-1">
                    {formatSensorValue(device.latestSensorData.ph, '', 1)}
                  </div>
                </div>
              )}
              
              {device.latestSensorData.temperature !== undefined && (
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-orange-600" />
                    <span className="text-xs font-medium text-orange-700">{t('card.labels.temperature')}</span>
                  </div>
                  <div className="text-lg font-bold text-orange-800 mt-1">
                    {formatSensorValue(device.latestSensorData.temperature, '°C', 1)}
                  </div>
                </div>
              )}
              
              {device.latestSensorData.tds !== undefined && (
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-medium text-green-700">TDS</span>
                  </div>
                  <div className="text-lg font-bold text-green-800 mt-1">
                    {formatSensorValue(device.latestSensorData.tds, 'ppm', 0)}
                  </div>
                </div>
              )}
              
              {device.latestSensorData.do !== undefined && (
                <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-3 rounded-lg border border-cyan-200">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-600" />
                    <span className="text-xs font-medium text-cyan-700">{t('card.labels.do')}</span>
                  </div>
                  <div className="text-lg font-bold text-cyan-800 mt-1">
                    {formatSensorValue(device.latestSensorData.do, 'mg/L', 1)}
                  </div>
                </div>
              )}
            </div>
            
            <div className="text-xs text-muted-foreground mt-3 text-center">
              {t('card.labels.lastUpdated', { time: formatTimestamp(device.latestSensorData.timestamp) })}
            </div>
          </div>
        )}

        {/* Offline Status */}
        {!device.online && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t('card.labels.status')}:</span>
              <span className="font-medium text-red-600">
                {formatDeviceStatus(device.online, device.last_seen)}
              </span>
            </div>
            {device.last_seen && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                <Clock className="w-3 h-3" />
                <span>{t('card.labels.lastOnline', { time: formatTimestamp(device.last_seen) })}</span>
              </div>
            )}
          </div>
        )}

        {/* Device metadata */}
        <div className="border-t pt-3 text-xs text-muted-foreground">
          <div className="flex justify-between items-center">
            <span>{t('card.labels.paired', { time: formatTimestamp(device.created_at) })}</span>
            {device.updated_at && (
              <span>{t('card.labels.updated', { time: formatTimestamp(device.updated_at) })}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
