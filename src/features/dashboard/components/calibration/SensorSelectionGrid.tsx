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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
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
              <CardContent className="p-4 sm:p-6 text-center">
                <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full ${config.color} flex items-center justify-center mx-auto mb-3 sm:mb-4`}>
                  <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">{config.name}</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 leading-relaxed">{config.description}</p>
                
                {hasData ? (
                  <div className="space-y-1 sm:space-y-2">
                    <div className={`text-base sm:text-lg font-bold ${config.textColor}`}>
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
                  <div className="text-xs sm:text-sm text-gray-500">Data tidak tersedia</div>
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
