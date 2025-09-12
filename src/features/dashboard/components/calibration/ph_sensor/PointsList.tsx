import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface PointsListProps {
  bufferPoints: Array<{pH: number, voltage: number}>;
  onRemovePoint: (index: number) => void;
}

const PointsList: React.FC<PointsListProps> = ({ bufferPoints, onRemovePoint }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>Titik Kalibrasi ({bufferPoints.length})</span>
          <Badge variant="outline" className="text-xs self-start sm:self-auto">
            {bufferPoints.length >= 2 ? 'Siap Kalibrasi' : 'Perlu 1 titik lagi'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {bufferPoints.map((point, index) => (
            <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200 gap-3">
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="font-bold">#{index + 1}</Badge>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-lg">pH {point.pH}</span>
                    <span className="text-gray-400">→</span>
                    <span className="text-blue-600 font-mono">{point.voltage.toFixed(4)} V</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Buffer standar • Voltage akurat
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemovePoint(index)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 self-start sm:self-auto"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PointsList;
