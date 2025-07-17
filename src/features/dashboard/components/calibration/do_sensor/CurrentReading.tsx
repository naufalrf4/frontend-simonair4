import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Thermometer, TrendingUp } from 'lucide-react';

interface CurrentReadingProps {
  currentVoltage: number;
  currentRaw: number;
  currentTemp: number;
  isConnected: boolean;
  uncalibratedDO: number;
  calibratedDO: number;
  saturatedDO: number;
}

const CurrentReading: React.FC<CurrentReadingProps> = ({
  currentVoltage,
  currentRaw,
  currentTemp,
  isConnected,
  uncalibratedDO,
  calibratedDO,
  saturatedDO,
}) => {
  return (
    <Card className="border-green-200 bg-gradient-to-r from-green-50 to-teal-50">
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
            <div className="text-2xl font-bold text-green-700 mb-1">
              {currentVoltage.toFixed(2)} mV
            </div>
            <div className="text-xs text-gray-500">Tegangan sensor</div>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600 mb-2 block">Raw ADC</Label>
            <div className="text-2xl font-bold text-teal-700 mb-1">
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
            <Label className="text-sm font-medium text-gray-600 mb-2 block">DO Teoritis</Label>
            <div className="text-2xl font-bold text-cyan-700 mb-1">
              {saturatedDO.toFixed(2)} mg/L
            </div>
            <div className="text-xs text-gray-500">Saturasi teoritis</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="p-3 bg-orange-50 border border-orange-200 rounded">
            <Label className="text-sm font-medium text-orange-800 block mb-1">Uncalibrated</Label>
            <div className="text-xl font-bold text-orange-700">
              {uncalibratedDO.toFixed(3)} mg/L
            </div>
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded">
            <Label className="text-sm font-medium text-emerald-800 block mb-1">Calibrated</Label>
            <div className="text-xl font-bold text-emerald-700">{calibratedDO.toFixed(3)} mg/L</div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-green-200">
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
