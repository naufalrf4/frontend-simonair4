import React from 'react';
import { MapPin, MoreVertical, Wrench, Sliders, Fish } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import StatusDot from '../status/StatusDot';
import { getCalibrationStatus } from '../utils/statusUtils';
import type { Device } from '../../types';

interface DeviceHeaderProps {
  device: Device;
  onCalibrateClick: () => void;
  onOffsetClick: () => void;
}

const DeviceHeader: React.FC<DeviceHeaderProps> = ({ device, onCalibrateClick, onOffsetClick }) => {
  const calibrationStatus = getCalibrationStatus(device.sensors);

  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-start gap-4 flex-1">
        <StatusDot online={device.online} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <h3 className="font-bold text-xl text-gray-900 leading-tight tracking-tight truncate">
              {device.device_name || device.id}
            </h3>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {calibrationStatus && (
              <Badge 
                variant={calibrationStatus.percentage === 100 ? "default" : "secondary"}
                className="text-xs font-medium px-3 py-1 rounded-full shadow-sm"
              >
                {calibrationStatus.percentage}% Calibrated
              </Badge>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Fish className="h-5 w-5 text-blue-500" />
          <span className="font-medium">{device.fish_count || 'N/A'}</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-9 w-9 p-0 hover:bg-white/80 transition-colors duration-200 rounded-lg shadow-sm"
              aria-label="Aksi perangkat"
            >
              <MoreVertical className="h-4 w-4 text-gray-600" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 shadow-xl border-gray-200/60">
            <DropdownMenuItem 
              onClick={onCalibrateClick}
              disabled={!device.online}
            >
              <Wrench className="h-4 w-4 text-blue-600 mr-2" />
              <span>Calibrate Sensor</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={onOffsetClick}
              disabled={!device.online}
            >
              <Sliders className="h-4 w-4 text-purple-600 mr-2" />
              <span>Set Threshold</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default DeviceHeader;
