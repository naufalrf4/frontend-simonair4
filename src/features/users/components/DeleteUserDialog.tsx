import React from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useDeleteUserMutation } from '../hooks/useUserMutations';
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import { UserAvatar } from './UserStatusBadge';
import type { User } from '../types';
import { useTranslation } from 'react-i18next';

export interface DeleteUserDialogProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({ open, user, onClose, onSuccess }) => {
  const deleteMutation = useDeleteUserMutation();
  const { t } = useTranslation('admin');

  const handleDelete = async () => {
    if (!user) return;
    await deleteMutation.mutateAsync(user.id);
    onSuccess?.();
    onClose();
  };

  if (!user) return null;

  const deleteItems = t('users.delete.items', { returnObjects: true }) as string[];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            {t('users.delete.title')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {t('users.delete.warning')}
            </AlertDescription>
          </Alert>

          {/* User Information */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <UserAvatar user={user} size="md" />
              <div className="flex-1">
                <h3 className="font-semibold">{user.fullName}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={user.role === 'superuser' ? 'destructive' : user.role === 'admin' ? 'default' : 'secondary'}>
                    {t(`users.roles.${user.role}`)}
                  </Badge>
                  {user.emailVerified && (
                    <Badge variant="outline" className="text-green-600">
                      {t('common.verification.verified')}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Warning Details */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">{t('users.delete.detailsTitle')}</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {deleteItems.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>

          {deleteMutation.error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {deleteMutation.error.message || t('users.delete.error')}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <Separator />
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={deleteMutation.isPending}
          >
            {t('common.buttons.cancel')}
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="min-w-[120px]"
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('common.buttons.deleting')}
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                {t('common.buttons.deleteUser')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
