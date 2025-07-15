// src/features/authentication/hooks/useAuthMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import AuthApiService from '../api/authApiService';
import { type User, type LoginCredentials, type RegisterCredentials } from '../types';

interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

export const useAuthMutations = () => {
  const queryClient = useQueryClient();

  const onAuthSuccess = (data: { user: User; token: string }) => {
    queryClient.setQueryData(['session'], data.user);
    toast.success('Berhasil!', { position: 'bottom-left' });
  };

  const onAuthError = (error: any) => {
    const message = error?.response?.data?.message || 'Terjadi kesalahan';
    toast.error(message, { position: 'bottom-left' });
  };

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => 
      AuthApiService.login(credentials.email, credentials.password),
    onSuccess: onAuthSuccess,
    onError: onAuthError,
  });

  const registerMutation = useMutation({
    mutationFn: (credentials: RegisterCredentials) => 
      AuthApiService.register(credentials.fullName, credentials.email, credentials.password),
    onSuccess: onAuthSuccess,
    onError: onAuthError,
  });

  const logoutMutation = useMutation({
    mutationFn: () => AuthApiService.logout(),
    onSuccess: () => {
      queryClient.clear();
      toast.success('Berhasil logout', { position: 'bottom-left' });
    },
    onError: (error: any) => {
      queryClient.clear();
      toast.error('Logout berhasil secara lokal', { position: 'bottom-left' });
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: (email: string) => AuthApiService.forgotPassword(email),
    onSuccess: () => toast.success('Email reset password telah dikirim', { position: 'bottom-left' }),
    onError: onAuthError,
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (data: ResetPasswordData) => 
      AuthApiService.resetPassword(data.token, data.password, data.confirmPassword),
    onSuccess: () => toast.success('Password berhasil direset', { position: 'bottom-left' }),
    onError: onAuthError,
  });

  const validateResetTokenMutation = useMutation({
    mutationFn: (token: string) => AuthApiService.validateResetToken(token),
  });

  return {
    loginMutation,
    registerMutation,
    logoutMutation,
    forgotPasswordMutation,
    resetPasswordMutation,
    validateResetTokenMutation,
  };
};
