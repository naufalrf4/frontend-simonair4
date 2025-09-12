import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Shield,
  ShieldCheck,
  UserCheck,
  Mail,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  User as UserIcon,
  Activity,
} from 'lucide-react';
import type { User } from '../types';

interface UserDetailsModalProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  open,
  user,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!user) return null;

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superuser':
        return <ShieldCheck className="h-5 w-5 text-red-600" />;
      case 'admin':
        return <Shield className="h-5 w-5 text-blue-600" />;
      default:
        return <UserCheck className="h-5 w-5 text-green-600" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'superuser':
        return 'destructive';
      case 'admin':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <UserIcon className="h-6 w-6" />
            User Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                    {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{user.fullName}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {user.isActive ? (
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      <Activity className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-red-600 border-red-200">
                      <XCircle className="h-3 w-3 mr-1" />
                      Inactive
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* User Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Role & Permissions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Role & Permissions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-2">
                  {getRoleIcon(user.role)}
                  <Badge variant={getRoleBadgeVariant(user.role)} className="text-sm">
                    {user.role.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {user.role === 'superuser' && 'Full system access with all administrative privileges'}
                  {user.role === 'admin' && 'Administrative access to manage users and system settings'}
                  {user.role === 'user' && 'Standard user access to personal features and data'}
                </p>
              </CardContent>
            </Card>

            {/* Email Status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Email Status
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-2">
                  {user.emailVerified ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        Verified
                      </Badge>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-orange-600" />
                      <Badge variant="outline" className="text-orange-600 border-orange-200">
                        Unverified
                      </Badge>
                    </>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {user.emailVerified 
                    ? 'Email address has been verified and confirmed' 
                    : 'Email verification is pending - user may have limited access'
                  }
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Activity Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Activity Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Account Created:</span>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    {formatDate(user.createdAt)}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Last Login:</span>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    {user.lastLogin ? formatDate(user.lastLogin) : 'Never logged in'}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Last Updated:</span>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    {formatDate(user.updatedAt)}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Status:</span>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    {user.isActive ? 'Active and can access the system' : 'Inactive - access restricted'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {(onEdit || onDelete) && (
            <>
              <Separator />
              <div className="flex flex-col sm:flex-row gap-2">
                {onEdit && (
                  <Button 
                    onClick={() => onEdit(user)} 
                    className="flex-1"
                  >
                    Edit User
                  </Button>
                )}
                {onDelete && (
                  <Button 
                    variant="destructive" 
                    onClick={() => onDelete(user)}
                    className="flex-1"
                  >
                    Delete User
                  </Button>
                )}
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Close
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
