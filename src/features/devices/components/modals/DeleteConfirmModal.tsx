import React from 'react';
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
import { Badge } from '@/components/ui/badge';
import { useDeleteDeviceMutation } from '../../hooks/useDeviceMutations';
import { formatDeviceStatus } from '../../utils/deviceFormatters';
import type { Device } from '../../types';
import { Trash2, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  device: Device | null;
  onSuccess?: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  device,
  onSuccess,
}) => {
  const { t } = useTranslation('devices');
  const deleteDeviceMutation = useDeleteDeviceMutation();

  const handleConfirmDelete = async () => {
    if (!device) return;

    try {
      await deleteDeviceMutation.mutateAsync(device.device_id); // Changed to use device_id
      onClose();
      onSuccess?.();
    } catch (error) {
      // Error handling is managed by the mutation hook
      console.error('Device deletion failed:', error);
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

  if (!device) {
    return null;
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-destructive mb-2">
            <AlertTriangle className="h-5 w-5" />
            <AlertDialogTitle>{t('delete.title')}</AlertDialogTitle>
          </div>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>
                {t('delete.description')}
              </p>
              
              {/* Device Information Display */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-foreground">
                    {device.device_name}
                  </h4>
                  <Badge variant={device.online ? 'default' : 'secondary'}>
                    {formatDeviceStatus(device.online, device.last_seen)}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">{t('card.labels.deviceId')}:</span>
                    <p className="font-mono">{device.device_id}</p>
                  </div>
                  
                  {device.location && (
                    <div>
                      <span className="text-muted-foreground">{t('card.labels.location')}:</span>
                      <p>{device.location}</p>
                    </div>
                  )}
                  
                  {device.aquarium_size && (
                    <div>
                      <span className="text-muted-foreground">{t('card.labels.size')}:</span>
                      <p>{device.aquarium_size}</p>
                    </div>
                  )}
                  
                  {device.fish_count && device.fish_count > 0 && (
                    <div>
                      <span className="text-muted-foreground">{t('forms.fishCount.label')}:</span>
                      <p>{device.fish_count}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-destructive mb-1">
                  {t('delete.warning')}
                </p>
                <p className="mt-2">{t('delete.impactTitle')}</p>
                <ul className="list-disc list-inside space-y-1 ml-2 mt-1">
                  <li>{t('delete.impact.config')}</li>
                  <li>{t('delete.impact.history')}</li>
                  <li>{t('delete.impact.connections')}</li>
                  <li>{t('delete.impact.calibrations')}</li>
                </ul>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          <AlertDialogCancel 
            onClick={handleCancel}
            disabled={deleteDeviceMutation.isPending}
          >
            {t('buttons.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmDelete}
            disabled={deleteDeviceMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {deleteDeviceMutation.isPending ? t('loading.deleting') : t('delete.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
