import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Calculator, Database } from 'lucide-react';
import { getSaturationFromTable } from './doUtils';

interface AlgorithmExplanationProps {
  currentVoltage: number;
  currentTemp: number;
  calibratedDO: number;
  uncalibratedDO: number;
  point1: CalibrationPoint | null;
  point2: CalibrationPoint | null;
  mode: 'single' | 'double';
}

interface CalibrationPoint {
  voltage: number;
  temp: number;
  timestamp: string;
}

const AlgorithmExplanation: React.FC<AlgorithmExplanationProps> = ({
  currentVoltage,
  currentTemp,
  calibratedDO,
  uncalibratedDO,
  point1,
  point2,
  mode,
}) => {
  const satFromTable = getSaturationFromTable(currentTemp);
  return (
    <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Algoritma Perhitungan DO
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-white rounded-lg border border-blue-200">
          <div className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Database className="h-5 w-5" />
            1. Lookup Table Saturasi
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-mono bg-blue-50 p-3 rounded border">
                <span className="text-blue-700">sat = DO_Table[constrain(temp, 0, 40)]</span>
              </div>
              <div className="text-xs text-gray-600 mt-1">Tabel 41 nilai saturasi dari 0-40°C</div>
            </div>
            <div>
              <div className="text-sm font-mono bg-green-50 p-3 rounded border">
                <span className="text-green-700">
                  sat = {satFromTable.toFixed(0)} (pada {currentTemp.toFixed(1)}°C)
                </span>
              </div>
              <div className="text-xs text-gray-600 mt-1">Nilai saturasi untuk suhu saat ini</div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg border border-orange-200">
          <div className="text-lg font-bold text-gray-800 mb-3">2. Formula Tanpa Kalibrasi</div>
          <div className="text-center p-4 bg-orange-50 rounded border-2 border-orange-200 mb-4">
            <div className="text-xl font-mono font-bold text-orange-700">
              DO = (voltage × 6.5) ÷ 1000
            </div>
            <div className="text-sm text-orange-600 mt-2">
              Formula sederhana untuk estimasi awal
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-mono text-orange-700">
              DO uncalibrated = {uncalibratedDO.toFixed(3)} mg/L
            </div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg border border-green-200">
          <div className="text-lg font-bold text-gray-800 mb-3">3. Formula Terkalibrasi</div>
          <div className="text-center p-4 bg-green-50 rounded border-2 border-green-200 mb-4">
            <div className="text-xl font-mono font-bold text-green-700">
              DO = (voltage × sat) ÷ (vSat × 1000)
            </div>
            <div className="text-sm text-green-600 mt-2">
              Dimana vSat = voltage saturasi dari kalibrasi
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <div className="text-sm font-medium text-blue-800">Current Voltage</div>
              <div className="font-mono text-blue-700 text-lg">{currentVoltage.toFixed(2)} mV</div>
            </div>
            <div className="p-3 bg-purple-50 border border-purple-200 rounded">
              <div className="text-sm font-medium text-purple-800">Saturation Value</div>
              <div className="font-mono text-purple-700 text-lg">{satFromTable}</div>
            </div>
            <div className="p-3 bg-green-50 border border-green-200 rounded">
              <div className="text-sm font-medium text-green-800">Result</div>
              <div className="font-mono text-green-700 text-lg">{calibratedDO.toFixed(3)} mg/L</div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg border border-indigo-200">
          <div className="text-lg font-bold text-gray-800 mb-3">
            4. Perhitungan vSat (Voltage Saturasi)
          </div>
          <div className="mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded">
            <div className="font-medium text-indigo-800 mb-2">Single Point Mode:</div>
            <div className="text-sm font-mono bg-white p-2 rounded border">
              <span className="text-indigo-700">vSat = cal1_v</span>
            </div>
            <div className="text-xs text-indigo-600 mt-1">
              Menggunakan satu titik kalibrasi (udara jenuh)
            </div>
          </div>

          <div className="p-3 bg-purple-50 border border-purple-200 rounded">
            <div className="font-medium text-purple-800 mb-2">Two Point Mode:</div>
            <div className="text-sm font-mono bg-white p-2 rounded border">
              <span className="text-purple-700">
                vSat = cal1_v + ((T - cal1_t) × (cal2_v - cal1_v)) ÷ (cal2_t - cal1_t)
              </span>
            </div>
            <div className="text-xs text-purple-600 mt-1">
              Interpolasi linear antara dua titik kalibrasi
            </div>
          </div>

          {(point1 || mode === 'single') && (
            <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded">
              <div className="font-medium text-gray-800 mb-2">Perhitungan saat ini:</div>
              {mode === 'single' ? (
                <div className="text-sm">
                  <span className="text-gray-600">vSat = </span>
                  <span className="font-mono text-blue-700">{currentVoltage.toFixed(2)} mV</span>
                  <span className="text-gray-600"> (single point)</span>
                </div>
              ) : point1 && point2 ? (
                <div className="text-sm space-y-1">
                  <div>
                    <span className="text-gray-600">vSat = </span>
                    <span className="font-mono text-purple-700">
                      {point1.voltage.toFixed(2)} + (({currentTemp.toFixed(1)} -{' '}
                      {point1.temp.toFixed(1)}) × ({point2.voltage.toFixed(2)} -{' '}
                      {point1.voltage.toFixed(2)})) ÷ ({point2.temp.toFixed(1)} -{' '}
                      {point1.temp.toFixed(1)})
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">vSat = </span>
                    <span className="font-mono text-green-700">
                      {(
                        point1.voltage +
                        ((currentTemp - point1.temp) * (point2.voltage - point1.voltage)) /
                          (point2.temp - point1.temp)
                      ).toFixed(2)}{' '}
                      mV
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">Menunggu point kalibrasi...</div>
              )}
            </div>
          )}
        </div>

        {(point1 || mode === 'single') && (
          <div className="p-4 bg-white rounded-lg border border-emerald-200">
            <div className="text-lg font-bold text-gray-800 mb-3">5. Hasil Perhitungan Final</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Uncalibrated:</div>
                <div className="text-2xl font-bold text-orange-600">
                  {uncalibratedDO.toFixed(3)} mg/L
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Calibrated:</div>
                <div className="text-2xl font-bold text-emerald-600">
                  {calibratedDO.toFixed(3)} mg/L
                </div>
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              Range: 0-20 mg/L (constrained automatically)
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AlgorithmExplanation;
