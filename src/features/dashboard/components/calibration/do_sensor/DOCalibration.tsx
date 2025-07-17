import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Send } from 'lucide-react';
import DOInstructions from './DOInstructions';
import CurrentReading from './CurrentReading';
import ModeSelection from './ModeSelection';
import TwoPointProgress from './TwoPointProgress';
import AlgorithmExplanation from './AlgorithmExplanation';
import {
  calculateSaturatedDO,
  calculateUncalibratedDO,
  calculateCalibratedDO,
  canCalibrate as utilsCanCalibrate,
} from './doUtils';

interface DOCalibrationProps {
  deviceId: string;
  onClose: () => void;
  onBack: () => void;
  isCalibrating: boolean;
  setIsCalibrating: (value: boolean) => void;
  onSubmit: (calibrationData: any) => Promise<void>;
  currentVoltage: number;
  currentTemp: number;
  currentRaw: number;
  isConnected: boolean;
}

interface CalibrationPoint {
  voltage: number;
  temp: number;
  timestamp: string;
}

const DOCalibration: React.FC<DOCalibrationProps> = ({
  onBack,
  isCalibrating,
  setIsCalibrating,
  onSubmit,
  currentVoltage,
  currentTemp,
  currentRaw,
  isConnected,
}) => {
  const [calibrationMode, setCalibrationMode] = useState<'single' | 'double'>('single');
  const [calibrationDone, setCalibrationDone] = useState(false);
  const [showFormula, setShowFormula] = useState(false);
  const [twoPointStep, setTwoPointStep] = useState<1 | 2>(1);
  const [point1, setPoint1] = useState<CalibrationPoint | null>(null);
  const [point2, setPoint2] = useState<CalibrationPoint | null>(null);

  React.useEffect(() => {
    if (calibrationMode === 'single' && calibrationDone) {
      setShowFormula(true);
    } else if (calibrationMode === 'double' && point1 && point2) {
      setShowFormula(true);
    } else {
      setShowFormula(false);
    }
  }, [calibrationMode, calibrationDone, point1, point2]);
  const saturatedDO = calculateSaturatedDO(currentTemp);
  const uncalibratedDO = calculateUncalibratedDO(currentVoltage * 1000);

  const calibratedDO = calculateCalibratedDO(
    currentVoltage * 1000,
    currentTemp,
    calibrationMode,
    point1,
    point2,
  );

  const captureCalibrationPoint = () => {
    if (!utilsCanCalibrate(currentVoltage, currentTemp, isConnected)) return;

    const point: CalibrationPoint = {
      voltage: currentVoltage,
      temp: currentTemp,
      timestamp: new Date().toISOString(),
    };

    if (twoPointStep === 1) {
      setPoint1(point);
      setTwoPointStep(2);
    } else {
      setPoint2(point);
    }
  };

  const resetTwoPointCalibration = () => {
    setPoint1(null);
    setPoint2(null);
    setTwoPointStep(1);
    setShowFormula(false);
    setCalibrationDone(false);
  };

  const handleCalibrate = async () => {
    if (isCalibrating) return;
    if (calibrationMode === 'single') {
      if (!utilsCanCalibrate(currentVoltage, currentTemp, isConnected)) return;
      setIsCalibrating(true);
      try {
        const payload = {
          sensor_type: 'do',
          calibration_data: {
            ref: saturatedDO,
            v: parseFloat((currentVoltage * 1000).toFixed(2)),
            t: parseFloat(currentTemp.toFixed(2)),
            calibrated: true,
          },
        };
        await onSubmit(payload);
        setCalibrationDone(true);
        setTimeout(() => {
          setIsCalibrating(false);
        }, 1500);
      } catch (error) {
        setIsCalibrating(false);
        setCalibrationDone(false);
        console.error('DO Calibration failed:', error);
      }
    } else {
      if (!point1 || !point2) return;
      setIsCalibrating(true);
      try {
        const payload = {
          sensor_type: 'do',
          calibration_data: {
            ref: saturatedDO,
            v1: parseFloat((point1.voltage * 1000).toFixed(2)),
            t1: parseFloat(point1.temp.toFixed(2)),
            v2: parseFloat((point2.voltage * 1000).toFixed(2)),
            t2: parseFloat(point2.temp.toFixed(2)),
            calibrated: true,
          },
        };
        await onSubmit(payload);
        setCalibrationDone(true);
        setTimeout(() => {
          setIsCalibrating(false);
        }, 1500);
      } catch (error) {
        setIsCalibrating(false);
        setCalibrationDone(false);
        console.error('DO Calibration failed:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <DOInstructions />
      <CurrentReading
        currentVoltage={currentVoltage}
        currentRaw={currentRaw}
        currentTemp={currentTemp}
        isConnected={isConnected}
        uncalibratedDO={uncalibratedDO}
        calibratedDO={calibratedDO}
        saturatedDO={saturatedDO}
      />
      <ModeSelection
        calibrationMode={calibrationMode}
        setCalibrationMode={setCalibrationMode}
        onReset={resetTwoPointCalibration}
      />
      {calibrationMode === 'double' && (
        <TwoPointProgress
          twoPointStep={twoPointStep}
          point1={point1}
          point2={point2}
          canCapture={utilsCanCalibrate(currentVoltage, currentTemp, isConnected)}
          onCapture={captureCalibrationPoint}
          onReset={resetTwoPointCalibration}
        />
      )}
      {showFormula && (
        <AlgorithmExplanation
          currentVoltage={currentVoltage * 1000}
          currentTemp={currentTemp}
          calibratedDO={calibratedDO}
          uncalibratedDO={uncalibratedDO}
          point1={point1}
          point2={point2}
          mode={calibrationMode}
        />
      )}
      {!isConnected && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <div className="font-medium text-red-800 mb-1">Koneksi Terputus</div>
            <div className="text-red-700">Pastikan perangkat online dan mengirim data sensor.</div>
          </div>
        </div>
      )}
      {currentVoltage === 0 && isConnected && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <div className="font-medium text-amber-800 mb-1">Tidak Ada Data Voltage</div>
            <div className="text-amber-700">Pastikan sensor DO terhubung dan mengirim data.</div>
          </div>
        </div>
      )}
      {calibrationDone && (
        <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <div className="font-medium text-green-800 mb-1">Kalibrasi Berhasil!</div>
            <div className="text-green-700">
              Sensor DO telah dikalibrasi dengan mode{' '}
              {calibrationMode === 'single' ? 'single point' : 'two point'}.
            </div>
          </div>
        </div>
      )}
      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button variant="outline" onClick={onBack} disabled={isCalibrating}>
          Kembali
        </Button>
        <Button
          onClick={handleCalibrate}
          disabled={
            isCalibrating ||
            (calibrationMode === 'single' &&
              !utilsCanCalibrate(currentVoltage, currentTemp, isConnected)) ||
            (calibrationMode === 'double' && (!point1 || !point2))
          }
          className="min-w-[140px] h-12 text-base font-medium"
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

export default DOCalibration;
