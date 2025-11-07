import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { DeviceForm } from '../forms/DeviceForm';
import { useCreateDeviceMutation } from '../../hooks/useDeviceMutations';
import type { DeviceFormData } from '../../types';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AddDeviceModal: React.FC<AddDeviceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const createDeviceMutation = useCreateDeviceMutation();
  const { t } = useTranslation('devices');

  const handleSubmit = async (data: DeviceFormData) => {
    try {
      await createDeviceMutation.mutateAsync(data);
      onClose();
      onSuccess?.();
    } catch (error) {
      // Error handling is managed by the mutation hook
      // The form will remain open so user can correct errors
      console.error('Device creation failed:', error);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {t('modals.add.title')}
          </DialogTitle>
          <DialogDescription>
            {t('modals.add.description')}
          </DialogDescription>
        </DialogHeader>

        <DeviceForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={createDeviceMutation.isPending}
          submitLabel={
            createDeviceMutation.isPending ? t('buttons.save') : t('buttons.saveNew')
          }
          submitIcon={<Plus className="mr-2 h-4 w-4" />}
          showCancel={true}
          className="mt-4"
        />
      </DialogContent>
    </Dialog>
  );
};
