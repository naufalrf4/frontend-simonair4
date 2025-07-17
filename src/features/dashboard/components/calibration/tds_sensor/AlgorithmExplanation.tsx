import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Calculator } from 'lucide-react';

interface AlgorithmExplanationProps {
  currentVoltage: number;
  currentTemp: number;
  compensationCoeff: number;
  compensationVoltage: number;
  tdsRaw: number;
  kValue: number;
}

const AlgorithmExplanation: React.FC<AlgorithmExplanationProps> = ({
  currentVoltage,
  currentTemp,
  compensationCoeff,
  compensationVoltage,
  tdsRaw,
  kValue,
}) => {
  return (
    <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Algoritma Perhitungan TDS
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-white rounded-lg border border-blue-200">
          <div className="text-lg font-bold text-gray-800 mb-3">1. Kompensasi Suhu</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-mono bg-blue-50 p-3 rounded border">
                <span className="text-blue-700">Koef = 1 + 0.02 × (T - 25)</span>
              </div>
              <div className="text-xs text-gray-600 mt-1">Kompensasi 2% per °C dari 25°C</div>
            </div>
            <div>
              <div className="text-sm font-mono bg-green-50 p-3 rounded border">
                <span className="text-green-700">Koef = {compensationCoeff.toFixed(4)}</span>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Nilai saat ini pada {currentTemp.toFixed(1)}°C
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg border border-green-200">
          <div className="text-lg font-bold text-gray-800 mb-3">2. Voltage Terkompensasi</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-mono bg-green-50 p-3 rounded border">
                <span className="text-green-700">V_comp = Voltage ÷ Koef</span>
              </div>
              <div className="text-xs text-gray-600 mt-1">Normalisasi voltage ke 25°C</div>
            </div>
            <div>
              <div className="text-sm font-mono bg-yellow-50 p-3 rounded border">
                <span className="text-yellow-700">V_comp = {compensationVoltage.toFixed(4)} V</span>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {currentVoltage.toFixed(4)} ÷ {compensationCoeff.toFixed(4)}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg border border-orange-200">
          <div className="text-lg font-bold text-gray-800 mb-3">3. Formula Polynomial Cubic</div>
          <div className="text-center p-4 bg-orange-50 rounded border-2 border-orange-200 mb-4">
            <div className="text-xl font-mono font-bold text-orange-700">
              TDS = (133.42×V³ - 255.86×V² + 857.39×V) × 0.5 × K
            </div>
            <div className="text-sm text-orange-600 mt-2">
              Dimana V = Voltage terkompensasi, K = Konstanta kalibrasi
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-red-50 border border-red-200 rounded">
              <div className="text-sm font-medium text-red-800">Cubic Term</div>
              <div className="font-mono text-red-700">133.42 × V³</div>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <div className="text-sm font-medium text-blue-800">Quadratic Term</div>
              <div className="font-mono text-blue-700">-255.86 × V²</div>
            </div>
            <div className="p-3 bg-green-50 border border-green-200 rounded">
              <div className="text-sm font-medium text-green-800">Linear Term</div>
              <div className="font-mono text-green-700">857.39 × V</div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg border border-purple-200">
          <div className="text-lg font-bold text-gray-800 mb-3">4. Perhitungan Kalibrasi</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-gray-600">TDS Raw:</span>
                  <span className="font-mono ml-2 text-purple-700 font-bold">
                    {tdsRaw.toFixed(2)} ppm
                  </span>
                </div>
              </div>
            </div>
            <div>
              <div className="p-3 bg-purple-50 border border-purple-200 rounded">
                <div className="text-sm font-medium text-purple-800 mb-1">Konstanta K</div>
                <div className="text-xl font-mono font-bold text-purple-700">
                  {kValue.toFixed(4)}
                </div>
                <div className="text-xs text-purple-600 mt-1">K = Standar ÷ TDS_raw</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AlgorithmExplanation;
