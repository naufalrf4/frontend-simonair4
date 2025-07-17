import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, RotateCcw, CheckCircle, Beaker, Save } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TwoPointProgressProps {
  twoPointStep: 1 | 2;
  point1: CalibrationPoint | null;
  point2: CalibrationPoint | null;
  canCapture: boolean;
  onCapture: () => void;
  onReset: () => void;
}

interface CalibrationPoint {
  voltage: number;
  temp: number;
  timestamp: string;
}

const TwoPointProgress: React.FC<TwoPointProgressProps> = ({
  twoPointStep,
  point1,
  point2,
  canCapture,
  onCapture,
  onReset,
}) => {
  return (
    <Card className="border-purple-200 bg-purple-50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Beaker className="h-5 w-5" />
          Proses Kalibrasi Two-Point
          <Badge variant="outline" className="ml-2">
            Step {twoPointStep} of 2
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 ${point1 ? 'text-green-600' : 'text-gray-600'}`}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                point1 ? 'bg-green-500 text-white' : 'bg-gray-200'
              }`}
            >
              1
            </div>
            <span className="text-sm font-medium">Udara Jenuh</span>
          </div>

          <ChevronRight className="h-4 w-4 text-gray-400" />

          <div className={`flex items-center gap-2 ${point2 ? 'text-green-600' : 'text-gray-600'}`}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                point2
                  ? 'bg-green-500 text-white'
                  : twoPointStep === 2
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200'
              }`}
            >
              2
            </div>
            <span className="text-sm font-medium">Zero DO</span>
          </div>
        </div>

        {twoPointStep === 1 && !point1 && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="font-medium text-blue-800 mb-2">Step 1: Kalibrasi Udara Jenuh</div>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
              <li>Pastikan sensor DO bersih dan kering</li>
              <li>Biarkan sensor di udara terbuka selama 5-10 menit</li>
              <li>Tunggu pembacaan voltage stabil</li>
              <li>Klik "Simpan Point 1" untuk menyimpan kalibrasi udara jenuh</li>
            </ol>
          </div>
        )}

        {twoPointStep === 2 && !point2 && (
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="font-medium text-orange-800 mb-2">Step 2: Kalibrasi Zero DO</div>
            <ol className="list-decimal list-inside space-y-1 text-sm text-orange-700">
              <li>Siapkan larutan zero DO (sodium sulfite dalam air)</li>
              <li>Celupkan sensor ke dalam larutan zero DO</li>
              <li>Tunggu 2-3 menit untuk stabilisasi</li>
              <li>Klik "Simpan Point 2" untuk menyimpan kalibrasi zero</li>
            </ol>
          </div>
        )}

        {(point1 || point2) && (
          <div className="space-y-3">
            {point1 && (
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div>
                  <span className="font-medium text-green-800">Point 1 (Udara Jenuh):</span>
                  <div className="text-sm text-green-700">
                    {point1.voltage.toFixed(2)} mV @ {point1.temp.toFixed(1)}°C
                    <span className="text-xs ml-2">({point1.timestamp})</span>
                  </div>
                </div>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
            )}

            {point2 && (
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div>
                  <span className="font-medium text-green-800">Point 2 (Zero DO):</span>
                  <div className="text-sm text-green-700">
                    {point2.voltage.toFixed(2)} mV @ {point2.temp.toFixed(1)}°C
                    <span className="text-xs ml-2">({point2.timestamp})</span>
                  </div>
                </div>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3">
          {twoPointStep === 1 && !point1 && (
            <Button onClick={onCapture} disabled={!canCapture} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Simpan Point 1 (Udara Jenuh)
            </Button>
          )}

          {twoPointStep === 2 && !point2 && (
            <>
              <Button variant="outline" onClick={onReset} className="flex-shrink-0">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Point 1
              </Button>
              <Button onClick={onCapture} disabled={!canCapture} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                Simpan Point 2 (Zero DO)
              </Button>
            </>
          )}

          {point1 && point2 && (
            <Button variant="outline" onClick={onReset} className="flex-1">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Semua Point
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TwoPointProgress;
