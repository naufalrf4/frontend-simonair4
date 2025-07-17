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
        name: 'Tingkat pH'
      };
    case 'tds':
      return {
        icon: Zap,
        gradient: 'from-yellow-500 to-orange-500',
        bgGradient: 'from-yellow-50 to-orange-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-700',
        iconColor: 'text-yellow-600',
        name: 'Total Zat Terlarut'
      };
    case 'do':
      return {
        icon: Fish,
        gradient: 'from-green-500 to-emerald-500',
        bgGradient: 'from-green-50 to-emerald-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-700',
        iconColor: 'text-green-600',
        name: 'Oksigen Terlarut'
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
        name: 'Suhu Air'
      };
    default:
      return {
        icon: Activity,
        gradient: 'from-gray-500 to-slate-500',
        bgGradient: 'from-gray-50 to-slate-50',
        borderColor: 'border-gray-200',
        textColor: 'text-gray-700',
        iconColor: 'text-gray-600',
        name: label
      };
  }
};

export const getStatusConfig = (status: string, isOnline: boolean) => {
  if (!isOnline) {
    return {
      color: 'bg-gray-500',
      textColor: 'text-gray-700',
      icon: AlertTriangle,
      label: 'Offline',
      variant: 'secondary' as const
    };
  }

  switch (status) {
    case 'GOOD':
      return {
        color: 'bg-green-500',
        textColor: 'text-green-500',
        icon: CheckCircle,
        label: '',
        variant: 'default' as const
      };
    case 'BAD':
      return {
        color: 'bg-red-500',
        textColor: 'text-red-700',
        icon: AlertTriangle,
        label: '',
        variant: 'destructive' as const
      };
    default:
      return {
        color: 'bg-gray-400',
        textColor: 'text-gray-600',
        icon: Activity,
        label: 'Tidak Diketahui',
        variant: 'outline' as const
      };
  }
};