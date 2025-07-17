import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { PH_BUFFERS } from './phUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AddPointFormProps {
  selectedBuffer: string;
  setSelectedBuffer: (value: string) => void;
  customPH: string;
  setCustomPH: (value: string) => void;
  currentVoltage: number;
  isConnected: boolean;
  onAddPoint: () => void;
  canAddPoint: boolean;
}

const AddPointForm: React.FC<AddPointFormProps> = ({
  selectedBuffer,
  setSelectedBuffer,
  customPH,
  setCustomPH,
  currentVoltage,
  onAddPoint,
  canAddPoint,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Tambah Titik Kalibrasi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Buffer pH</Label>
            <Select value={selectedBuffer} onValueChange={setSelectedBuffer}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih buffer standar" />
              </SelectTrigger>
              <SelectContent>
                {PH_BUFFERS.map((buffer) => (
                  <SelectItem key={buffer.value} value={buffer.value}>
                    {buffer.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedBuffer === 'custom' && (
            <div>
              <Label className="text-sm font-medium mb-2 block">Nilai pH Custom</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="14"
                placeholder="contoh: 7.00"
                value={customPH}
                onChange={(e) => setCustomPH(e.target.value)}
              />
            </div>
          )}

          <div>
            <Label className="text-sm font-medium mb-2 block">Voltage Terbaca</Label>
            <Input
              value={`${currentVoltage.toFixed(4)} V`}
              readOnly
              className="bg-gray-50 font-mono"
            />
          </div>
        </div>

        <Button
          onClick={onAddPoint}
          disabled={!canAddPoint}
          className="w-full h-12 text-base font-medium"
        >
          <Plus className="h-5 w-5 mr-2" />
          Tambah Titik Kalibrasi
        </Button>
      </CardContent>
    </Card>
  );
};

export default AddPointForm;
