import React, { useState, useCallback } from 'react';
import { DevicesList } from './DevicesList';
import { 
  AddDeviceModal, 
  EditDeviceModal, 
  DeviceDetailsModal, 
  DeleteConfirmModal 
} from './modals';
import { useDevicesQuery } from '../hooks/useDevicesQuery';
import { useDevicePagination } from '../hooks/useDevicePagination';
import { DeviceErrorBoundary } from './ErrorBoundary';
import { ErrorDisplay, LoadingError } from './ErrorDisplay';
import type { Device, DeviceModalState } from '../types';
import { DeviceError, parseApiError } from '../utils/errorHandling';

export interface DevicesPageProps {
  className?: string;
}

export const DevicesPage: React.FC<DevicesPageProps> = ({ className }) => {
  // Pagination and search state
  const { 
    pagination, 
    queryParams, 
    setPage, 
    setSearch, 
    updatePaginationFromResponse 
  } = useDevicePagination({
    defaultLimit: 12, // Show more devices per page for grid layout
    enableUrlSync: true,
  });

  // Fetch devices data
  const { 
    data: devicesResponse, 
    isLoading, 
    error,
    refetch 
  } = useDevicesQuery(queryParams);

  // Modal state management
  const [modalState, setModalState] = useState<DeviceModalState>({
    isAddModalOpen: false,
    isEditModalOpen: false,
    isDetailsModalOpen: false,
    isDeleteModalOpen: false,
    selectedDevice: null,
  });

  // Update pagination when response changes
  React.useEffect(() => {
    if (devicesResponse?.pagination) {
      updatePaginationFromResponse(devicesResponse);
    }
  }, [devicesResponse, updatePaginationFromResponse]);

  // Modal control functions
  const openAddModal = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      isAddModalOpen: true,
      selectedDevice: null,
    }));
  }, []);

  const openEditModal = useCallback((device: Device) => {
    setModalState(prev => ({
      ...prev,
      isEditModalOpen: true,
      selectedDevice: device,
    }));
  }, []);

  const openDetailsModal = useCallback((device: Device) => {
    setModalState(prev => ({
      ...prev,
      isDetailsModalOpen: true,
      selectedDevice: device,
    }));
  }, []);

  const openDeleteModal = useCallback((device: Device) => {
    setModalState(prev => ({
      ...prev,
      isDeleteModalOpen: true,
      selectedDevice: device,
    }));
  }, []);

  const closeAllModals = useCallback(() => {
    setModalState({
      isAddModalOpen: false,
      isEditModalOpen: false,
      isDetailsModalOpen: false,
      isDeleteModalOpen: false,
      selectedDevice: null,
    });
  }, []);

  // Handle modal success callbacks
  const handleModalSuccess = useCallback(() => {
    refetch(); // Refresh devices list
    closeAllModals();
  }, [refetch, closeAllModals]);

  // Device action handlers
  const handleDeviceClick = useCallback((device: Device) => {
    openDetailsModal(device);
  }, [openDetailsModal]);

  const handleEditDevice = useCallback((device: Device) => {
    openEditModal(device);
  }, [openEditModal]);

  const handleDeleteDevice = useCallback((device: Device) => {
    openDeleteModal(device);
  }, [openDeleteModal]);

  const handleViewDetails = useCallback((device: Device) => {
    openDetailsModal(device);
  }, [openDetailsModal]);

  // Search handler
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
  }, [setSearch]);

  // Page change handler
  const handlePageChange = useCallback((page: number) => {
    setPage(page);
  }, [setPage]);

  // Enhanced error handling
  const deviceError = error ? (error instanceof DeviceError ? error : parseApiError(error)) : null;
  const isInitialLoading = isLoading && !devicesResponse;

  // Handle retry with proper error handling
  const handleRetry = useCallback(async () => {
    try {
      await refetch();
    } catch (err) {
      console.error('Retry failed:', err);
    }
  }, [refetch]);

  return (
    <DeviceErrorBoundary>
      <div className={className}>
        {/* Enhanced error display */}
        {deviceError && !isInitialLoading && (
          <ErrorDisplay
            error={deviceError}
            onRetry={handleRetry}
            className="mb-6"
          />
        )}

        {/* Loading error state for initial load */}
        {deviceError && isInitialLoading ? (
          <LoadingError
            error={deviceError}
            onRetry={handleRetry}
            loading={isLoading}
          />
        ) : (
          /* Main devices list */
          <DevicesList
            devices={devicesResponse?.data || []}
            pagination={pagination}
            loading={isInitialLoading}
            searchValue={pagination.search}
            onSearchChange={handleSearchChange}
            onPageChange={handlePageChange}
            onAddDevice={openAddModal}
            onDeviceClick={handleDeviceClick}
            onEditDevice={handleEditDevice}
            onDeleteDevice={handleDeleteDevice}
            onViewDetails={handleViewDetails}
          />
        )}

        {/* Add Device Modal */}
        <DeviceErrorBoundary>
          <AddDeviceModal
            isOpen={modalState.isAddModalOpen}
            onClose={closeAllModals}
            onSuccess={handleModalSuccess}
          />
        </DeviceErrorBoundary>

        {/* Edit Device Modal */}
        <DeviceErrorBoundary>
          <EditDeviceModal
            isOpen={modalState.isEditModalOpen}
            onClose={closeAllModals}
            device={modalState.selectedDevice}
            onSuccess={handleModalSuccess}
          />
        </DeviceErrorBoundary>

        {/* Device Details Modal */}
        <DeviceErrorBoundary>
          <DeviceDetailsModal
            isOpen={modalState.isDetailsModalOpen}
            onClose={closeAllModals}
            deviceId={modalState.selectedDevice?.device_id || null} // Changed from device_name to device_id
            onEdit={handleEditDevice}
            onDelete={handleDeleteDevice}
          />
        </DeviceErrorBoundary>

        {/* Delete Confirmation Modal */}
        <DeviceErrorBoundary>
          <DeleteConfirmModal
            isOpen={modalState.isDeleteModalOpen}
            onClose={closeAllModals}
            device={modalState.selectedDevice}
            onSuccess={handleModalSuccess}
          />
        </DeviceErrorBoundary>
      </div>
    </DeviceErrorBoundary>
  );
};