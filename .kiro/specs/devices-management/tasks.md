# Implementation Plan

- [x] 1. Set up feature structure and core types
  - Create the devices feature directory structure with proper separation of concerns
  - Define TypeScript interfaces for Device, DeviceFormData, and API response types
  - Set up barrel exports for clean imports across the feature
  - _Requirements: 7.1, 7.2, 7.5_

- [x] 2. Implement devices API service layer with TanStack Query
  - Create devicesService.ts with all CRUD operations using apiClient
  - Implement getDevices with pagination and search parameters
  - Add createDevice, getDevice, updateDevice, and deleteDevice methods
  - Include proper error handling and response type validation
  - Integrate with TanStack Query for caching and state management
  - _Requirements: 1.1, 2.4, 3.2, 4.4, 5.2, 7.1_

- [x] 3. Create TanStack Query hooks for device operations
  - Implement useDevicesQuery hook for fetching devices with pagination
  - Create useDeviceQuery hook for fetching individual device details
  - Add useCreateDeviceMutation for device creation with optimistic updates
  - Implement useUpdateDeviceMutation and useDeleteDeviceMutation
  - Include proper cache invalidation and error handling
  - _Requirements: 1.1, 1.6, 7.4, 7.6_

- [x] 4. Build pagination and search functionality
  - Create useDevicePagination hook for pagination logic with URL state sync
  - Implement debounced search functionality
  - Add URL state synchronization for pagination and search parameters
  - Include proper loading states during search and pagination
  - Integrate with TanStack Query for efficient data fetching
  - _Requirements: 1.2, 1.3, 1.6_

- [x] 5. Create device form components
  - Build reusable DeviceForm component with react-hook-form integration
  - Implement AquariumSizeInput component with separate length/width/height inputs
  - Add form validation with proper error messages
  - Include proper formatting for aquarium_size field (LxWxH cm format)
  - _Requirements: 2.2, 2.3, 4.2, 4.3, 7.3_

- [x] 6. Implement device creation modal
  - Create AddDeviceModal component with form integration
  - Add device pairing functionality with API integration
  - Implement proper error handling for duplicate device IDs and validation errors
  - Include success feedback and automatic device list refresh
  - _Requirements: 2.1, 2.4, 2.5, 2.6, 2.7, 6.3_

- [x] 7. Build device details modal
  - Create DeviceDetailsModal component with comprehensive device information display
  - Implement real-time sensor data display for online devices
  - Add connection status and history information
  - Include quick access buttons for edit and delete actions
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 6.2_

- [x] 8. Create device editing modal
  - Implement EditDeviceModal with pre-populated form data
  - Add device update functionality with optimistic updates
  - Include proper error handling and rollback on failure
  - Implement cancel functionality with unsaved changes warning
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

- [x] 9. Build device deletion functionality
  - Create DeleteConfirmModal with device information display
  - Implement device deletion with proper confirmation flow
  - Add success/error feedback with automatic list refresh
  - Include proper error handling for deletion failures
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 10. Create DeviceCard component
  - Build DeviceCard component with device information display
  - Add click handler for device details modal
  - Implement edit and delete action buttons in dropdown menu
  - Include status indicators and sensor data display
  - Maintain consistent design patterns and styling
  - _Requirements: 6.1, 6.2, 6.4_

- [x] 11. Create devices list component
  - Build DevicesList component with responsive grid layout
  - Implement search input with debounced filtering
  - Add pagination controls with proper navigation
  - Include loading skeletons and empty state handling
  - _Requirements: 1.1, 1.2, 1.3, 1.6, 6.5_

- [x] 12. Build main devices page component
  - Create DevicesPage component that orchestrates all functionality
  - Integrate all modals with proper state management
  - Implement global loading and error states
  - Add proper modal state coordination and device selection
  - _Requirements: 1.1, 6.3, 6.4, 7.4_

- [x] 13. Update devices route implementation
  - Replace placeholder content in src/routes/_dashboard/devices.tsx
  - Integrate DevicesPage component with proper routing
  - Add proper error boundaries and loading states
  - Ensure responsive design and mobile compatibility
  - _Requirements: 6.5, 6.6_

- [x] 14. Add form validation utilities
  - Create deviceValidation.ts with validation rules for all device fields
  - Implement custom validation for device_id format and uniqueness
  - Add aquarium size validation with proper dimension checks
  - Include proper error message formatting and internationalization support
  - _Requirements: 2.2, 2.3, 4.2, 7.6_

- [x] 15. Implement data formatting utilities
  - Create deviceFormatters.ts for consistent data transformation
  - Add aquarium size formatting between form input and storage format
  - Implement device status and sensor data formatting
  - Include date/time formatting for device timestamps
  - _Requirements: 2.3, 4.3, 6.2, 7.2_

- [-] 16. Add comprehensive error handling
  - Implement centralized error handling in service layer
  - Add user-friendly error messages for all error scenarios
  - Include retry mechanisms for transient network errors
  - Add proper error boundaries and fallback UI states
  - _Requirements: 2.6, 4.5, 5.4, 6.4, 7.6_

- [ ] 17. Create unit tests for core functionality
  - Write tests for devicesService API integration
  - Add tests for useDevicesManagement hook functionality
  - Test form validation and data formatting utilities
  - Include tests for modal component behavior and state management
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 18. Implement integration tests
  - Create tests for complete device CRUD workflows
  - Add tests for pagination and search functionality
  - Test error scenarios and recovery mechanisms
  - Include tests for modal interactions and state coordination
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1_

- [ ] 19. Add accessibility and responsive design
  - Implement proper ARIA labels and keyboard navigation
  - Add screen reader support for all interactive elements
  - Ensure mobile-responsive design with touch-friendly interactions
  - Test and optimize modal behavior on mobile devices
  - _Requirements: 6.5, 6.6_

- [ ] 20. Performance optimization and final integration
  - Implement code splitting and lazy loading for modal components
  - Add client-side caching with appropriate TTL for device data
  - Optimize component rendering with React.memo and useMemo
  - Perform final integration testing and bug fixes
  - _Requirements: 1.6, 6.4, 7.4_