import { useMemo, useCallback, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { type User, type AuthContextType, type UserRole } from '../types';
import { AuthContext } from './AuthContext';
import { useAuthMutations } from '../hooks/useAuthMutations';
import AuthApiService from '../api/authApiService';

export const AuthProviderContent = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();

  const {
    loginMutation,
    logoutMutation,
    registerMutation,
    forgotPasswordMutation,
    resetPasswordMutation,
    validateResetTokenMutation,
  } = useAuthMutations();

  const {
    data: user,
    status,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ['session'],
    queryFn: async () => {
      const hasToken = await AuthApiService.hasToken();
      if (!hasToken) return null;

      try {
        const profile = await AuthApiService.getProfile();
        return profile;
      } catch (error: any) {
        if (error?.response?.status === 401) {
          await AuthApiService.clearAuthData();
        }
        return null;
      }
    },
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const login = useCallback(
    async (email: string, password: string) => {
      await loginMutation.mutateAsync({ email, password });
      await queryClient.invalidateQueries({ queryKey: ['session'] });

      await queryClient.refetchQueries({ queryKey: ['session'] });
    },
    [loginMutation, queryClient],
  );

  const register = useCallback(
    async (fullName: string, email: string, password: string) => {
      await registerMutation.mutateAsync({ fullName, email, password });
      await queryClient.invalidateQueries({ queryKey: ['session'] });
    },
    [registerMutation, queryClient],
  );

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
    queryClient.setQueryData(['session'], null);

    await queryClient.invalidateQueries({ queryKey: ['session'] });
  }, [logoutMutation, queryClient]);

  const hasRole = useCallback(
    (roles: UserRole | UserRole[]) => {
      if (!user || !user.role) return false;
      const userRole = user.role;
      return Array.isArray(roles) ? roles.includes(userRole) : userRole === roles;
    },
    [user],
  );

  const authContextValue = useMemo<AuthContextType>(
    () => ({
      user: user ?? null,
      isAuthenticated: !!user && status === 'success',
      isLoading,
      error: error ?? null,
      login,
      register,
      logout,
      forgotPassword: async (email: string) => {
        await forgotPasswordMutation.mutateAsync(email);
      },
      resetPassword: async (token: string, password: string, confirmPassword: string) => {
        await resetPasswordMutation.mutateAsync({ token, password, confirmPassword });
      },
      validateResetToken: async (token: string) => {
        try {
          return await validateResetTokenMutation.mutateAsync(token);
        } catch {
          return false;
        }
      },
      refreshToken: async () => {
        return await AuthApiService.refreshToken();
      },
      hasRole,
      isLoggingIn: loginMutation.isPending,
      isRegistering: registerMutation.isPending,
      isLoggingOut: logoutMutation.isPending,
      loginMutation,
    }),
    [
      user,
      status,
      isLoading,
      error,
      login,
      register,
      logout,
      hasRole,
      loginMutation,
      registerMutation.isPending,
      logoutMutation.isPending,
      forgotPasswordMutation.mutateAsync,
      resetPasswordMutation.mutateAsync,
      validateResetTokenMutation.mutateAsync,
    ],
  );

  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
};
