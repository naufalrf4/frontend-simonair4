// @/src/features/dashboard/SystemStatusBar.tsx   
// REFACTORED: Extracted from UserDashboard.tsx for SoC - Handles system status display

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Wifi, Activity, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SystemStatusBarProps {
  isConnected: boolean;
  onlineDevices: number;
  totalDevices: number;
  lastUpdate: string;
}

// Internal ConnectionStatus sub-component for reuse
const ConnectionStatus = ({ isConnected }: { isConnected: boolean }) => (
  <div className="flex items-center gap-2">
    <div className={cn(
      "w-2.5 h-2.5 rounded-full transition-all duration-300",
      isConnected ? 'bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50' : 'bg-red-500 shadow-lg shadow-red-500/50'
    )} />
    <span className={cn(
      "text-sm font-semibold",
      isConnected ? 'text-emerald-600' : 'text-red-600'
    )}>
      {isConnected ? 'Terhubung' : 'Terputus'}
    </span>
  </div>
);

const SystemStatusBar: React.FC<SystemStatusBarProps> = ({ isConnected, onlineDevices, totalDevices, lastUpdate }) => {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-2 border-white/60 shadow-xl">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Connection Status */}
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl shadow-md">
              <Wifi className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">Koneksi</p>
              <ConnectionStatus isConnected={isConnected} />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl shadow-md">
              <Activity className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">Perangkat Online</p>
              <p className="text-lg font-bold text-gray-800">
                {onlineDevices}/{totalDevices}
              </p>
            </div>
          </div>

            <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl shadow-md">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">Terakhir</p>
              <p className="text-base font-bold text-gray-800">{lastUpdate || 'Menunggu...'}</p>
            </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemStatusBar;
