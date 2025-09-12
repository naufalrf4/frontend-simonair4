import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import CalibrationInstructions from './CalibrationInstructions';
import AddPointForm from './AddPointForm';
import PointsList from './PointsList';
import RegressionDisplay from './RegressionDisplay';
import {
  calculateRegression,
  calculateRSquared,
  addPoint as utilsAddPoint,
  removePoint as utilsRemovePoint,
  canAddPoint as utilsCanAddPoint,
} from './phUtils';
import { AlertCircle, CheckCircle2, Send } from 'lucide-react';

interface PHCalibrationProps {
  deviceId: string;
  onClose: () => void;
  onBack: () => void;
  isCalibrating: boolean;
  setIsCalibrating: (value: boolean) => void;
  onSubmit: (calibrationData: any) => Promise<void>;
  currentVoltage: number;
  currentRaw: number;
  isConnected: boolean;
}

const PHCalibration: React.FC<PHCalibrationProps> = ({
  onClose,
  onBack,
  isCalibrating,
  setIsCalibrating,
  onSubmit,
  currentVoltage,
  isConnected,
}) => {
  const [selectedBuffer, setSelectedBuffer] = useState('');
  const [customPH, setCustomPH] = useState('');
  const [bufferPoints, setBufferPoints] = useState<Array<{ pH: number; voltage: number }>>([]);
  const [calibrationResult, setCalibrationResult] = useState<{ m: number; c: number } | null>(null);
  const [showFormula, setShowFormula] = useState(false);
  const rSquared = calibrationResult
    ? calculateRSquared(bufferPoints, calibrationResult.m, calibrationResult.c)
    : 0;

  useEffect(() => {
    const result = calculateRegression(bufferPoints);
    setCalibrationResult(result);
    setShowFormula(!!result);
  }, [bufferPoints]);

  const handleAddPoint = () => {
    const newPoints = utilsAddPoint(bufferPoints, selectedBuffer, customPH, currentVoltage);
    if (newPoints) {
      setBufferPoints(newPoints);
      setSelectedBuffer('');
      setCustomPH('');
    }
  };

  const handleRemovePoint = (index: number) => {
    setBufferPoints(utilsRemovePoint(bufferPoints, index));
  };

  const handleCalibrate = async () => {
    if (bufferPoints.length < 2 || !calibrationResult) return;

    setIsCalibrating(true);

    try {
      const payload = {
        sensor_type: 'ph',
        calibration_data: {
          m: parseFloat(calibrationResult.m.toFixed(5)),
          c: parseFloat(calibrationResult.c.toFixed(5)),
        },
      };

      await onSubmit(payload);

      setTimeout(() => {
        setIsCalibrating(false);
        onClose();
      }, 2000);
    } catch (error) {
      setIsCalibrating(false);
      console.error('Calibration failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <CalibrationInstructions />
      <AddPointForm
        selectedBuffer={selectedBuffer}
        setSelectedBuffer={setSelectedBuffer}
        customPH={customPH}
        setCustomPH={setCustomPH}
        currentVoltage={currentVoltage}
        isConnected={isConnected}
        onAddPoint={handleAddPoint}
        canAddPoint={!!utilsCanAddPoint(selectedBuffer, currentVoltage, isConnected, customPH)}
      />
      <PointsList bufferPoints={bufferPoints} onRemovePoint={handleRemovePoint} />
      {showFormula && calibrationResult && (
        <RegressionDisplay
          calibrationResult={calibrationResult}
          bufferPoints={bufferPoints}
          rSquared={rSquared}
          currentVoltage={currentVoltage}
        />
      )}
      
      {bufferPoints.length === 1 && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <div className="font-medium text-amber-800 mb-1">Titik Kalibrasi Belum Cukup</div>
            <div className="text-amber-700">
              Tambahkan minimal 1 titik lagi untuk menghitung regresi linear yang akurat
            </div>
          </div>
        </div>
      )}
      {rSquared > 0 && rSquared < 0.95 && (
        <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <div className="font-medium text-orange-800 mb-1">
              Kualitas Kalibrasi Rendah (R² = {rSquared.toFixed(3)})
            </div>
            <div className="text-orange-700">
              Pertimbangkan untuk menambah titik kalibrasi atau periksa stabilitas pembacaan sensor
            </div>
          </div>
        </div>
      )}
      {rSquared >= 0.99 && (
        <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <div className="font-medium text-green-800 mb-1">Kalibrasi Berkualitas Tinggi!</div>
            <div className="text-green-700">
              R² = {rSquared.toFixed(4)} menunjukkan korelasi yang sangat baik. Sensor siap
              dikalibrasi.
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
        <Button variant="outline" onClick={onBack} disabled={isCalibrating} className="w-full sm:w-auto">
          Kembali
        </Button>
        <Button
          onClick={handleCalibrate}
          disabled={bufferPoints.length < 2 || isCalibrating || !isConnected}
          className="min-w-[140px] h-12 text-base font-medium w-full sm:w-auto"
        >
          {isCalibrating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
              Mengkalibrasi...
            </>
          ) : (
            <>
              <Send className="h-5 w-5 mr-2" />
              Kirim Kalibrasi
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default PHCalibration;
