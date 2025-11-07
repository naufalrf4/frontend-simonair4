import React from 'react';
import { Wifi, WifiOff, Clock } from 'lucide-react';
import type { Device } from '../../types';
import { useTranslation } from 'react-i18next';

interface ConnectionStatusProps {
  device: Device;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ device }) => {
  const { t } = useTranslation('dashboard');
  const statusLabel = device.online ? t('statusBar.connected') : t('statusBar.disconnected');

  return (
    <div className="flex items-center justify-between text-sm bg-white/60 rounded-lg p-3 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        {device.online ? (
          <Wifi className="h-4 w-4 text-emerald-500" />
        ) : (
          <WifiOff className="h-4 w-4 text-red-500" />
        )}
        <span className={`font-semibold ${device.online ? 'text-emerald-600' : 'text-red-600'}`}>
          {statusLabel}
        </span>
      </div>
      <div className="flex items-center gap-2 text-gray-600">
        <Clock className="h-4 w-4" />
        <span className="font-medium text-xs">
          {t('connectionStatus.deviceId', { id: device.id })}
        </span>
      </div>
    </div>
  );
};

export default ConnectionStatus;
