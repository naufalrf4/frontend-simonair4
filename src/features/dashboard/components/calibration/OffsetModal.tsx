import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Sliders,
  Send,
  AlertCircle,
  CheckCircle,
  Info,
  RotateCcw,
  Droplets,
  Zap,
  Fish,
  Thermometer,
  Settings,
  TrendingUp
} from 'lucide-react';
interface OffsetModalProps {
  open: boolean;
  deviceId: string;
  onClose: () => void;
  currentDeviceData?: any;
  onSubmit: (thresholds: ThresholdValues) => Promise<void>;
}

interface ThresholdValues {
  ph_min: string;
  ph_max: string;
  tds_min: string;
  tds_max: string;
  do_min: string;
  do_max: string;
  temp_min: string;
  temp_max: string;
}

// Recommended threshold values - moved outside component to prevent recreation
const RECOMMENDED_THRESHOLDS = {
  ph: { min: 6.5, max: 8.5 },
  tds: { min: 50, max: 500 },
  do: { min: 5.0, max: 15.0 },
  temp: { min: 20.0, max: 30.0 }
} as const;

// Sensor configurations - moved outside component to prevent recreation
const SENSOR_CONFIGS = {
  ph: {
    icon: 'droplets',
    title: 'Ambang Batas pH',
    unit: '',
    color: 'border-blue-200 bg-blue-50',
    recommended: RECOMMENDED_THRESHOLDS.ph,
    description: 'Tingkat keasaman air (6.5-8.5 optimal)'
  },
  tds: {
    icon: 'zap',
    title: 'Ambang Batas TDS',
    unit: 'ppm',
    color: 'border-yellow-200 bg-yellow-50',
    recommended: RECOMMENDED_THRESHOLDS.tds,
    description: 'Total zat terlarut (50-500 ppm optimal)'
  },
  do: {
    icon: 'fish',
    title: 'Ambang Batas DO',
    unit: 'mg/L',
    color: 'border-green-200 bg-green-50',
    recommended: RECOMMENDED_THRESHOLDS.do,
    description: 'Oksigen terlarut (5-15 mg/L optimal)'
  },
  temp: {
    icon: 'thermometer',
    title: 'Ambang Batas Suhu',
    unit: '°C',
    color: 'border-red-200 bg-red-50',
    recommended: RECOMMENDED_THRESHOLDS.temp,
    description: 'Suhu air (20-30°C optimal)'
  }
} as const;

const OffsetModal: React.FC<OffsetModalProps> = ({
  open,
  deviceId,
  onClose,
  currentDeviceData,
  onSubmit
}) => {
  const [thresholds, setThresholds] = useState<ThresholdValues>({
    ph_min: '',
    ph_max: '',
    tds_min: '',
    tds_max: '',
    do_min: '',
    do_max: '',
    temp_min: '',
    temp_max: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mqttStatus, setMqttStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  // Reset form when modal opens/closes - Fixed with proper cleanup
  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        setSuccess(false);
        setError(null);
        setMqttStatus('disconnected');
        setIsSubmitting(false);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Memoized sensor configs with icons
  const getSensorConfig = useCallback((type: 'ph' | 'tds' | 'do' | 'temp') => {
    const config = SENSOR_CONFIGS[type];
    
    let IconComponent;
    switch (config.icon) {
      case 'droplets':
        IconComponent = <Droplets className="h-5 w-5 text-blue-500" />;
        break;
      case 'zap':
        IconComponent = <Zap className="h-5 w-5 text-yellow-500" />;
        break;
      case 'fish':
        IconComponent = <Fish className="h-5 w-5 text-green-500" />;
        break;
      case 'thermometer':
        IconComponent = <Thermometer className="h-5 w-5 text-red-500" />;
        break;
      default:
        IconComponent = <Settings className="h-5 w-5 text-gray-500" />;
    }
    
    return {
      ...config,
      icon: IconComponent
    };
  }, []);

  // Memoized handlers to prevent recreation
  const handleInputChange = useCallback((field: keyof ThresholdValues, value: string) => {
    setThresholds(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  }, [error]);

  const applyRecommended = useCallback((sensorType: 'ph' | 'tds' | 'do' | 'temp') => {
    const recommended = RECOMMENDED_THRESHOLDS[sensorType];
    setThresholds(prev => ({
      ...prev,
      [`${sensorType}_min`]: recommended.min.toString(),
      [`${sensorType}_max`]: recommended.max.toString()
    }));
  }, []);

  const clearSensor = useCallback((sensorType: 'ph' | 'tds' | 'do' | 'temp') => {
    setThresholds(prev => ({
      ...prev,
      [`${sensorType}_min`]: '',
      [`${sensorType}_max`]: ''
    }));
  }, []);

  const clearAll = useCallback(() => {
    setThresholds({
      ph_min: '',
      ph_max: '',
      tds_min: '',
      tds_max: '',
      do_min: '',
      do_max: '',
      temp_min: '',
      temp_max: ''
    });
    setError(null);
    setSuccess(false);
  }, []);

  // Memoized validation functions
  const validatePair = useCallback((minField: keyof ThresholdValues, maxField: keyof ThresholdValues) => {
    const min = thresholds[minField];
    const max = thresholds[maxField];
    
    if (!min && !max) return true;
    if ((min && !max) || (!min && max)) return false;
    if (min && max && parseFloat(min) >= parseFloat(max)) return false;
    
    return true;
  }, [thresholds]);

  // Memoized form validation
  const isFormValid = useMemo(() => {
    const validations = [
      { pair: ['ph_min', 'ph_max'] as const, name: 'pH' },
      { pair: ['tds_min', 'tds_max'] as const, name: 'TDS' },
      { pair: ['do_min', 'do_max'] as const, name: 'DO' },
      { pair: ['temp_min', 'temp_max'] as const, name: 'Temperature' }
    ];

    for (const validation of validations) {
      if (!validatePair(validation.pair[0], validation.pair[1])) {
        return false;
      }
    }

    const hasData = Object.values(thresholds).some(value => value !== '');
    return hasData;
  }, [thresholds, validatePair]);

  const validateForm = useCallback(() => {
    if (!isFormValid) {
      setError('Pastikan semua pasangan min/max valid dan minimal satu diisi');
      return false;
    }
    return true;
  }, [isFormValid]);

  // Memoized current sensor values
  const getCurrentSensorValue = useCallback((sensorType: string) => {
    if (!currentDeviceData?.sensors) return null;
    
    const sensor = currentDeviceData.sensors.find((s: any) => 
      s.label.toLowerCase() === sensorType.toLowerCase() ||
      (sensorType === 'do' && s.label.toLowerCase().includes('do')) ||
      (sensorType === 'temp' && s.label.toLowerCase().includes('suhu'))
    );
    
    return sensor ? sensor.value : null;
  }, [currentDeviceData?.sensors]);

  // Memoized sensor values for display
  const sensorValues = useMemo(() => {
    return {
      ph: getCurrentSensorValue('ph'),
      tds: getCurrentSensorValue('tds'),
      do: getCurrentSensorValue('do'),
      temp: getCurrentSensorValue('temp')
    };
  }, [getCurrentSensorValue]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await onSubmit(thresholds);
      setSuccess(true);
      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
      }, 2500);
    } catch (error) {
      console.error('❌ Error in threshold submission:', error);
      setError('Terjadi kesalahan sistem');
      setIsSubmitting(false);
    }
  }, [validateForm, thresholds, onSubmit, onClose]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-1rem)] h-[calc(100vh-2rem)] sm:h-auto max-w-6xl sm:max-h-[95vh] overflow-y-auto p-4 sm:p-6 sm:rounded-lg sm:my-8">
        <DialogHeader className="sm:pr-8 mb-2 sm:mb-0">
          <DialogTitle className="text-xl sm:text-2xl font-bold flex items-center gap-3">
            <Sliders className="h-6 w-6 text-purple-600" />
            Konfigurasi Ambang Batas Sensor
            <Badge variant="outline" className="ml-2">
              {currentDeviceData?.nama || deviceId}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 sm:mt-6 space-y-6">
          {/* Device Status Header */}
          <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Status Perangkat & Sensor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {(['ph', 'tds', 'do', 'temp'] as const).map((sensorType) => {
                  const config = getSensorConfig(sensorType);
                  const currentValue = sensorValues[sensorType];
                  
                  return (
                    <div key={sensorType} className="text-center p-2 sm:p-3 bg-white/70 rounded-lg">
                      <div className="flex items-center justify-center mb-2">
                        {config.icon}
                      </div>
                      <div className="text-sm font-medium text-gray-700 mb-1">
                        {sensorType.toUpperCase()}
                      </div>
                      <div className="text-base sm:text-lg font-bold text-gray-800">
                        {currentValue || '--'} {config.unit}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Info Section */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <div className="font-medium text-blue-800 mb-2">
                Panduan Konfigurasi Ambang Batas
              </div>
              <div className="text-blue-700 space-y-1">
                <p>• <strong>Minimum:</strong> Nilai batas bawah sensor (NORMAL jika ≥ min)</p>
                <p>• <strong>Maksimum:</strong> Nilai batas atas sensor (NORMAL jika ≤ max)</p>
                <p>• <strong>Status Diluar Ambang Batas:</strong> Jika nilai sensor di luar rentang min-max</p>
                <p>• <strong>Kosongkan:</strong> Jika tidak ingin mengatur ambang batas untuk sensor tertentu</p>
              </div>
            </div>
          </div>

          {/* Threshold Configuration Grid - Responsive for mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {(['ph', 'tds', 'do', 'temp'] as const).map((sensorType) => {
              const config = getSensorConfig(sensorType);
              const minField = `${sensorType}_min` as keyof ThresholdValues;
              const maxField = `${sensorType}_max` as keyof ThresholdValues;
              const hasValues = thresholds[minField] || thresholds[maxField];
              
              return (
                <Card key={sensorType} className={config.color}>
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="text-base sm:text-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {config.icon}
                        {config.title}
                      </div>
                      {hasValues && (
                        <Badge variant="secondary" className="text-xs">
                          Dikonfigurasi
                        </Badge>
                      )}
                    </CardTitle>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {config.description}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <Label className="text-xs sm:text-sm font-medium">
                          Minimum {config.unit}
                        </Label>
                        <Input
                          type="number"
                          step={sensorType === 'tds' ? '1' : '0.1'}
                          placeholder={`${config.recommended.min}`}
                          value={thresholds[minField]}
                          onChange={(e) => handleInputChange(minField, e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs sm:text-sm font-medium">
                          Maksimum {config.unit}
                        </Label>
                        <Input
                          type="number"
                          step={sensorType === 'tds' ? '1' : '0.1'}
                          placeholder={`${config.recommended.max}`}
                          value={thresholds[maxField]}
                          onChange={(e) => handleInputChange(maxField, e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    {/* Quick Actions - Stacked on mobile */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => applyRecommended(sensorType)}
                        className="flex-1 text-xs"
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        <span className="hidden xs:inline">Gunakan Rekomendasi</span>
                        <span className="xs:hidden">Rekomendasi</span>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => clearSensor(sensorType)}
                        className="px-3"
                        disabled={!hasValues}
                      >
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Current vs Recommended */}
                    <div className="text-[11px] sm:text-xs text-gray-600 bg-white/50 p-2 rounded">
                      <div className="flex justify-between">
                        <span>Rekomendasi:</span>
                        <span className="font-mono">
                          {config.recommended.min} - {config.recommended.max} {config.unit}
                        </span>
                      </div>
                      {sensorValues[sensorType] && (
                        <div className="flex justify-between mt-1">
                          <span>Saat ini:</span>
                          <span className="font-mono font-medium">
                            {sensorValues[sensorType]} {config.unit}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* MQTT Status */}
          {(isSubmitting || mqttStatus !== 'disconnected') && (
            <Card className="border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    mqttStatus === 'connected' ? 'bg-green-500' :
                    mqttStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                    'bg-red-500'
                  }`} />
                  <span className="text-sm font-medium">
                    Status MQTT: {
                      mqttStatus === 'connected' ? 'Terhubung' :
                      mqttStatus === 'connecting' ? 'Menghubungkan...' :
                      'Terputus'
                    }
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg leading-relaxed">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <div className="font-medium text-red-800 mb-1">
                  Terjadi Kesalahan
                </div>
                <div className="text-red-700">
                  {error}
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg leading-relaxed">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <div className="font-medium text-green-800 mb-1">
                  Konfigurasi Berhasil Dikirim!
                </div>
                <div className="text-green-700">
                  Ambang batas sensor telah dikirim ke perangkat <strong>{deviceId}</strong>.
                  Perangkat akan menggunakan nilai ini untuk menentukan status sensor.
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons - Stacked on mobile */}
          <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t gap-4">
            <Button 
              variant="outline" 
              onClick={clearAll}
              disabled={isSubmitting}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <RotateCcw className="h-4 w-4" />
              Reset Semua
            </Button>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button 
                variant="outline" 
                onClick={onClose} 
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                Batal
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting || !isFormValid}
                className="min-w-[140px] h-11 w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Kirim Konfigurasi
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OffsetModal;
