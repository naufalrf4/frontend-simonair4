import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Shield, 
  ShieldCheck, 
  UserCheck,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { User } from '../types';
import { useTranslation } from 'react-i18next';

interface UserStatusBadgeProps {
  user: User;
  variant?: 'default' | 'compact';
  showRole?: boolean;
  showVerificationStatus?: boolean;
  showActivityStatus?: boolean;
}

export const UserStatusBadge: React.FC<UserStatusBadgeProps> = ({
  user,
  variant = 'default',
  showRole = true,
  showVerificationStatus = true,
  showActivityStatus = true,
}) => {
  const { t } = useTranslation('admin');

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superuser':
        return <ShieldCheck className="h-3 w-3" />;
      case 'admin':
        return <Shield className="h-3 w-3" />;
      default:
        return <UserCheck className="h-3 w-3" />;
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

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-1">
        {showRole && (
          <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs px-1.5 py-0.5">
            {getRoleIcon(user.role)}
            <span className="ml-1 hidden sm:inline">{t(`users.roles.${user.role}`)}</span>
          </Badge>
        )}
        {showVerificationStatus && (
          <div className="flex items-center">
            {user.emailVerified ? (
              <CheckCircle className="h-3 w-3 text-green-600" />
            ) : (
              <Clock className="h-3 w-3 text-orange-600" />
            )}
          </div>
        )}
        {showActivityStatus && (
          <div className="flex items-center">
            {user.isActive ? (
              <Activity className="h-3 w-3 text-green-600" />
            ) : (
              <XCircle className="h-3 w-3 text-red-600" />
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {showRole && (
        <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
          {getRoleIcon(user.role)}
          <span className="ml-1">{t(`users.roles.${user.role}`)}</span>
        </Badge>
      )}
      {showVerificationStatus && (
        <Badge 
          variant="outline" 
          className={cn(
            "text-xs",
            user.emailVerified 
              ? "text-green-600 border-green-200 bg-green-50" 
              : "text-orange-600 border-orange-200 bg-orange-50"
          )}
        >
          {user.emailVerified ? (
            <>
              <CheckCircle className="h-3 w-3 mr-1" />
              {t('common.verification.verified')}
            </>
          ) : (
            <>
              <Clock className="h-3 w-3 mr-1" />
              {t('common.verification.pending')}
            </>
          )}
        </Badge>
      )}
      {showActivityStatus && (
        <Badge 
          variant="outline" 
          className={cn(
            "text-xs",
            user.isActive 
              ? "text-green-600 border-green-200 bg-green-50" 
              : "text-red-600 border-red-200 bg-red-50"
          )}
        >
          {user.isActive ? (
            <>
              <Activity className="h-3 w-3 mr-1" />
              {t('common.status.active')}
            </>
          ) : (
            <>
              <XCircle className="h-3 w-3 mr-1" />
              {t('common.status.inactive')}
            </>
          )}
        </Badge>
      )}
    </div>
  );
};

interface UserAvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg';
  showStatus?: boolean;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ 
  user, 
  size = 'md',
  showStatus = false
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg'
  };

  const statusSizeClasses = {
    sm: 'h-2.5 w-2.5',
    md: 'h-3 w-3',
    lg: 'h-3.5 w-3.5'
  };

  const initials = user.fullName
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative">
      <div className={cn(
        "rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold",
        sizeClasses[size]
      )}>
        {initials}
      </div>
      {showStatus && (
        <div className={cn(
          "absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-background",
          statusSizeClasses[size],
          user.isActive ? "bg-green-500" : "bg-red-500"
        )} />
      )}
    </div>
  );
};
