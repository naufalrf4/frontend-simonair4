import { Droplets, Zap, Fish, Thermometer, Activity, AlertTriangle, CheckCircle } from 'lucide-react';

export const getSensorConfig = (label: string) => {
  switch (label.toLowerCase()) {
    case 'ph':
      return {
        icon: Droplets,
        gradient: 'from-blue-500 to-cyan-500',
        bgGradient: 'from-blue-50 to-cyan-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-700',
        iconColor: 'text-blue-600',
        nameKey: 'sensors.labels.ph' as const,
      };
    case 'tds':
      return {
        icon: Zap,
        gradient: 'from-yellow-500 to-orange-500',
        bgGradient: 'from-yellow-50 to-orange-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-700',
        iconColor: 'text-yellow-600',
        nameKey: 'sensors.labels.tds' as const,
      };
    case 'do':
      return {
        icon: Fish,
        gradient: 'from-green-500 to-emerald-500',
        bgGradient: 'from-green-50 to-emerald-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-700',
        iconColor: 'text-green-600',
        nameKey: 'sensors.labels.do' as const,
      };
    case 'suhu':
    case 'temperature':
      return {
        icon: Thermometer,
        gradient: 'from-red-500 to-pink-500',
        bgGradient: 'from-red-50 to-pink-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-700',
        iconColor: 'text-red-600',
        nameKey: 'sensors.labels.temperature' as const,
      };
    default:
      return {
        icon: Activity,
        gradient: 'from-gray-500 to-slate-500',
        bgGradient: 'from-gray-50 to-slate-50',
        borderColor: 'border-gray-200',
        textColor: 'text-gray-700',
        iconColor: 'text-gray-600',
        name: label,
      };
  }
};

export const getStatusConfig = (status: string, isOnline: boolean) => {
  if (!isOnline) {
    return {
      color: 'bg-gray-500',
      textColor: 'text-gray-700',
      icon: AlertTriangle,
      labelKey: 'sensorStatus.offline' as const,
      variant: 'secondary' as const,
    };
  }

  switch (status) {
    case 'GOOD':
      return {
        color: 'bg-green-500',
        textColor: 'text-green-500',
        icon: CheckCircle,
        labelKey: 'sensorStatus.good' as const,
        variant: 'default' as const,
      };
    case 'BAD':
      return {
        color: 'bg-red-500',
        textColor: 'text-red-700',
        icon: AlertTriangle,
        labelKey: 'sensorStatus.bad' as const,
        variant: 'destructive' as const,
      };
    default:
      return {
        color: 'bg-gray-400',
        textColor: 'text-gray-600',
        icon: Activity,
        labelKey: 'sensorStatus.unknown' as const,
        variant: 'outline' as const,
      };
  }
};
