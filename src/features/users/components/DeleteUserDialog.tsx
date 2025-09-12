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

export interface DeleteUserDialogProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({ open, user, onClose, onSuccess }) => {
  const deleteMutation = useDeleteUserMutation();

  const handleDelete = async () => {
    if (!user) return;
    await deleteMutation.mutateAsync(user.id);
    onSuccess?.();
    onClose();
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete User Account
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This action cannot be undone. The user account and all associated data will be permanently removed from the system.
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
                    {user.role.toUpperCase()}
                  </Badge>
                  {user.emailVerified && (
                    <Badge variant="outline" className="text-green-600">
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Warning Details */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">What will be deleted:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• User account and login credentials</li>
              <li>• User profile and personal information</li>
              <li>• Associated permissions and role assignments</li>
              <li>• User activity history and logs</li>
            </ul>
          </div>

          {deleteMutation.error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {deleteMutation.error.message || 'Failed to delete user. Please try again.'}
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
            Cancel
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
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete User
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
