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
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('admin');

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
                {t('users.upsert.title.create')}
              </>
            ) : (
              <>
                <UserIcon className="h-5 w-5" />
                {t('users.upsert.title.edit')}
              </>
            )}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {t(`users.upsert.subtitle.${mode}`)}
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {(createMutation.error || updateMutation.error) && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {createMutation.error?.message || updateMutation.error?.message || t('users.upsert.error')}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 gap-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  {t('users.form.fullName.label')}
                </Label>
                <Input 
                  id="fullName" 
                  placeholder={t('users.form.fullName.placeholder')}
                  className={errors.fullName ? 'border-red-500' : ''}
                  {...register('fullName', { 
                    required: t('users.form.fullName.errors.required'),
                    minLength: { value: 2, message: t('users.form.fullName.errors.minLength') }
                  })} 
                />
                {errors.fullName && (
                  <p className="text-xs text-red-500">{errors.fullName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {t('users.form.email.label')}
                </Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder={t('users.form.email.placeholder')}
                  disabled={mode === 'edit'}
                  className={errors.email ? 'border-red-500' : ''}
                  {...register('email', { 
                    required: t('users.form.email.errors.required'),
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: t('users.form.email.errors.invalid')
                    }
                  })} 
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
                {mode === 'edit' && (
                  <p className="text-xs text-muted-foreground">{t('users.form.email.immutable')}</p>
                )}
              </div>

              {mode === 'create' && (
                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    {t('users.form.password.label')}
                  </Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder={t('users.form.password.placeholder')}
                    className={errors.password ? 'border-red-500' : ''}
                    {...register('password', { 
                      required: mode === 'create' ? t('users.form.password.errors.required') : false,
                      minLength: {
                        value: 8,
                        message: t('users.form.password.errors.minLength')
                      }
                    })} 
                  />
                  {errors.password && (
                    <p className="text-xs text-red-500">{errors.password.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{t('users.form.password.hint')}</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Role and Permissions */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  {getRoleIcon(watchedRole)}
                  {t('users.form.role.label')}
                </Label>
                <Select 
                  onValueChange={(val) => setValue('role', val as any)} 
                  defaultValue={user?.role || 'user'}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('users.form.role.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user" className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-green-600" />
                        <div>
                          <div className="font-medium">{t('users.roles.user')}</div>
                          <div className="text-xs text-muted-foreground">{t('users.roleSummaries.user')}</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="admin" className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-blue-600" />
                        <div>
                          <div className="font-medium">{t('users.roles.admin')}</div>
                          <div className="text-xs text-muted-foreground">{t('users.roleSummaries.admin')}</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="superuser" className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-red-600" />
                        <div>
                          <div className="font-medium">{t('users.roles.superuser')}</div>
                          <div className="text-xs text-muted-foreground">{t('users.roleSummaries.superuser')}</div>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {t(`users.roleHelper.${watchedRole}`)}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="emailVerified" 
                  onCheckedChange={(v) => setValue('emailVerified', Boolean(v))} 
                  defaultChecked={user?.emailVerified}
                />
                <Label htmlFor="emailVerified" className="text-sm">
                  {t('users.form.emailVerified.label')}
                  <span className="text-xs text-muted-foreground block">
                    {watchedEmailVerified 
                      ? t('users.form.emailVerified.helper.true')
                      : t('users.form.emailVerified.helper.false')}
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
              {t('common.buttons.cancel')}
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {mode === 'create' ? t('common.buttons.creating') : t('common.buttons.saving')}
                </>
              ) : (
                <>
                  {mode === 'create' ? (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      {t('common.buttons.createUser')}
                    </>
                  ) : (
                    <>
                      <UserIcon className="h-4 w-4 mr-2" />
                      {t('common.buttons.saveChanges')}
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
