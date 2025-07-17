import * as XLSX from 'xlsx';
import type { SensorReading, Device } from '../types';

/**
 * Excel export utility for sensor data
 * Handles formatting and exporting sensor data to Excel files
 */

// Excel export configuration
interface ExcelExportConfig {
  includeRawData: boolean;
  includeVoltageData: boolean;
  includeCalibratedData: boolean;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

// Default export configuration
const DEFAULT_CONFIG: ExcelExportConfig = {
  includeRawData: true,
  includeVoltageData: true,
  includeCalibratedData: true,
};

/**
 * Format timestamp for Excel display
 */
const formatTimestamp = (timestamp: string): string => {
  try {
    const date = new Date(timestamp);
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch (error) {
    return timestamp;
  }
};

/**
 * Format sensor status for Excel
 */
const formatStatus = (status: 'GOOD' | 'BAD'): string => {
  return status === 'GOOD' ? 'Baik' : 'Buruk';
};

/**
 * Format number values for Excel
 */
const formatNumber = (value: number, precision: number = 2): number => {
  if (typeof value !== 'number' || isNaN(value)) {
    return 0;
  }
  return Number(value.toFixed(precision));
};

/**
 * Create Excel worksheet for pH sensor data
 */
const createPHWorksheet = (data: SensorReading[], config: ExcelExportConfig) => {
  const headers = ['Waktu', 'Status'];
  
  if (config.includeRawData) headers.push('Raw Value');
  if (config.includeVoltageData) headers.push('Voltage (V)');
  if (config.includeCalibratedData) headers.push('pH Level', 'Kalibrasi OK');

  const rows = data.map(reading => {
    const row: any[] = [
      formatTimestamp(reading.timestamp || reading.time),
      formatStatus(reading.ph.status)
    ];

    if (config.includeRawData) row.push(reading.ph.raw);
    if (config.includeVoltageData) row.push(formatNumber(reading.ph.voltage, 3));
    if (config.includeCalibratedData) {
      row.push(formatNumber(reading.ph.calibrated, 2));
      row.push(reading.ph.calibrated_ok ? 'Ya' : 'Tidak');
    }

    return row;
  });

  return XLSX.utils.aoa_to_sheet([headers, ...rows]);
};

/**
 * Create Excel worksheet for TDS sensor data
 */
const createTDSWorksheet = (data: SensorReading[], config: ExcelExportConfig) => {
  const headers = ['Waktu', 'Status'];
  
  if (config.includeRawData) headers.push('Raw Value');
  if (config.includeVoltageData) headers.push('Voltage (V)');
  if (config.includeCalibratedData) headers.push('TDS Level (ppm)', 'Kalibrasi OK');

  const rows = data.map(reading => {
    const row: any[] = [
      formatTimestamp(reading.timestamp || reading.time),
      formatStatus(reading.tds.status)
    ];

    if (config.includeRawData) row.push(reading.tds.raw);
    if (config.includeVoltageData) row.push(formatNumber(reading.tds.voltage, 3));
    if (config.includeCalibratedData) {
      row.push(formatNumber(reading.tds.calibrated, 1));
      row.push(reading.tds.calibrated_ok ? 'Ya' : 'Tidak');
    }

    return row;
  });

  return XLSX.utils.aoa_to_sheet([headers, ...rows]);
};

/**
 * Create Excel worksheet for DO Level sensor data
 */
const createDOWorksheet = (data: SensorReading[], config: ExcelExportConfig) => {
  const headers = ['Waktu', 'Status'];
  
  if (config.includeRawData) headers.push('Raw Value');
  if (config.includeVoltageData) headers.push('Voltage (V)');
  if (config.includeCalibratedData) headers.push('DO Level (mg/L)', 'Kalibrasi OK');

  const rows = data.map(reading => {
    const row: any[] = [
      formatTimestamp(reading.timestamp || reading.time),
      formatStatus(reading.do_level.status)
    ];

    if (config.includeRawData) row.push(reading.do_level.raw);
    if (config.includeVoltageData) row.push(formatNumber(reading.do_level.voltage, 3));
    if (config.includeCalibratedData) {
      row.push(formatNumber(reading.do_level.calibrated, 2));
      row.push(reading.do_level.calibrated_ok ? 'Ya' : 'Tidak');
    }

    return row;
  });

  return XLSX.utils.aoa_to_sheet([headers, ...rows]);
};

/**
 * Create Excel worksheet for Temperature sensor data
 */
const createTemperatureWorksheet = (data: SensorReading[]) => {
  const headers = ['Waktu', 'Suhu (°C)', 'Status'];

  const rows = data.map(reading => [
    formatTimestamp(reading.timestamp || reading.time),
    formatNumber(reading.temperature.value, 1),
    formatStatus(reading.temperature.status)
  ]);

  return XLSX.utils.aoa_to_sheet([headers, ...rows]);
};

/**
 * Create Excel worksheet with all sensor data combined
 */
const createCombinedWorksheet = (data: SensorReading[], config: ExcelExportConfig) => {
  const headers = ['Waktu', 'Device ID'];
  
  // Temperature columns
  headers.push('Suhu (°C)', 'Status Suhu');
  
  // pH columns
  headers.push('Status pH');
  if (config.includeRawData) headers.push('pH Raw');
  if (config.includeVoltageData) headers.push('pH Voltage (V)');
  if (config.includeCalibratedData) headers.push('pH Level', 'pH Kalibrasi OK');
  
  // TDS columns
  headers.push('Status TDS');
  if (config.includeRawData) headers.push('TDS Raw');
  if (config.includeVoltageData) headers.push('TDS Voltage (V)');
  if (config.includeCalibratedData) headers.push('TDS Level (ppm)', 'TDS Kalibrasi OK');
  
  // DO columns
  headers.push('Status DO');
  if (config.includeRawData) headers.push('DO Raw');
  if (config.includeVoltageData) headers.push('DO Voltage (V)');
  if (config.includeCalibratedData) headers.push('DO Level (mg/L)', 'DO Kalibrasi OK');

  const rows = data.map(reading => {
    const row: any[] = [
      formatTimestamp(reading.timestamp || reading.time),
      reading.device_id,
      formatNumber(reading.temperature.value, 1),
      formatStatus(reading.temperature.status),
      formatStatus(reading.ph.status)
    ];

    // pH data
    if (config.includeRawData) row.push(reading.ph.raw);
    if (config.includeVoltageData) row.push(formatNumber(reading.ph.voltage, 3));
    if (config.includeCalibratedData) {
      row.push(formatNumber(reading.ph.calibrated, 2));
      row.push(reading.ph.calibrated_ok ? 'Ya' : 'Tidak');
    }

    // TDS data
    row.push(formatStatus(reading.tds.status));
    if (config.includeRawData) row.push(reading.tds.raw);
    if (config.includeVoltageData) row.push(formatNumber(reading.tds.voltage, 3));
    if (config.includeCalibratedData) {
      row.push(formatNumber(reading.tds.calibrated, 1));
      row.push(reading.tds.calibrated_ok ? 'Ya' : 'Tidak');
    }

    // DO data
    row.push(formatStatus(reading.do_level.status));
    if (config.includeRawData) row.push(reading.do_level.raw);
    if (config.includeVoltageData) row.push(formatNumber(reading.do_level.voltage, 3));
    if (config.includeCalibratedData) {
      row.push(formatNumber(reading.do_level.calibrated, 2));
      row.push(reading.do_level.calibrated_ok ? 'Ya' : 'Tidak');
    }

    return row;
  });

  return XLSX.utils.aoa_to_sheet([headers, ...rows]);
};

/**
 * Generate filename for Excel export
 */
const generateFilename = (
  device: Device | null, 
  dateRange?: { from: Date; to: Date }
): string => {
  const deviceName = device?.name || device?.device_id || 'Unknown';
  const sanitizedDeviceName = deviceName.replace(/[^a-zA-Z0-9\-_]/g, '_');
  
  if (dateRange) {
    const fromStr = dateRange.from.toISOString().split('T')[0];
    const toStr = dateRange.to.toISOString().split('T')[0];
    return `sensor_data_${sanitizedDeviceName}_${fromStr}_to_${toStr}.xlsx`;
  }
  
  const today = new Date().toISOString().split('T')[0];
  return `sensor_data_${sanitizedDeviceName}_${today}.xlsx`;
};

/**
 * Export sensor data to Excel file
 */
export const exportToExcel = async (
  data: SensorReading[],
  device: Device | null,
  config: ExcelExportConfig = DEFAULT_CONFIG
): Promise<void> => {
  try {
    if (!data || data.length === 0) {
      throw new Error('Tidak ada data untuk diekspor');
    }

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Add combined data worksheet
    const combinedSheet = createCombinedWorksheet(data, config);
    XLSX.utils.book_append_sheet(workbook, combinedSheet, 'Semua Data');

    // Add individual sensor worksheets
    const phSheet = createPHWorksheet(data, config);
    XLSX.utils.book_append_sheet(workbook, phSheet, 'pH Sensor');

    const tdsSheet = createTDSWorksheet(data, config);
    XLSX.utils.book_append_sheet(workbook, tdsSheet, 'TDS Sensor');

    const doSheet = createDOWorksheet(data, config);
    XLSX.utils.book_append_sheet(workbook, doSheet, 'DO Level Sensor');

    const tempSheet = createTemperatureWorksheet(data);
    XLSX.utils.book_append_sheet(workbook, tempSheet, 'Temperature Sensor');

    // Generate filename
    const filename = generateFilename(device, config.dateRange);

    // Write and download file
    XLSX.writeFile(workbook, filename);

    console.log(`Excel file exported successfully: ${filename}`);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error(
      error instanceof Error 
        ? `Gagal mengekspor ke Excel: ${error.message}`
        : 'Gagal mengekspor ke Excel'
    );
  }
};

/**
 * Export specific sensor type to Excel
 */
export const exportSensorTypeToExcel = async (
  data: SensorReading[],
  sensorType: 'ph' | 'tds' | 'do_level' | 'temperature',
  device: Device | null,
  config: ExcelExportConfig = DEFAULT_CONFIG
): Promise<void> => {
  try {
    if (!data || data.length === 0) {
      throw new Error('Tidak ada data untuk diekspor');
    }

    const workbook = XLSX.utils.book_new();
    let worksheet;
    let sheetName;

    switch (sensorType) {
      case 'ph':
        worksheet = createPHWorksheet(data, config);
        sheetName = 'pH Sensor';
        break;
      case 'tds':
        worksheet = createTDSWorksheet(data, config);
        sheetName = 'TDS Sensor';
        break;
      case 'do_level':
        worksheet = createDOWorksheet(data, config);
        sheetName = 'DO Level Sensor';
        break;
      case 'temperature':
        worksheet = createTemperatureWorksheet(data);
        sheetName = 'Temperature Sensor';
        break;
      default:
        throw new Error('Tipe sensor tidak valid');
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate filename with sensor type
    const deviceName = device?.name || device?.device_id || 'Unknown';
    const sanitizedDeviceName = deviceName.replace(/[^a-zA-Z0-9\-_]/g, '_');
    const today = new Date().toISOString().split('T')[0];
    const filename = `${sensorType}_data_${sanitizedDeviceName}_${today}.xlsx`;

    XLSX.writeFile(workbook, filename);

    console.log(`${sensorType.toUpperCase()} Excel file exported successfully: ${filename}`);
  } catch (error) {
    console.error(`Error exporting ${sensorType} to Excel:`, error);
    throw new Error(
      error instanceof Error 
        ? `Gagal mengekspor data ${sensorType.toUpperCase()} ke Excel: ${error.message}`
        : `Gagal mengekspor data ${sensorType.toUpperCase()} ke Excel`
    );
  }
};

// Export configuration type for external use
export type { ExcelExportConfig };