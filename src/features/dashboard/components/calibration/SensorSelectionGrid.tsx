import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';
import { SENSOR_CONFIG } from '../utils/calibrationUtils';

interface SensorSelectionGridProps {
  deviceData?: { sensors: any[] };
  isReady: boolean;
  onSelect: (sensor: 'ph' | 'tds' | 'do') => void;
  getSensor: (type: 'ph' | 'tds' | 'do') => any;
}

const SensorSelectionGrid: React.FC<SensorSelectionGridProps> = ({ isReady, onSelect, getSensor }) => {
  return (
    <div className="text-center">
      <Activity className="h-12 w-12 mx-auto text-blue-500 mb-4" />
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Kalibrasi Sensor</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {Object.entries(SENSOR_CONFIG).map(([key, config]) => {
          const sensorData = getSensor(key as 'ph' | 'tds' | 'do');
          const Icon = config.icon;
          const hasData = !!sensorData;
          
          return (
            <Card 
              key={key}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
                hasData && isReady
                  ? `hover:${config.borderColor} hover:-translate-y-1`
                  : 'opacity-50 cursor-not-allowed'
              }`}
              onClick={() => hasData && isReady && onSelect(key as 'ph' | 'tds' | 'do')}
            >
              <CardContent className="p-6 text-center">
                <div className={`w-16 h-16 rounded-full ${config.color} flex items-center justify-center mx-auto mb-4`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{config.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{config.description}</p>
                
                {hasData ? (
                  <div className="space-y-2">
                    <div className={`text-lg font-bold ${config.textColor}`}>
                      {sensorData.value} {sensorData.unit}
                    </div>
                    <Badge 
                      variant={sensorData.status === 'GOOD' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {sensorData.status}
                    </Badge>
                    {sensorData.calibrated_ok !== undefined && (
                      <div className={`text-xs ${sensorData.calibrated_ok ? 'text-green-600' : 'text-orange-600'}`}>
                        {sensorData.calibrated_ok ? '✓ Terkalibrasi' : '⚠ Perlu Kalibrasi'}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">Data tidak tersedia</div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SensorSelectionGrid;