import React from 'react';
import SensorCard from './SensorCard';
import type { Sensor } from '../../types';

interface SensorsGridProps {
  sensors: Sensor[];
  isOnline: boolean;
  lastUpdate: string;
}

const SensorsGrid: React.FC<SensorsGridProps> = ({ sensors, isOnline, lastUpdate }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
      {sensors.map((sensor, index) => (
        <SensorCard key={index} sensor={sensor} isOnline={isOnline} lastUpdate={lastUpdate} />
      ))}
    </div>
  );
};

export default SensorsGrid;
