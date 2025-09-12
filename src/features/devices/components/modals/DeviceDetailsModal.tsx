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
  Activity,
  User
} from 'lucide-react';
import { useDeviceQuery } from '../../hooks/useDevicesQuery';
import StatusDot from '../../../dashboard/components/status/StatusDot';
import { 
  formatDeviceStatus, 
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

  // Format date in English with WIB suffix for this page
  const formatWIB = (dateString?: string | null) => {
    if (!dateString) return '-';
    try {
      const d = new Date(dateString);
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Jakarta',
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      // Example: Monday, 08 September 2025 16:00 WIB
      const parts = formatter.formatToParts(d);
      const get = (type: string) => parts.find((p) => p.type === type)?.value || '';
      const weekday = get('weekday');
      const day = get('day');
      const month = get('month');
      const year = get('year');
      const hour = get('hour');
      const minute = get('minute');
      return `${weekday}, ${day} ${month} ${year} ${hour}:${minute} WIB`;
    } catch {
      return dateString || '-';
    }
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
                    <p className="text-sm font-medium">Device Name</p>
                    <p className="text-sm text-muted-foreground">{device.device_name}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Device ID</p>
                    <p className="text-sm text-muted-foreground font-mono">{device.device_id}</p>
                  </div>
                </div>

              {device.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Location</p>
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
                    <p className="text-sm font-medium">Aquarium Size</p>
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
                    <p className="text-sm font-medium">Fish Count</p>
                    <p className="text-sm text-muted-foreground">{device.fish_count}</p>
                  </div>
                </div>
              )}

              {device.glass_type && (
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Glass Type</p>
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
            Connection Status
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
                  {device.online ? 'Device is online' : 'Device is offline'}
                </p>
              </div>
            </div>
            <Badge variant={device.online ? 'default' : 'secondary'}>
              {device.online ? 'Online' : 'Offline'}
            </Badge>
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Last Seen:</span>
              <span>{formatWIB(device.last_seen)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Created:</span>
              <span>{formatWIB(device.created_at)}</span>
            </div>
            {/* Removed Last Updated to avoid duplication with Last Seen */}
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
            <DialogTitle>Failed to Load Device</DialogTitle>
            <DialogDescription>
              Unable to load device details. Please try again.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-8">
            <Button onClick={() => refetch()} variant="outline">
              Retry
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
              'Loading Device Details...'
            ) : (
              <>
                <StatusDot online={device?.online || false} size="sm" />
                {device?.device_name || 'Device Details'}
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isLoading 
              ? 'Please wait while we fetch the device information.'
              : 'Complete information about your aquarium monitoring device.'
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
                Edit Device
              </Button>
            )}
            {/* {device && onDelete && (
              <Button
                onClick={handleDelete}
                variant="destructive"
                className="flex-1 sm:flex-none"
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Device
              </Button>
            )} */}
          </div>
          <Button onClick={onClose} variant="secondary" className="w-full sm:w-auto">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
