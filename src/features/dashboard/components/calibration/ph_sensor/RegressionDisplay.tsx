import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calculator } from 'lucide-react';

interface RegressionDisplayProps {
  calibrationResult: { m: number; c: number };
  bufferPoints: Array<{ pH: number; voltage: number }>;
  rSquared: number;
  currentVoltage: number;
}

const RegressionDisplay: React.FC<RegressionDisplayProps> = ({
  calibrationResult,
  bufferPoints,
  rSquared,
  currentVoltage,
}) => {
  return (
    <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Persamaan Regresi Linear
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center p-4 sm:p-6 bg-white rounded-lg border-2 border-purple-200">
          <div className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">Persamaan Kalibrasi pH</div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-purple-700 mb-3 sm:mb-4">
            pH = <span className="bg-yellow-200 px-1 sm:px-2 py-1 rounded">m</span> × Voltage +{' '}
            <span className="bg-green-200 px-1 sm:px-2 py-1 rounded">c</span>
          </div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-gray-700">
            pH ={' '}
            <span className="bg-yellow-200 px-1 sm:px-2 py-1 rounded text-black">
              {calibrationResult.m.toFixed(5)}
            </span>{' '}
            × V +{' '}
            <span className="bg-green-200 px-1 sm:px-2 py-1 rounded text-black">
              {calibrationResult.c.toFixed(5)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-yellow-200 rounded flex items-center justify-center font-bold text-sm">
                m
              </div>
              <span className="font-semibold text-yellow-800">Slope (Kemiringan)</span>
            </div>
            <div className="text-sm text-yellow-700">
              <div className="font-mono text-lg mb-1">{calibrationResult.m.toFixed(5)}</div>
              <div>Sensitivitas sensor terhadap perubahan pH per volt</div>
            </div>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-green-200 rounded flex items-center justify-center font-bold text-sm">
                c
              </div>
              <span className="font-semibold text-green-800">Intercept (Konstanta)</span>
            </div>
            <div className="text-sm text-green-700">
              <div className="font-mono text-lg mb-1">{calibrationResult.c.toFixed(5)}</div>
              <div>Nilai pH ketika voltage sensor = 0V</div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <span className="font-semibold text-blue-800">Kualitas Kalibrasi</span>
            <Badge
              variant={rSquared > 0.99 ? 'default' : rSquared > 0.95 ? 'secondary' : 'destructive'}
            >
              {rSquared > 0.99 ? 'Excellent' : rSquared > 0.95 ? 'Good' : 'Poor'}
            </Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-blue-600 block">R² (Koefisien Determinasi):</Label>
              <div className="font-mono text-lg font-bold text-blue-800">
                {rSquared.toFixed(4)} ({(rSquared * 100).toFixed(2)}%)
              </div>
            </div>
            <div>
              <Label className="text-blue-600 block">Jumlah Titik Data:</Label>
              <div className="font-mono text-lg font-bold text-blue-800">
                {bufferPoints.length} titik
              </div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <Label className="text-blue-600 block">Prediksi pH Saat Ini:</Label>
            <div className="text-xl sm:text-2xl font-bold text-purple-600">
              {(calibrationResult.m * currentVoltage + calibrationResult.c).toFixed(2)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RegressionDisplay;
