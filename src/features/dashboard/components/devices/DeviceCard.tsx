import React from 'react';
import { Card } from '@/components/ui/card';
import DeviceHeader from './DeviceHeader';
import ConnectionStatus from '../status/ConnectionStatus';
import SensorsGrid from '../sensors/SensorsGrid';
import OfflineWarning from '../status/OfflineWarning';
import { cn } from '@/lib/utils';
import type { Device } from '../../types';

interface DeviceCardProps {
  device: Device;
  onCalibrateClick: () => void;
  onOffsetClick: () => void;
}

const DeviceCard: React.FC<DeviceCardProps> = ({
  device,
  onCalibrateClick,
  onOffsetClick,
}) => {

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-300 group rounded-xl shadow-lg mb-6',
        'bg-white/90 border-2 border-gray-200/60 hover:border-gray-300/80',
        device.online ? 'hover:-translate-y-1' : 'opacity-90'
      )}
    >
      <div
        className={cn(
          'absolute top-0 left-0 right-0 h-1 transition-all duration-300',
          device.online
            ? 'bg-gradient-to-r from-emerald-500 to-cyan-500'
            : 'bg-gradient-to-r from-red-500 to-orange-500'
        )}
      />

      <div className="px-6 py-4 space-y-4">
        <DeviceHeader
          device={device}
          onCalibrateClick={onCalibrateClick}
          onOffsetClick={onOffsetClick}
        />

        <ConnectionStatus device={device} />

        <SensorsGrid
          sensors={device.sensors}
          isOnline={device.online}
          lastUpdate={device.lastData}
        />

        {!device.online && (
          <OfflineWarning lastOnline={device.lastOnline} />
        )}

      </div>
    </Card>
  );
};

export default DeviceCard;
