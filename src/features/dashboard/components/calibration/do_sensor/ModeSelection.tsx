import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface ModeSelectionProps {
  calibrationMode: 'single' | 'double';
  setCalibrationMode: (mode: 'single' | 'double') => void;
  onReset: () => void;
}

const ModeSelection: React.FC<ModeSelectionProps> = ({
  calibrationMode,
  setCalibrationMode,
  onReset,
}) => {
  return (
    <RadioGroup
      value={calibrationMode}
      onValueChange={(value: 'single' | 'double') => {
        setCalibrationMode(value);
        if (value === 'single') onReset();
      }}
      className="space-y-4"
    >
      <div className="flex items-start space-x-3">
        <RadioGroupItem value="single" id="single" className="mt-1" />
        <div className="space-y-1">
          <Label htmlFor="single" className="font-medium">
            Single Point (Udara Jenuh)
          </Label>
          <p className="text-sm text-gray-600">
            Kalibrasi menggunakan udara jenuh pada suhu saat ini. Cocok untuk penggunaan umum dan
            pemeliharaan rutin.
          </p>
        </div>
      </div>

      <div className="flex items-start space-x-3">
        <RadioGroupItem value="double" id="double" className="mt-1" />
        <div className="space-y-1">
          <Label htmlFor="double" className="font-medium">
            Two Point (Udara + Zero)
          </Label>
          <p className="text-sm text-gray-600">
            Kalibrasi menggunakan udara jenuh dan larutan zero DO. Memberikan akurasi maksimal untuk
            pengukuran presisi.
          </p>
        </div>
      </div>
    </RadioGroup>
  );
};

export default ModeSelection;
