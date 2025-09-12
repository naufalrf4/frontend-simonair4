import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wrench, Sliders } from 'lucide-react';
import DeviceHeader from './DeviceHeader';
import ConnectionStatus from '../status/ConnectionStatus';
import SensorsGrid from '../sensors/SensorsGrid';
import OfflineWarning from '../status/OfflineWarning';
import { cn } from '@/lib/utils';
import type { Device } from '../../types';
import SensorCard from '../sensors/SensorCard';

interface DeviceCardProps {
  device: Device;
  onCalibrateClick: () => void;
  onOffsetClick: () => void;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device, onCalibrateClick, onOffsetClick }) => {
  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-300 group rounded-xl shadow-lg mb-3 sm:mb-6',
        'bg-white/90 border-2 border-gray-200/60 hover:border-gray-300/80',
        device.online ? 'hover:-translate-y-1' : 'opacity-90',
      )}
    >
      <div
        className={cn(
          'absolute top-0 left-0 right-0 h-0.5 sm:h-1 transition-all duration-300',
          device.online
            ? 'bg-gradient-to-r from-emerald-500 to-cyan-500'
            : 'bg-gradient-to-r from-red-500 to-orange-500',
        )}
      />

      <div className="px-3 py-3 sm:px-6 sm:py-4 space-y-2 sm:space-y-4">
        <div className="sm:hidden">
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-base text-gray-800">{device.device_name}</h3>
            <p className="text-xs text-gray-500">
              {device.online
                ? `Online • ${device.lastData || 'Just now'}`
                : `Offline • ${device.lastOnline || 'Unknown'}`}
            </p>
            
            {/* Mobile quick action buttons */}
            <div className="flex justify-center gap-2 pt-1">
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onCalibrateClick();
                }}
                disabled={!device.online}
                className="h-8 px-3 text-xs"
              >
                <Wrench className="h-3 w-3 mr-1" />
                Calibration
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onOffsetClick();
                }}
                disabled={!device.online}
                className="h-8 px-3 text-xs"
              >
                <Sliders className="h-3 w-3 mr-1" />
                Threshold
              </Button>
            </div>
          </div>
        </div>

        {/* Desktop: Keep original layout */}
        <div className="hidden sm:block">
          <DeviceHeader
            device={device}
            onCalibrateClick={onCalibrateClick}
            onOffsetClick={onOffsetClick}
          />
        </div>

        <div className="hidden sm:block">
          <ConnectionStatus device={device} />
        </div>

        {/* Mobile: 2x2 responsive grid of sensors */}
        <div className="sm:hidden">
          <div className="grid grid-cols-2 gap-3">
            {device.sensors.map((sensor, index) => (
              <SensorCard
                key={sensor.label || index}
                sensor={sensor}
                isOnline={device.online}
                lastUpdate={device.lastData}
              />
            ))}
          </div>
        </div>

        <div className="hidden sm:block">
          <SensorsGrid
            sensors={device.sensors}
            isOnline={device.online}
            lastUpdate={device.lastData}
          />
        </div>

        {!device.online && (
          <div className="hidden sm:block">
            <OfflineWarning lastOnline={device.lastOnline} />
          </div>
        )}
      </div>
    </Card>
  );
};

export default DeviceCard;
