export interface Device {
  id: string;
  device_id: string;
  device_name: string;
  location?: string;
  aquarium_size?: string;
  glass_type?: string;
  fish_count?: number;
  last_seen: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  user?: {
    id: string;
    name?: string;
    full_name?: string;
    email?: string;
    role?: string;
  };
  online: boolean;
  latestSensorData?: SensorData;
}

// API Response wrapper interface
export interface ApiResponse<T> {
  status: string;
  data: T;
  metadata: {
    timestamp: string;
    path: string;
    executionTime: number;
  };
}

// Sensor data interface with updated structure to match backend
export interface SensorData {
  id: string;
  device_id: string;
  ph?: number;
  tds?: number;
  do?: number;
  temperature?: number;
  timestamp: string;
  created_at: string;
}

// Extended SensorData from backend structure
export interface BackendSensorData {
  time: string;
  timestamp: string;
  temperature?: {
    value: number;
    status: string;
  };
  ph?: {
    raw: number;
    status: string;
    voltage: number;
    calibrated: number;
    calibrated_ok: boolean;
  };
  tds?: {
    raw: number;
    status: string;
    voltage: number;
    calibrated: number;
    calibrated_ok: boolean;
  };
  do_level?: {
    raw: number;
    status: string;
    voltage: number;
    calibrated: number;
    calibrated_ok: boolean;
  };
}

// Form data interfaces
export interface DeviceFormData {
  device_id: string;
  device_name: string;
  location: string;
  aquarium_size: {
    length: number;
    width: number;
    height: number;
  };
  glass_type?: string;
  fish_count?: number;
}

export interface CreateDeviceData {
  device_id: string;
  device_name: string;
  location?: string;
  aquarium_size?: string;
  glass_type?: string;
  fish_count?: number;
}

export interface UpdateDeviceData {
  device_name?: string;
  location?: string;
  aquarium_size?: string;
  glass_type?: string;
  fish_count?: number;
  is_active?: boolean;
}

// API response interfaces
export interface DevicesResponse {
  data: Device[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetDevicesParams {
  page?: number;
  limit?: number;
  search?: string;
}

// Pagination state interface
export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  search: string;
}

// Modal state interfaces
export interface DeviceModalState {
  isAddModalOpen: boolean;
  isEditModalOpen: boolean;
  isDetailsModalOpen: boolean;
  isDeleteModalOpen: boolean;
  selectedDevice: Device | null;
}

// Hook return types
export interface UseDevicesManagementReturn {
  // Data
  devices: Device[];
  pagination: PaginationState;
  selectedDevice: Device | null;
  
  // Loading States
  loading: boolean;
  actionLoading: boolean;
  
  // Error States
  error: string | null;
  
  // Actions
  fetchDevices: (params?: GetDevicesParams) => Promise<void>;
  createDevice: (data: DeviceFormData) => Promise<void>;
  updateDevice: (deviceId: string, data: DeviceFormData) => Promise<void>;
  deleteDevice: (deviceId: string) => Promise<void>;
  
  // UI State
  setSelectedDevice: (device: Device | null) => void;
  setPagination: (pagination: Partial<PaginationState>) => void;
  clearError: () => void;
}