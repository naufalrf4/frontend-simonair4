import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Thermometer, TrendingUp } from 'lucide-react';

interface CurrentReadingProps {
  currentVoltage: number;
  currentRaw: number;
  currentTemp: number;
  isConnected: boolean;
  currentEstimation: number;
}

const CurrentReading: React.FC<CurrentReadingProps> = ({
  currentVoltage,
  currentRaw,
  currentTemp,
  isConnected,
  currentEstimation,
}) => {
  return (
    <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Pembacaan Real-time
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <Label className="text-sm font-medium text-gray-600 mb-2 block">Voltage</Label>
            <div className="text-2xl font-bold text-yellow-700 mb-1">
              {currentVoltage.toFixed(4)} V
            </div>
            <div className="text-xs text-gray-500">Tegangan sensor</div>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600 mb-2 block">Raw ADC</Label>
            <div className="text-2xl font-bold text-orange-700 mb-1">
              {currentRaw?.toFixed(0) || '--'}
            </div>
            <div className="text-xs text-gray-500">Nilai mentah ADC</div>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600 mb-2 block">Suhu</Label>
            <div className="text-2xl font-bold text-blue-700 flex items-center gap-1 mb-1">
              <Thermometer className="h-5 w-5" />
              {currentTemp.toFixed(1)} °C
            </div>
            <div className="text-xs text-gray-500">Kompensasi suhu</div>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600 mb-2 block">TDS Estimasi</Label>
            <div className="text-2xl font-bold text-green-700 mb-1">
              {currentEstimation.toFixed(1)} ppm
            </div>
            <div className="text-xs text-gray-500">Tanpa kalibrasi</div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-yellow-200">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}
            />
            <span
              className={`text-sm font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}
            >
              {isConnected ? 'Terhubung' : 'Terputus'}
            </span>
          </div>
          <div className="text-xs text-gray-500">Update setiap detik</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentReading;
