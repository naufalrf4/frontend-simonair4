import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { DeviceForm } from '../forms/DeviceForm';
import { useUpdateDeviceMutation } from '../../hooks/useDeviceMutations';
import { formatDeviceForForm } from '../../utils/deviceFormatters';
import { DEVICE_MESSAGES } from '../../constants/messages';
import type { Device, DeviceFormData } from '../../types';
import { Edit, Save, AlertTriangle, User as UserIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/features/authentication/hooks/useAuth';
import { apiClient } from '@/utils/apiClient';
import { useUsersQuery } from '@/features/users/hooks/useUsersQuery';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

export interface EditDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  device: Device | null;
  onSuccess?: () => void;
}

export const EditDeviceModal: React.FC<EditDeviceModalProps> = ({
  isOpen,
  onClose,
  device,
  onSuccess,
}) => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [initialFormData, setInitialFormData] = useState<DeviceFormData | null>(null);
  const [currentFormData, setCurrentFormData] = useState<DeviceFormData | null>(null);
  const { user } = useAuth();
  const isPrivileged = user?.role === 'admin' || user?.role === 'superuser';
  const [ownerUserId, setOwnerUserId] = useState<string>('');
  const { data: users = [], isLoading: usersLoading } = useUsersQuery(
    isPrivileged ? { limit: 100 } : {},
  );

  const updateDeviceMutation = useUpdateDeviceMutation();

  // Initialize form data when device changes
  useEffect(() => {
    if (device && isOpen) {
      const formData = formatDeviceForForm(device);
      setInitialFormData(formData);
      setCurrentFormData(formData);
      setHasUnsavedChanges(false);
      // Initialize owner: device owner if available, otherwise current user
      setOwnerUserId(device.user?.id || user?.id || '');
    }
  }, [device, isOpen, user]);

  // Check for unsaved changes
  useEffect(() => {
    if (initialFormData && currentFormData) {
      const hasChanges = JSON.stringify(initialFormData) !== JSON.stringify(currentFormData);
      setHasUnsavedChanges(hasChanges);
    }
  }, [initialFormData, currentFormData]);

  const handleSubmit = async (data: DeviceFormData) => {
    if (!device) return;

    try {
      await updateDeviceMutation.mutateAsync({
        deviceId: device.device_id, // Changed from device_name to device_id
        data,
      });
      // Owner change for admin/superuser
      if (isPrivileged && ownerUserId && ownerUserId !== (device.user?.id || '')) {
        await apiClient.patch(`/devices/${device.device_id}/owner`, { user_id: ownerUserId });
      }

      setHasUnsavedChanges(false);
      onClose();
      onSuccess?.();
    } catch (error) {
      // Error handling is managed by the mutation hook
      console.error('Device update failed:', error);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedWarning(true);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setHasUnsavedChanges(false);
    setShowUnsavedWarning(false);
    setInitialFormData(null);
    setCurrentFormData(null);
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleCancel();
    }
  };

  const handleConfirmClose = () => {
    setShowUnsavedWarning(false);
    handleClose();
  };

  const handleCancelClose = () => {
    setShowUnsavedWarning(false);
  };

  // Track form changes for unsaved changes detection
  const handleFormChange = (data: DeviceFormData) => {
    setCurrentFormData(data);
  };

  if (!device) {
    return null;
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              {DEVICE_MESSAGES.EDIT_DEVICE_TITLE}
            </DialogTitle>
            <DialogDescription>
              {DEVICE_MESSAGES.EDIT_DEVICE_DESCRIPTION.replace(
                '{device_name}',
                device?.device_name || '',
              )}
            </DialogDescription>
          </DialogHeader>

          {initialFormData && (
            <DeviceForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              initialData={initialFormData}
              isLoading={updateDeviceMutation.isPending}
              submitLabel={
                updateDeviceMutation.isPending
                  ? DEVICE_MESSAGES.SAVING_DEVICE
                  : DEVICE_MESSAGES.SAVE_CHANGES
              }
              submitIcon={<Save className="mr-2 h-4 w-4" />}
              showCancel={true}
              className="mt-4"
              disableDeviceId={true}
              onChange={handleFormChange}
            />
          )}

          {isPrivileged && (
            <div className="mt-4 space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <UserIcon className="h-4 w-4" /> Owner
              </label>
              <Select
                value={ownerUserId}
                onValueChange={(v) => setOwnerUserId(v)}
                disabled={usersLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={usersLoading ? 'Loading users...' : 'Select owner'} />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => {
                    const label = u.fullName || u.full_name || u.name || u.email || u.id;
                    return (
                      <SelectItem key={u.id} value={u.id}>
                        {label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Admins can reassign device ownership.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showUnsavedWarning} onOpenChange={setShowUnsavedWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-amber-600 mb-2">
              <AlertTriangle className="h-5 w-5" />
              <AlertDialogTitle>{DEVICE_MESSAGES.UNSAVED_CHANGES_TITLE}</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              {DEVICE_MESSAGES.UNSAVED_CHANGES_DESCRIPTION}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelClose}>
              {DEVICE_MESSAGES.CONTINUE_EDITING}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmClose}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {DEVICE_MESSAGES.DISCARD_CHANGES}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
