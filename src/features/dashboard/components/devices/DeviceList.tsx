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
    console.log('🔧 DeviceList: Calibrate clicked for device:', device.device_id);
    onCalibrateClick(device.device_id);
  };

  const handleOffsetClick = (device: Device) => {
    console.log('⚙️ DeviceList: Offset clicked for device:', device.device_id);
    onOffsetClick(device.device_id);
  };

  // Sort online devices first, then by name
  const sortedDevices = [...devices].sort((a, b) => {
    if (a.online === b.online) {
      // Use device_name if available, fallback to id
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
