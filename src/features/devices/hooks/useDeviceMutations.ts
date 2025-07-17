import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { DevicesService, deviceKeys } from '../services/devicesService';
import type { DeviceFormData, Device } from '../types';
import { DeviceError, parseApiError } from '../utils/errorHandling';
import { formatDeviceForCreate, formatDeviceForUpdate } from '../utils/deviceFormatters';
import { DEVICE_MESSAGES, getLocalizedErrorMessage } from '../constants/messages';

/**
 * Hook for creating a new device
 */
export function useCreateDeviceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DeviceFormData) => {
      const apiData = formatDeviceForCreate(data);
      return DevicesService.createDevice(apiData);
    },
    onSuccess: (newDevice) => {
      // Invalidate and refetch devices list
      queryClient.invalidateQueries({ queryKey: deviceKeys.lists() });
      
      // Add the new device to existing cache if possible
      queryClient.setQueryData(deviceKeys.detail(newDevice.device_id), newDevice);
      
      toast.success(DEVICE_MESSAGES.DEVICE_ADDED_SUCCESS);
    },
    onError: (error: any) => {
      const deviceError = error instanceof DeviceError ? error : parseApiError(error);
      const message = getLocalizedErrorMessage('CREATE_DEVICE', deviceError.type);
      
      console.error('Device creation failed:', deviceError);
      toast.error(message);
    },
  });
}

/**
 * Hook for updating a device
 */
export function useUpdateDeviceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ deviceId, data }: { deviceId: string; data: DeviceFormData }) => {
      const apiData = formatDeviceForUpdate(data);
      return DevicesService.updateDevice(deviceId, apiData);
    },
    onMutate: async ({ deviceId, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: deviceKeys.detail(deviceId) });

      // Snapshot previous value
      const previousDevice = queryClient.getQueryData<Device>(deviceKeys.detail(deviceId));

      // Optimistically update
      if (previousDevice) {
        const optimisticDevice: Device = {
          ...previousDevice,
          device_name: data.device_name,
          location: data.location,
          aquarium_size: data.aquarium_size 
            ? `${data.aquarium_size.length}x${data.aquarium_size.width}x${data.aquarium_size.height} cm`
            : previousDevice.aquarium_size,
          glass_type: data.glass_type,
          fish_count: data.fish_count,
          updated_at: new Date().toISOString(),
        };
        
        queryClient.setQueryData(deviceKeys.detail(deviceId), optimisticDevice);
      }

      return { previousDevice };
    },
    onSuccess: (updatedDevice) => {
      // Update the device detail cache
      queryClient.setQueryData(deviceKeys.detail(updatedDevice.device_id), updatedDevice);
      
      // Invalidate devices list to ensure consistency
      queryClient.invalidateQueries({ queryKey: deviceKeys.lists() });
      
      toast.success(DEVICE_MESSAGES.DEVICE_UPDATED_SUCCESS);
    },
    onError: (error: any, { deviceId }, context) => {
      // Rollback optimistic update
      if (context?.previousDevice) {
        queryClient.setQueryData(deviceKeys.detail(deviceId), context.previousDevice);
      }
      
      const deviceError = error instanceof DeviceError ? error : parseApiError(error);
      const message = getLocalizedErrorMessage('UPDATE_DEVICE', deviceError.type);
      
      console.error('Device update failed:', deviceError);
      toast.error(message);
    },
    onSettled: (_, __, { deviceId }) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: deviceKeys.detail(deviceId) });
    },
  });
}

/**
 * Hook for deleting a device
 */
export function useDeleteDeviceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (deviceId: string) => DevicesService.deleteDevice(deviceId),
    onMutate: async (deviceId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: deviceKeys.lists() });

      // Snapshot previous value
      const previousDevicesQueries = queryClient.getQueriesData({ queryKey: deviceKeys.lists() });

      // Optimistically remove device from all lists
      queryClient.setQueriesData({ queryKey: deviceKeys.lists() }, (old: any) => {
        if (!old?.data) return old;
        
        return {
          ...old,
          data: old.data.filter((device: Device) => device.device_id !== deviceId),
          pagination: {
            ...old.pagination,
            total: Math.max(0, old.pagination.total - 1),
          },
        };
      });

      return { previousDevicesQueries };
    },
    onSuccess: (_, deviceId) => {
      // Remove device detail from cache
      queryClient.removeQueries({ queryKey: deviceKeys.detail(deviceId) });
      
      // Invalidate devices list to ensure pagination is correct
      queryClient.invalidateQueries({ queryKey: deviceKeys.lists() });
      
      toast.success(DEVICE_MESSAGES.DEVICE_DELETED_SUCCESS);
    },
    onError: (error: any, _, context) => {
      // Rollback optimistic updates
      if (context?.previousDevicesQueries) {
        context.previousDevicesQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      
      const deviceError = error instanceof DeviceError ? error : parseApiError(error);
      const message = getLocalizedErrorMessage('DELETE_DEVICE', deviceError.type);
      
      console.error('Device deletion failed:', deviceError);
      toast.error(message);
    },
    onSettled: () => {
      // Always refetch devices list after delete operation
      queryClient.invalidateQueries({ queryKey: deviceKeys.lists() });
    },
  });
}