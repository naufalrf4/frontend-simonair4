import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Droplets } from 'lucide-react';
import { TDS_STANDARDS } from './tdsUtils';

interface StandardSelectionProps {
  standardTDS: string;
  customStandard: string;
  setCustomStandard: (value: string) => void;
  onStandardSelect: (value: string) => void;
  finalStandard: number;
  kValue?: number;
}

const StandardSelection: React.FC<StandardSelectionProps> = ({
  standardTDS,
  customStandard,
  setCustomStandard,
  onStandardSelect,
  finalStandard,
  kValue,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Pilih Larutan Standar</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-sm font-medium mb-3 block">Standar Umum:</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {TDS_STANDARDS.map((standard) => (
              <Button
                key={standard.value}
                variant={standardTDS === standard.value.toString() ? 'default' : 'outline'}
                size="sm"
                onClick={() => onStandardSelect(standard.value.toString())}
                className="text-xs h-auto py-3 px-3 flex flex-col items-center"
              >
                <div className="font-bold">{standard.value} ppm</div>
                <div className="text-xs opacity-70 mt-1">
                  {standard.label.includes('NaCl')
                    ? 'NaCl'
                    : standard.label.includes('KCl')
                      ? 'KCl'
                      : standard.label.includes('Air')
                        ? 'H₂O'
                        : 'Standard'}
                </div>
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Button
              variant={standardTDS === 'custom' ? 'default' : 'outline'}
              onClick={() => onStandardSelect('custom')}
              className="w-full h-12"
            >
              <Droplets className="h-4 w-4 mr-2" />
              Nilai Custom
            </Button>
          </div>
          {standardTDS === 'custom' && (
            <div>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="2000"
                placeholder="Masukkan nilai TDS (ppm)"
                value={customStandard}
                onChange={(e) => setCustomStandard(e.target.value)}
                className="h-12"
              />
            </div>
          )}
        </div>

        {standardTDS && !isNaN(finalStandard) && (
          <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700">Standar Terpilih:</span>
                <div className="text-xl font-bold text-blue-700 mt-1">
                  {finalStandard.toFixed(1)} ppm
                </div>
              </div>
              {kValue && (
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-700">Konstanta K:</span>
                  <div className="text-xl font-bold text-purple-700 mt-1">{kValue.toFixed(4)}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StandardSelection;
