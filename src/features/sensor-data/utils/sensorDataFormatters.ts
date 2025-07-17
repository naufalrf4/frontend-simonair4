import { format, formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import type { SensorStatus, SensorReading } from '../types';

/**
 * Sensor Data Formatters
 * Consistent data transformation utilities for sensor data display
 */

// Number formatting options
interface NumberFormatOptions {
  precision?: number;
  unit?: string;
  showUnit?: boolean;
  fallback?: string;
}

// Date formatting options
interface DateFormatOptions {
  includeTime?: boolean;
  relative?: boolean;
  format?: string;
}

/**
 * Format sensor numeric values with proper precision and units
 */
export const formatSensorValue = (
  value: number | null | undefined,
  options: NumberFormatOptions = {}
): string => {
  const {
    precision = 2,
    unit = '',
    showUnit = true,
    fallback = 'N/A'
  } = options;

  // Handle null, undefined, or invalid numbers
  if (value === null || value === undefined || typeof value !== 'number' || isNaN(value)) {
    return fallback;
  }

  // Format the number with specified precision
  const formattedValue = value.toFixed(precision);
  
  // Add unit if specified and showUnit is true
  if (unit && showUnit) {
    return `${formattedValue} ${unit}`;
  }
  
  return formattedValue;
};

/**
 * Format pH values with proper range validation
 */
export const formatPHValue = (value: number | null | undefined): string => {
  if (value === null || value === undefined || typeof value !== 'number' || isNaN(value)) {
    return 'N/A';
  }

  // pH should be between 0-14, warn if outside normal range
  const formattedValue = formatSensorValue(value, { precision: 2, unit: 'pH' });
  
  if (value < 0 || value > 14) {
    return `${formattedValue} ⚠️`;
  }
  
  return formattedValue;
};

/**
 * Format TDS values with appropriate units
 */
export const formatTDSValue = (value: number | null | undefined): string => {
  if (value === null || value === undefined || typeof value !== 'number' || isNaN(value)) {
    return 'N/A';
  }

  // Use different units based on value magnitude
  if (value >= 1000) {
    return formatSensorValue(value / 1000, { precision: 2, unit: 'g/L' });
  }
  
  return formatSensorValue(value, { precision: 1, unit: 'ppm' });
};

/**
 * Format DO (Dissolved Oxygen) values
 */
export const formatDOValue = (value: number | null | undefined): string => {
  return formatSensorValue(value, { precision: 2, unit: 'mg/L' });
};

/**
 * Format temperature values with Celsius unit
 */
export const formatTemperatureValue = (value: number | null | undefined): string => {
  return formatSensorValue(value, { precision: 1, unit: '°C' });
};

/**
 * Format voltage values
 */
export const formatVoltageValue = (value: number | null | undefined): string => {
  return formatSensorValue(value, { precision: 3, unit: 'V' });
};

/**
 * Format raw sensor values (no units, integer display)
 */
export const formatRawValue = (value: number | null | undefined): string => {
  return formatSensorValue(value, { precision: 0, showUnit: false });
};

/**
 * Format sensor status with Indonesian text and color coding
 */
export const formatSensorStatus = (status: SensorStatus): {
  text: string;
  color: string;
  bgColor: string;
  icon: string;
} => {
  switch (status) {
    case 'GOOD':
      return {
        text: 'Baik',
        color: 'text-green-700',
        bgColor: 'bg-green-100',
        icon: '✓'
      };
    case 'BAD':
      return {
        text: 'Buruk',
        color: 'text-red-700',
        bgColor: 'bg-red-100',
        icon: '✗'
      };
    default:
      return {
        text: 'Tidak Diketahui',
        color: 'text-gray-700',
        bgColor: 'bg-gray-100',
        icon: '?'
      };
  }
};

/**
 * Format calibration status
 */
export const formatCalibrationStatus = (isCalibrated: boolean): {
  text: string;
  color: string;
  bgColor: string;
} => {
  if (isCalibrated) {
    return {
      text: 'Terkalibrasi',
      color: 'text-blue-700',
      bgColor: 'bg-blue-100'
    };
  }
  
  return {
    text: 'Belum Dikalibrasi',
    color: 'text-amber-700',
    bgColor: 'bg-amber-100'
  };
};

/**
 * Format timestamps with Indonesian locale
 */
export const formatTimestamp = (
  timestamp: string | Date,
  options: DateFormatOptions = {}
): string => {
  const {
    includeTime = true,
    relative = false,
    format: customFormat
  } = options;

  try {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Tanggal tidak valid';
    }

    // Return relative time if requested
    if (relative) {
      return formatDistanceToNow(date, { 
        addSuffix: true, 
        locale: id 
      });
    }

    // Use custom format if provided
    if (customFormat) {
      return format(date, customFormat, { locale: id });
    }

    // Default formatting
    if (includeTime) {
      return format(date, 'dd MMM yyyy, HH:mm:ss', { locale: id });
    }
    
    return format(date, 'dd MMM yyyy', { locale: id });
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return 'Format tanggal error';
  }
};

/**
 * Format date for display in tables
 */
export const formatTableDate = (timestamp: string | Date): {
  date: string;
  time: string;
} => {
  try {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    
    if (isNaN(date.getTime())) {
      return { date: 'Invalid Date', time: 'Invalid Time' };
    }

    return {
      date: format(date, 'dd/MM/yyyy', { locale: id }),
      time: format(date, 'HH:mm:ss', { locale: id })
    };
  } catch (error) {
    return { date: 'Error', time: 'Error' };
  }
};

/**
 * Format date range for display
 */
export const formatDateRange = (from: Date, to: Date): string => {
  try {
    const fromStr = format(from, 'dd MMM yyyy', { locale: id });
    const toStr = format(to, 'dd MMM yyyy', { locale: id });
    
    // Same day
    if (format(from, 'yyyy-MM-dd') === format(to, 'yyyy-MM-dd')) {
      return fromStr;
    }
    
    // Same month and year
    if (format(from, 'yyyy-MM') === format(to, 'yyyy-MM')) {
      const fromDay = format(from, 'dd', { locale: id });
      return `${fromDay} - ${toStr}`;
    }
    
    // Different months/years
    return `${fromStr} - ${toStr}`;
  } catch (error) {
    return 'Rentang tanggal tidak valid';
  }
};

/**
 * Format device status
 */
export const formatDeviceStatus = (status: 'online' | 'offline' | undefined): {
  text: string;
  color: string;
  bgColor: string;
  icon: string;
} => {
  switch (status) {
    case 'online':
      return {
        text: 'Online',
        color: 'text-green-700',
        bgColor: 'bg-green-100',
        icon: '🟢'
      };
    case 'offline':
      return {
        text: 'Offline',
        color: 'text-red-700',
        bgColor: 'bg-red-100',
        icon: '🔴'
      };
    default:
      return {
        text: 'Tidak Diketahui',
        color: 'text-gray-700',
        bgColor: 'bg-gray-100',
        icon: '⚪'
      };
  }
};

/**
 * Format sensor reading for Excel export
 */
export const formatSensorReadingForExport = (reading: SensorReading) => {
  return {
    // Basic info
    waktu: formatTimestamp(reading.timestamp || reading.time, { includeTime: true }),
    device_id: reading.device_id,
    
    // Temperature
    suhu_celsius: formatSensorValue(reading.temperature.value, { precision: 1, showUnit: false }),
    status_suhu: formatSensorStatus(reading.temperature.status).text,
    
    // pH
    ph_raw: formatRawValue(reading.ph.raw),
    ph_voltage: formatSensorValue(reading.ph.voltage, { precision: 3, showUnit: false }),
    ph_calibrated: formatSensorValue(reading.ph.calibrated, { precision: 2, showUnit: false }),
    ph_kalibrasi_ok: reading.ph.calibrated_ok ? 'Ya' : 'Tidak',
    status_ph: formatSensorStatus(reading.ph.status).text,
    
    // TDS
    tds_raw: formatRawValue(reading.tds.raw),
    tds_voltage: formatSensorValue(reading.tds.voltage, { precision: 3, showUnit: false }),
    tds_calibrated: formatSensorValue(reading.tds.calibrated, { precision: 1, showUnit: false }),
    tds_kalibrasi_ok: reading.tds.calibrated_ok ? 'Ya' : 'Tidak',
    status_tds: formatSensorStatus(reading.tds.status).text,
    
    // DO Level
    do_raw: formatRawValue(reading.do_level.raw),
    do_voltage: formatSensorValue(reading.do_level.voltage, { precision: 3, showUnit: false }),
    do_calibrated: formatSensorValue(reading.do_level.calibrated, { precision: 2, showUnit: false }),
    do_kalibrasi_ok: reading.do_level.calibrated_ok ? 'Ya' : 'Tidak',
    status_do: formatSensorStatus(reading.do_level.status).text,
  };
};

/**
 * Get sensor value quality indicator based on typical ranges
 */
export const getSensorQualityIndicator = (sensorType: string, value: number): {
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  message: string;
  color: string;
} => {
  switch (sensorType) {
    case 'ph':
      if (value >= 6.5 && value <= 8.5) {
        return { quality: 'excellent', message: 'pH optimal untuk akuarium', color: 'text-green-600' };
      } else if (value >= 6.0 && value <= 9.0) {
        return { quality: 'good', message: 'pH masih dalam batas aman', color: 'text-blue-600' };
      } else if (value >= 5.5 && value <= 9.5) {
        return { quality: 'fair', message: 'pH perlu diperhatikan', color: 'text-yellow-600' };
      } else {
        return { quality: 'poor', message: 'pH berbahaya untuk ikan', color: 'text-red-600' };
      }
      
    case 'temperature':
      if (value >= 24 && value <= 28) {
        return { quality: 'excellent', message: 'Suhu optimal untuk ikan tropis', color: 'text-green-600' };
      } else if (value >= 22 && value <= 30) {
        return { quality: 'good', message: 'Suhu masih dalam batas aman', color: 'text-blue-600' };
      } else if (value >= 20 && value <= 32) {
        return { quality: 'fair', message: 'Suhu perlu diperhatikan', color: 'text-yellow-600' };
      } else {
        return { quality: 'poor', message: 'Suhu berbahaya untuk ikan', color: 'text-red-600' };
      }
      
    case 'do_level':
      if (value >= 6) {
        return { quality: 'excellent', message: 'Oksigen terlarut sangat baik', color: 'text-green-600' };
      } else if (value >= 4) {
        return { quality: 'good', message: 'Oksigen terlarut cukup baik', color: 'text-blue-600' };
      } else if (value >= 2) {
        return { quality: 'fair', message: 'Oksigen terlarut rendah', color: 'text-yellow-600' };
      } else {
        return { quality: 'poor', message: 'Oksigen terlarut sangat rendah', color: 'text-red-600' };
      }
      
    default:
      return { quality: 'good', message: 'Nilai dalam rentang normal', color: 'text-gray-600' };
  }
};

/**
 * Format data count for display
 */
export const formatDataCount = (count: number): string => {
  if (count === 0) return 'Tidak ada data';
  if (count === 1) return '1 data';
  if (count < 1000) return `${count} data`;
  if (count < 1000000) return `${(count / 1000).toFixed(1)}K data`;
  return `${(count / 1000000).toFixed(1)}M data`;
};

/**
 * Format file size for export
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};