import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useForm } from 'react-hook-form';
import { useCreateUserMutation, useUpdateUserMutation } from '../hooks/useUserMutations';
import { UserPlus, User as UserIcon, Shield, ShieldCheck, UserCheck, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import type { User } from '../types';

type Mode = 'create' | 'edit';

export interface UpsertUserModalProps {
  open: boolean;
  mode: Mode;
  user?: User | null;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormValues {
  fullName: string;
  email: string;
  password?: string;
  role: 'user' | 'admin' | 'superuser';
  emailVerified: boolean;
}

export const UpsertUserModal: React.FC<UpsertUserModalProps> = ({ open, mode, user, onClose, onSuccess }) => {
  const { register, handleSubmit, reset, setValue, watch, formState: { isSubmitting, errors } } = useForm<FormValues>({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      role: 'user',
      emailVerified: false,
    },
  });

  const watchedRole = watch('role');
  const watchedEmailVerified = watch('emailVerified');

  const createMutation = useCreateUserMutation();
  const updateMutation = useUpdateUserMutation();

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superuser':
        return <ShieldCheck className="h-4 w-4 text-red-600" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-600" />;
      default:
        return <UserCheck className="h-4 w-4 text-green-600" />;
    }
  };

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && user) {
        reset({
          fullName: user.fullName,
          email: user.email,
          password: '',
          role: user.role,
          emailVerified: user.emailVerified,
        });
      } else {
        reset({ fullName: '', email: '', password: '', role: 'user', emailVerified: false });
      }
    }
  }, [open, mode, user, reset]);

  const onSubmit = async (values: FormValues) => {
    if (mode === 'create') {
      await createMutation.mutateAsync({
        email: values.email,
        password: values.password || '',
        fullName: values.fullName,
        role: values.role,
        emailVerified: values.emailVerified,
      });
    } else if (mode === 'edit' && user) {
      await updateMutation.mutateAsync({ id: user.id, data: {
        fullName: values.fullName,
        role: values.role,
        emailVerified: values.emailVerified,
      } });
    }
    onSuccess?.();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {mode === 'create' ? (
              <>
                <UserPlus className="h-5 w-5" />
                Create New User
              </>
            ) : (
              <>
                <UserIcon className="h-5 w-5" />
                Edit User Account
              </>
            )}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {mode === 'create' 
              ? 'Add a new user to the system with appropriate role and permissions.' 
              : 'Update user information and permissions.'}
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {(createMutation.error || updateMutation.error) && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {createMutation.error?.message || updateMutation.error?.message || 'An error occurred while saving the user.'}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 gap-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  Full Name
                </Label>
                <Input 
                  id="fullName" 
                  placeholder="Enter full name"
                  className={errors.fullName ? 'border-red-500' : ''}
                  {...register('fullName', { 
                    required: 'Full name is required',
                    minLength: { value: 2, message: 'Name must be at least 2 characters' }
                  })} 
                />
                {errors.fullName && (
                  <p className="text-xs text-red-500">{errors.fullName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="user@example.com"
                  disabled={mode === 'edit'}
                  className={errors.email ? 'border-red-500' : ''}
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Please enter a valid email address'
                    }
                  })} 
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
                {mode === 'edit' && (
                  <p className="text-xs text-muted-foreground">Email cannot be changed after account creation</p>
                )}
              </div>

              {mode === 'create' && (
                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Password
                  </Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Create a strong password"
                    className={errors.password ? 'border-red-500' : ''}
                    {...register('password', { 
                      required: mode === 'create' ? 'Password is required' : false,
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters long'
                      }
                    })} 
                  />
                  {errors.password && (
                    <p className="text-xs text-red-500">{errors.password.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Minimum 8 characters required</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Role and Permissions */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  {getRoleIcon(watchedRole)}
                  User Role
                </Label>
                <Select 
                  onValueChange={(val) => setValue('role', val as any)} 
                  defaultValue={user?.role || 'user'}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select user role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user" className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-green-600" />
                        <div>
                          <div className="font-medium">User</div>
                          <div className="text-xs text-muted-foreground">Standard access</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="admin" className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-blue-600" />
                        <div>
                          <div className="font-medium">Admin</div>
                          <div className="text-xs text-muted-foreground">Administrative privileges</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="superuser" className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-red-600" />
                        <div>
                          <div className="font-medium">Superuser</div>
                          <div className="text-xs text-muted-foreground">Full system access</div>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {watchedRole === 'superuser' && 'Full access to all system functions and settings'}
                  {watchedRole === 'admin' && 'Can manage users and access administrative features'}
                  {watchedRole === 'user' && 'Standard user access with limited administrative privileges'}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="emailVerified" 
                  onCheckedChange={(v) => setValue('emailVerified', Boolean(v))} 
                  defaultChecked={user?.emailVerified}
                />
                <Label htmlFor="emailVerified" className="text-sm">
                  Email verified
                  <span className="text-xs text-muted-foreground block">
                    {watchedEmailVerified 
                      ? 'User can access all email-dependent features' 
                      : 'User may have limited access until email is verified'}
                  </span>
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {mode === 'create' ? 'Creating...' : 'Saving...'}
                </>
              ) : (
                <>
                  {mode === 'create' ? (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Create User
                    </>
                  ) : (
                    <>
                      <UserIcon className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

