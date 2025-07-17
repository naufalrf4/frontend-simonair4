/**
 * Sensor Data Hooks - Barrel export
 * Clean imports for all sensor data hooks
 */

// TanStack Query hooks for data fetching
export { 
  useSensorDataQuery, 
  useDevicesQuery, 
  useDeviceExistsQuery,
  usePrefetchSensorData,
  useInvalidateSensorData 
} from './useSensorDataQuery';

// Page-specific query hooks
export { 
  useSensorDataPageQuery, 
  useDevicesPageQuery 
} from './useSensorDataPageQuery';

// Additional hooks (will be added in future tasks)
// export { useSensorHistory } from './useSensorHistory';
// export { useDeviceSelection } from './useDeviceSelection';
// export { useDateRange } from './useDateRange';
// export { useRealTimeUpdates } from './useRealTimeUpdates';
// export { useSensorTableData } from './useSensorTableData';