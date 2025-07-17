# Implementation Plan

- [x] 1. Set up sensor data feature structure and core types
  - Create the sensor-data feature directory structure with proper separation of concerns
  - Define TypeScript interfaces for SensorReading, SensorHistoryResponse, and FilterState
  - Set up barrel exports for clean imports across the feature
  - Create sensor data types that match the API response structure
  - _Requirements: 8.1, 8.2, 8.5_

- [x] 2. Implement sensor data API service layer
  - Create sensorDataService.ts with getSensorData method using apiClient
  - Implement getDevices method for device selector functionality
  - Add proper error handling and response type validation
  - Include pagination, search, and filtering parameters
  - Integrate with existing apiClient for consistent authentication
  - _Requirements: 1.3, 8.1, 8.6_

- [x] 3. Create TanStack Query hooks for data fetching
  - Implement useSensorDataQuery hook for fetching sensor data with caching
  - Create useDevicesQuery hook for device selector data
  - Add proper cache invalidation and error handling
  - Include query key management for different filter combinations
  - _Requirements: 1.3, 8.4_

- [x] 4. Build device selector component
  - Create DeviceSelector component with clean dropdown UI
  - Implement device search and filtering within dropdown
  - Add loading states and proper error handling
  - Include device name and device_id display with icons
  - Add empty state handling when no devices available
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [x] 5. Create sensor data table with existing DataTable component
  - Integrate existing DataTable component from src/components/ui/data-table.tsx
  - Define column structure for all sensor types (pH, TDS, DO, Temperature)
  - Add proper data formatting and status indicators
  - Include timestamp formatting and sensor value display
  - Implement responsive column layout for mobile
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.7_

- [-] 6. Add Excel export functionality
  - Install and configure xlsx library for Excel export
  - Create exportToExcel utility function
  - Add export button with proper loading states
  - Include filtered data export with proper formatting
  - Add filename generation with device name and date range
  - _Requirements: Custom requirement for Excel export_

- [x] 7. Implement table filtering and search
  - Add search functionality for sensor data
  - Implement column-based filtering options
  - Add date range filtering with date picker
  - Include sensor type filtering (pH, TDS, DO, Temperature)
  - Add filter reset functionality
  - _Requirements: 3.1, 3.2, 3.3, 3.5, 3.6, 4.1, 4.2, 4.3_

- [x] 8. Create main sensor data page component
  - Build SensorDataPage component with clean, modern UI
  - Integrate device selector at the top with full width
  - Add table with proper spacing and visual hierarchy
  - Implement loading states and error handling
  - Include export functionality and filter controls
  - _Requirements: 1.1, 7.3, 7.4, 7.5, 7.7_

- [x] 9. Add data formatting utilities
  - Create sensorDataFormatters.ts for consistent data transformation
  - Implement proper number formatting for sensor values
  - Add status formatting with color coding and icons
  - Include Indonesian date/time formatting
  - Add Excel export data formatting
  - _Requirements: 2.6, 7.2, 8.2_

- [x] 10. Update sensor data route
  - Replace placeholder content in src/routes/_dashboard/sensor-data.tsx
  - Integrate SensorDataPage component with proper routing
  - Add proper error boundaries and loading states
  - Ensure responsive design and mobile compatibility
  - _Requirements: 7.5, 8.5_

- [x] 11. Add comprehensive error handling
  - Implement centralized error handling with Indonesian error messages
  - Add user-friendly error messages for all scenarios
  - Include retry mechanisms for network errors
  - Add proper error boundaries and fallback UI states
  - _Requirements: 7.4, 8.6_

- [ ] 12. Implement responsive design and UX improvements
  - Add proper loading skeletons and empty states
  - Implement mobile-responsive design with touch-friendly interactions
  - Add proper visual feedback for all user interactions
  - Include smooth transitions and animations
  - Optimize table behavior on mobile devices
  - _Requirements: 7.5, 7.6_