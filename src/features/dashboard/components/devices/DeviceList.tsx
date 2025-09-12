import React from 'react';
import DeviceCard from './DeviceCard';
import type { Device } from '../../types';

interface DeviceListProps {
  devices: Device[];
  onCalibrateClick: (deviceId: string) => void;
  onOffsetClick: (deviceId: string) => void;
}

const DeviceList: React.FC<DeviceListProps> = ({ devices, onCalibrateClick, onOffsetClick }) => {
  const handleCalibrateClick = (device: Device) => {
    onCalibrateClick(device.device_id);
  };

  const handleOffsetClick = (device: Device) => {
    onOffsetClick(device.device_id);
  };

  const sortedDevices = [...devices].sort((a, b) => {
    if (a.online === b.online) {
      const nameA = a.device_name || a.id;
      const nameB = b.device_name || b.id;
      return nameA.localeCompare(nameB);
    }
    return a.online ? -1 : 1;
  });

  return (
    <div className="space-y-8">
      {sortedDevices.map((device) => (
        <DeviceCard
          key={device.id}
          device={device}
          onCalibrateClick={() => handleCalibrateClick(device)}
          onOffsetClick={() => handleOffsetClick(device)}
        />
      ))}
    </div>
  );
};

export default DeviceList;
