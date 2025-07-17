import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Edit, 
  Trash2, 
  Wifi, 
  WifiOff, 
  MapPin, 
  Ruler, 
  Fish, 
  Droplets,
  Thermometer,
  Activity,
  User
} from 'lucide-react';
import { useDeviceQuery } from '../../hooks/useDevicesQuery';
import StatusDot from '../../../dashboard/components/status/StatusDot';
import { 
  formatDeviceStatus, 
  formatSensorValue, 
  formatTimestamp, 
  parseAquariumSize, 
  formatAquariumVolume 
} from '../../utils/deviceFormatters';
import type { Device } from '../../types';
import { DEVICE_MESSAGES } from '../../constants/messages';

export interface DeviceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  deviceId: string | null; // Using device_id consistently
  onEdit?: (device: Device) => void;
  onDelete?: (device: Device) => void;
}

export const DeviceDetailsModal: React.FC<DeviceDetailsModalProps> = ({
  isOpen,
  onClose,
  deviceId,
  onEdit,
  onDelete,
}) => {
  const { data: device, isLoading, error, refetch } = useDeviceQuery(
    deviceId || '',
    isOpen && !!deviceId
  );

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  const handleEdit = () => {
    if (device && onEdit) {
      onEdit(device);
    }
  };

  const handleDelete = () => {
    if (device && onDelete) {
      onDelete(device);
    }
  };

  const renderSensorData = () => {
    if (!device?.latestSensorData) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              {DEVICE_MESSAGES.SENSOR_DATA}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                Data sensor tidak tersedia
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Perangkat mungkin offline atau belum mengirim data
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    const sensorData = device.latestSensorData;
    const sensors = [
      {
        label: DEVICE_MESSAGES.PH_LEVEL,
        value: sensorData.ph,
        unit: DEVICE_MESSAGES.SENSOR_UNITS.PH,
        icon: Droplets,
        bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-800',
        iconColor: 'text-blue-600',
        labelColor: 'text-blue-700',
      },
      {
        label: DEVICE_MESSAGES.TDS,
        value: sensorData.tds,
        unit: DEVICE_MESSAGES.SENSOR_UNITS.TDS,
        icon: Droplets,
        bgColor: 'bg-gradient-to-br from-green-50 to-green-100',
        borderColor: 'border-green-200',
        textColor: 'text-green-800',
        iconColor: 'text-green-600',
        labelColor: 'text-green-700',
      },
      {
        label: DEVICE_MESSAGES.DISSOLVED_OXYGEN,
        value: sensorData.do,
        unit: DEVICE_MESSAGES.SENSOR_UNITS.DISSOLVED_OXYGEN,
        icon: Activity,
        bgColor: 'bg-gradient-to-br from-cyan-50 to-cyan-100',
        borderColor: 'border-cyan-200',
        textColor: 'text-cyan-800',
        iconColor: 'text-cyan-600',
        labelColor: 'text-cyan-700',
      },
      {
        label: DEVICE_MESSAGES.TEMPERATURE,
        value: sensorData.temperature,
        unit: DEVICE_MESSAGES.SENSOR_UNITS.TEMPERATURE,
        icon: Thermometer,
        bgColor: 'bg-gradient-to-br from-orange-50 to-orange-100',
        borderColor: 'border-orange-200',
        textColor: 'text-orange-800',
        iconColor: 'text-orange-600',
        labelColor: 'text-orange-700',
      },
    ];

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {DEVICE_MESSAGES.SENSOR_DATA}
            {device.online && (
              <Badge variant="secondary" className="ml-auto text-emerald-600 border-emerald-200">
                Live
              </Badge>
            )}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Terakhir diperbarui: {formatTimestamp(sensorData.timestamp)}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sensors.map((sensor) => {
              const Icon = sensor.icon;
              if (sensor.value === undefined || sensor.value === null) return null;
              
              return (
                <div key={sensor.label} className={`p-4 rounded-lg border ${sensor.bgColor} ${sensor.borderColor}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className={`h-5 w-5 ${sensor.iconColor}`} />
                    <span className={`text-sm font-medium ${sensor.labelColor}`}>{sensor.label}</span>
                  </div>
                  <div className={`text-2xl font-bold ${sensor.textColor}`}>
                    {formatSensorValue(sensor.value, sensor.unit, 1)}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderDeviceInfo = () => {
    if (!device) return null;

    const aquariumDimensions = device.aquarium_size ? parseAquariumSize(device.aquarium_size) : null;

    return (
      <Card>
        <CardHeader>
          <CardTitle>{DEVICE_MESSAGES.DEVICE_INFO}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Nama Perangkat</p>
                  <p className="text-sm text-muted-foreground">{device.device_name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">ID Perangkat</p>
                  <p className="text-sm text-muted-foreground font-mono">{device.device_id}</p>
                </div>
              </div>

              {device.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Lokasi</p>
                    <p className="text-sm text-muted-foreground">{device.location}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {aquariumDimensions && (
                <div className="flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Ukuran Akuarium</p>
                    <p className="text-sm text-muted-foreground">
                      {device.aquarium_size}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Volume: {formatAquariumVolume(aquariumDimensions)}
                    </p>
                  </div>
                </div>
              )}

              {device.fish_count && device.fish_count > 0 && (
                <div className="flex items-center gap-2">
                  <Fish className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Jumlah Ikan</p>
                    <p className="text-sm text-muted-foreground">{device.fish_count} ekor</p>
                  </div>
                </div>
              )}

              {device.glass_type && (
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Jenis Kaca</p>
                    <p className="text-sm text-muted-foreground">{device.glass_type}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderConnectionStatus = () => {
    if (!device) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {device.online ? (
              <Wifi className="h-5 w-5 text-emerald-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-500" />
            )}
            Status Koneksi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <StatusDot online={device.online} size="md" />
              <div>
                <p className="font-medium">
                  {formatDeviceStatus(device.online, device.last_seen)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {device.online ? 'Perangkat sedang online' : 'Perangkat sedang offline'}
                </p>
              </div>
            </div>
            <Badge variant={device.online ? 'default' : 'secondary'}>
              {device.online ? DEVICE_MESSAGES.STATUS_ONLINE : DEVICE_MESSAGES.STATUS_OFFLINE}
            </Badge>
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Terakhir Terlihat:</span>
              <span>{formatTimestamp(device.last_seen)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Dibuat:</span>
              <span>{formatTimestamp(device.created_at)}</span>
            </div>
            {device.updated_at && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Terakhir Diperbarui:</span>
                <span>{formatTimestamp(device.updated_at)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Kesalahan Memuat Perangkat</DialogTitle>
            <DialogDescription>
              Gagal memuat detail perangkat. Silakan coba lagi.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-8">
            <Button onClick={() => refetch()} variant="outline">
              Coba Lagi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isLoading ? (
              'Memuat Detail Perangkat...'
            ) : (
              <>
                <StatusDot online={device?.online || false} size="sm" />
                {device?.device_name || 'Detail Perangkat'}
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isLoading 
              ? 'Harap tunggu sementara kami mengambil informasi perangkat.'
              : 'Informasi lengkap tentang perangkat monitoring akuarium Anda.'
            }
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-32 bg-muted rounded-lg mb-4"></div>
              <div className="h-48 bg-muted rounded-lg mb-4"></div>
              <div className="h-32 bg-muted rounded-lg"></div>
            </div>
          </div>
        ) : device ? (
          <div className="space-y-6">
            {renderConnectionStatus()}
            {renderSensorData()}
            {renderDeviceInfo()}
          </div>
        ) : null}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex gap-2 w-full sm:w-auto">
            {device && onEdit && (
              <Button
                onClick={handleEdit}
                variant="outline"
                className="flex-1 sm:flex-none"
                disabled={isLoading}
              >
                <Edit className="h-4 w-4 mr-2" />
                {DEVICE_MESSAGES.EDIT_DEVICE}
              </Button>
            )}
            {device && onDelete && (
              <Button
                onClick={handleDelete}
                variant="destructive"
                className="flex-1 sm:flex-none"
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {DEVICE_MESSAGES.DELETE_DEVICE}
              </Button>
            )}
          </div>
          <Button onClick={onClose} variant="secondary" className="w-full sm:w-auto">
            {DEVICE_MESSAGES.CANCEL}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};