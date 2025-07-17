import React from 'react';
import { Waves, Fish, Sparkles } from 'lucide-react';
import { getGreeting } from '../utils/dashboardUtils';

const DashboardHeader: React.FC = () => {
  return (
    <div className="block md:hidden text-center py-6 relative">
      <div className="flex items-center justify-center gap-4 mb-4 relative">
        <div className="relative">
          <Fish className="h-10 w-10 text-blue-600 drop-shadow animate-float" />
          <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse shadow" />
        </div>
        <Waves className="h-8 w-8 text-cyan-500 animate-wave drop-shadow" />
        <Sparkles className="h-6 w-6 text-blue-400 animate-pulse drop-shadow" />
      </div>

      <h1 className="text-3xl font-bold mb-3 tracking-tight">
        <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 bg-clip-text text-transparent">
          {getGreeting()}
        </span>
        <span className="text-gray-700 ml-2">🌊</span>
      </h1>

      <p className="text-base text-gray-600 mx-auto leading-snug font-medium max-w-xs">
        Sistem Monitoring Kualitas Air (SIMONAIR 4.0)
      </p>
    </div>
  );
};

export default DashboardHeader;
