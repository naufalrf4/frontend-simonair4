import React from 'react';
import { Card } from '@/components/ui/card';
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
        {/* Mobile: Minimal header */}
        <div className="sm:hidden">
          <div className="text-center space-y-1">
            <h3 className="font-semibold text-base text-gray-800">{device.device_name}</h3>
            <p className="text-xs text-gray-500">
              {device.online
                ? `Online • ${device.lastData || 'Baru saja'}`
                : `Offline • ${device.lastOnline || 'Tidak diketahui'}`}
            </p>
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

        {/* Mobile: 2x2 Grid, Desktop: Original SensorsGrid */}
        <div className="sm:hidden grid grid-cols-2 gap-2">
          {device.sensors.map((sensor, index) => (
            <div key={sensor.label || index} className="aspect-square">
              <SensorCard sensor={sensor} isOnline={device.online} lastUpdate={device.lastData} />
            </div>
          ))}
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
