import { Droplets, Zap, Waves } from 'lucide-react';

const SENSOR_CONFIG = {
  ph: {
    icon: Droplets,
    name: 'pH',
    description: 'Kalibrasi tingkat keasaman air',
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  tds: {
    icon: Zap,
    name: 'TDS',
    description: 'Kalibrasi kandungan zat terlarut',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  },
  do: {
    icon: Waves,
    name: 'DO',
    description: 'Kalibrasi oksigen terlarut',
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  }
};

export const isDeviceReady = (deviceData?: { online: boolean; sensors: any[] }) => {
  return deviceData?.online && deviceData?.sensors.length > 0;
};

export const getSensorData = (deviceData?: { sensors: any[] }, type?: 'ph' | 'tds' | 'do') => {
  if (!deviceData || !type) return undefined;
  return deviceData.sensors.find(s => 
    s.label.toLowerCase() === type || (type === 'do' && s.label.toLowerCase().includes('do'))
  );
};

export { SENSOR_CONFIG };