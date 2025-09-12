import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DeviceStatusCardProps {
  deviceData?: { online: boolean; nama: string };
  isReady: boolean;
  deviceId: string;
}

const DeviceStatusCard: React.FC<DeviceStatusCardProps> = ({ deviceData, isReady, deviceId }) => {
  return (
    <Card className="border-2 border-gray-100">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isReady ? 'bg-green-500' : 'bg-red-500'}`} />
            <div>
              <div className="font-medium">Status Perangkat</div>
              <div className={`text-sm ${isReady ? 'text-green-600' : 'text-red-600'}`}>
                {isReady ? 'Online & Siap' : 'Offline atau Tidak Ada Data'}
              </div>
            </div>
          </div>
          <Badge variant={deviceData?.online ? 'default' : 'destructive'} className="self-start sm:self-auto">
            {deviceData?.online ? 'Online' : 'Offline'}
          </Badge>
        </div>
        <div className="mt-3 text-sm">
          Pilih sensor yang ingin dikalibrasi untuk perangkat <strong>{deviceData?.nama || deviceId}</strong>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeviceStatusCard;
