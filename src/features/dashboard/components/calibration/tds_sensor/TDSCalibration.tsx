import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Send } from 'lucide-react';
import TDSInstructions from './TDSInstructions';
import CurrentReading from './CurrentReading';
import StandardSelection from './StandardSelection';
import AlgorithmExplanation from './AlgorithmExplanation';
import {
  calculateTDSAlgorithm,
  getFinalStandard as getFinalStandardUtil,
} from './tdsUtils';

interface TDSCalibrationProps {
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

const TDSCalibration: React.FC<TDSCalibrationProps> = ({
  onClose,
  onBack,
  isCalibrating,
  setIsCalibrating,
  onSubmit,
  currentVoltage,
  currentTemp,
  currentRaw,
  isConnected,
}) => {
  const [standardTDS, setStandardTDS] = useState('');
  const [customStandard, setCustomStandard] = useState('');
  const [calibrationDone, setCalibrationDone] = useState(false);
  const [showFormula, setShowFormula] = useState(false);
  const [calculationResult, setCalculationResult] = useState<{
    compensationCoeff: number;
    compensationVoltage: number;
    tdsRaw: number;
    kValue: number;
    tdsCalibrated: number;
  } | null>(null);

  const finalStandard = getFinalStandardUtil(standardTDS, customStandard);

  useEffect(() => {
    if (currentVoltage > 0 && currentTemp > 0 && !isNaN(finalStandard) && finalStandard > 0) {
      const result = calculateTDSAlgorithm(currentVoltage, currentTemp, finalStandard);
      setCalculationResult(result);
      setShowFormula(true);
    } else {
      setShowFormula(false);
    }
  }, [currentVoltage, currentTemp, standardTDS, customStandard]);

  const canCalibrate = () => {
    return (
      !isNaN(finalStandard) &&
      finalStandard >= 0 &&
      currentVoltage > 0 &&
      currentTemp > 0 &&
      isConnected
    );
  };

  const handleStandardSelect = (value: string) => {
    if (value === 'custom') {
      setStandardTDS('custom');
      setCustomStandard('');
    } else {
      setStandardTDS(value);
      setCustomStandard('');
    }
  };

  const handleCalibrate = async () => {
    if (!canCalibrate()) return;

    setIsCalibrating(true);

    try {
      const payload = {
        sensor_type: 'tds',
        calibration_data: {
          v: parseFloat(currentVoltage.toFixed(4)),
          std: parseFloat(finalStandard.toFixed(2)),
          t: parseFloat(currentTemp.toFixed(2)),
        },
      };

      await onSubmit(payload);

      setCalibrationDone(true);

      setTimeout(() => {
        setIsCalibrating(false);
        onClose();
      }, 2000);
    } catch (error) {
      setIsCalibrating(false);
      console.error('TDS Calibration failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <TDSInstructions />
      <CurrentReading
        currentVoltage={currentVoltage}
        currentRaw={currentRaw}
        currentTemp={currentTemp}
        isConnected={isConnected}
        currentEstimation={calculationResult?.tdsRaw || 0}
      />
      <StandardSelection
        standardTDS={standardTDS}
        customStandard={customStandard}
        setCustomStandard={setCustomStandard}
        onStandardSelect={handleStandardSelect}
        finalStandard={finalStandard}
        kValue={calculationResult?.kValue}
      />
      {showFormula && calculationResult && (
        <AlgorithmExplanation
          currentVoltage={currentVoltage}
          currentTemp={currentTemp}
          compensationCoeff={calculationResult.compensationCoeff}
          compensationVoltage={calculationResult.compensationVoltage}
          tdsRaw={calculationResult.tdsRaw}
          kValue={calculationResult.kValue}
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
            <div className="text-amber-700">Pastikan sensor TDS terhubung dan mengirim data.</div>
          </div>
        </div>
      )}
      {calibrationDone && (
        <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <div className="font-medium text-green-800 mb-1">Kalibrasi Berhasil!</div>
            <div className="text-green-700">
              Sensor TDS telah dikalibrasi dengan standar {finalStandard.toFixed(1)} ppm.
              {calculationResult && (
                <span> Konstanta K = {calculationResult.kValue.toFixed(4)}</span>
              )}
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
          disabled={!canCalibrate() || isCalibrating}
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

export default TDSCalibration;
