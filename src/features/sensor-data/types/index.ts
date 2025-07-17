/**
 * Core TypeScript interfaces for sensor data history feature
 * Based on API response structure and design requirements
 */

// Sensor status type
export type SensorStatus = 'GOOD' | 'BAD';

// Individual sensor data interfaces
export interface TemperatureSensor {
  value: number;
  status: SensorStatus;
}

export interface PHSensor {
  raw: number;
  status: SensorStatus;
  voltage: number;
  calibrated: number;
  calibrated_ok: boolean;
}

export interface TDSSensor {
  raw: number;
  status: SensorStatus;
  voltage: number;
  calibrated: number;
  calibrated_ok: boolean;
}

export interface DOLevelSensor {
  raw: number;
  status: SensorStatus;
  voltage: number;
  calibrated: number;
  calibrated_ok: boolean;
}

// Main sensor reading interface
export interface SensorReading {
  time: string;
  timestamp: string;
  device_id: string;
  temperature: TemperatureSensor;
  ph: PHSensor;
  tds: TDSSensor;
  do_level: DOLevelSensor;
}

// API response interface
export interface SensorHistoryResponse {
  status: 'success' | 'error';
  data: SensorReading[];
  metadata: {
    timestamp: string;
    path: string;
    executionTime: number;
  };
}

// Device interface for device selector
export interface Device {
  id: string;
  device_id: string;
  name: string;
  status?: 'online' | 'offline';
}

// Data type filter options
export type DataType = 'raw' | 'voltage' | 'calibrated';

// Sensor type options
export type SensorType = 'ph' | 'tds' | 'do_level' | 'temperature';

// Filter state interface
export interface FilterState {
  deviceId: string | null;
  dateRange: {
    from: Date;
    to: Date;
  };
  dataType: {
    ph: DataType;
    tds: DataType;
    do_level: DataType;
  };
  pagination: {
    page: number;
    limit: number;
  };
}

// Date range interface
export interface DateRange {
  from: Date;
  to: Date;
}

// Pagination interface
export interface PaginationState {
  page: number;
  limit: number;
  total?: number;
}

// API request parameters interface
export interface SensorHistoryParams {
  deviceId: string;
  page: number;
  limit: number;
  from: string; // ISO 8601 format
  to: string;   // ISO 8601 format
  orderBy: 'ASC' | 'DESC';
}

// Table configuration interface
export interface TableConfig {
  sensorType: SensorType;
  title: string;
  icon: React.ComponentType;
  color: string;
  hasDataTypeFilter: boolean;
  filterOptions?: DataType[];
}

// Real-time polling configuration
export interface PollingConfig {
  interval: number; // milliseconds
  maxRetries: number;
  backoffMultiplier: number;
  pauseOnInactive: boolean;
}

// Connection status for real-time updates
export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error';

// Error types
export interface SensorDataError {
  type: 'network' | 'validation' | 'data' | 'realtime';
  message: string;
  code?: string;
}

// Loading states
export interface LoadingState {
  devices: boolean;
  sensorData: boolean;
  realTimeUpdate: boolean;
}

// Empty state types
export type EmptyStateType = 'no-device' | 'no-data' | 'no-results' | 'error';

// All types are already exported above with their definitions