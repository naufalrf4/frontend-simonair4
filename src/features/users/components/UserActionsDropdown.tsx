import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  Shield,
  ShieldCheck,
  UserCheck,
  UserX,
  Mail,
} from 'lucide-react';
import type { User } from '../types';

interface UserActionsDropdownProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onViewDetails: (user: User) => void;
  onToggleStatus?: (user: User) => void;
  onResendVerification?: (user: User) => void;
}

export const UserActionsDropdown: React.FC<UserActionsDropdownProps> = ({
  user,
  onEdit,
  onDelete,
  onViewDetails,
  onToggleStatus,
  onResendVerification,
}) => {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superuser':
        return <ShieldCheck className="h-4 w-4" />;
      case 'admin':
        return <Shield className="h-4 w-4" />;
      default:
        return <UserCheck className="h-4 w-4" />;
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className="font-semibold">{user.fullName}</span>
            <span className="text-xs text-muted-foreground">{user.email}</span>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <div className="px-2 py-1.5">
          <div className="flex items-center gap-2">
            {getRoleIcon(user.role)}
            <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
              {user.role.toUpperCase()}
            </Badge>
            {user.emailVerified ? (
              <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                Verified
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
                Unverified
              </Badge>
            )}
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => onViewDetails(user)} className="cursor-pointer">
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => onEdit(user)} className="cursor-pointer">
          <Pencil className="mr-2 h-4 w-4" />
          Edit User
        </DropdownMenuItem>
        
        {!user.emailVerified && onResendVerification && (
          <DropdownMenuItem 
            onClick={() => onResendVerification(user)} 
            className="cursor-pointer"
          >
            <Mail className="mr-2 h-4 w-4" />
            Resend Verification
          </DropdownMenuItem>
        )}
        
        {onToggleStatus && (
          <DropdownMenuItem 
            onClick={() => onToggleStatus(user)} 
            className="cursor-pointer"
          >
            {user.isActive ? (
              <>
                <UserX className="mr-2 h-4 w-4" />
                Deactivate User
              </>
            ) : (
              <>
                <UserCheck className="mr-2 h-4 w-4" />
                Activate User
              </>
            )}
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => onDelete(user)} 
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete User
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
