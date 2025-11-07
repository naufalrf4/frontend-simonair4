import React, { useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Shield,
  ShieldCheck,
  UserCheck,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  User as UserIcon,
  Activity,
} from 'lucide-react';
import type { User } from '../types';
import { useTranslation } from 'react-i18next';

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
  const { t, i18n } = useTranslation('admin');

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

  const formatDate = useCallback((dateString?: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat(i18n.language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }, [i18n.language]);

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <UserIcon className="h-6 w-6" />
            {t('users.details.title')}
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
                      {t('common.status.active')}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-red-600 border-red-200">
                      <XCircle className="h-3 w-3 mr-1" />
                      {t('common.status.inactive')}
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
                  {t('users.details.sections.role')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-2">
                  {getRoleIcon(user.role)}
                  <Badge variant={getRoleBadgeVariant(user.role)} className="text-sm">
                    {t(`users.roles.${user.role}`)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {t(`users.roleHelper.${user.role}`)}
                </p>
              </CardContent>
            </Card>

            {/* Email Status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('users.details.sections.email')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-2">
                  {user.emailVerified ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        {t('common.verification.verified')}
                      </Badge>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-orange-600" />
                      <Badge variant="outline" className="text-orange-600 border-orange-200">
                        {t('common.verification.unverified')}
                      </Badge>
                    </>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {user.emailVerified 
                    ? t('users.details.emailDescription.verified') 
                    : t('users.details.emailDescription.unverified')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Activity Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('users.details.sections.activity')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{t('users.details.activity.created')}</span>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    {formatDate(user.createdAt)}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{t('users.details.activity.lastLogin')}</span>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    {user.lastLogin ? formatDate(user.lastLogin) : t('users.details.activity.never')}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{t('users.details.activity.lastUpdated')}</span>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    {formatDate(user.updatedAt)}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{t('users.details.activity.status')}</span>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    {user.isActive ? t('users.details.activity.active') : t('users.details.activity.inactive')}
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
                    {t('users.actions.editUser')}
                  </Button>
                )}
                {onDelete && (
                  <Button 
                    variant="destructive" 
                    onClick={() => onDelete(user)}
                    className="flex-1"
                  >
                    {t('users.actions.deleteUser')}
                  </Button>
                )}
                <Button variant="outline" onClick={onClose} className="flex-1">
                  {t('common.buttons.close')}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
