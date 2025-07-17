import React, { createContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'sonner';
import { decryptToken, encryptToken, getBrowserFingerprint } from '@/utils/fingerprint';
import { eventBus } from '@/utils/eventBus';
import { apiClient } from '@/utils/apiClient';
import { TOKEN_EXPIRY_MINUTES, REFRESH_CHECK_INTERVAL } from '@/utils/constants';
import type { User } from '@/features/users/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: { fullName: string; email: string; password: string }) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  validateResetToken: (token: string) => Promise<boolean>;
  resetPassword: (token: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fingerprint, setFingerprint] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [fetchProfileDebounceTimeout, setFetchProfileDebounceTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Add refs for refresh scheduling
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);
  const lastRefreshAttemptRef = useRef<number>(0);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Clear refresh timeout on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      if (fetchProfileDebounceTimeout) {
        clearTimeout(fetchProfileDebounceTimeout);
      }
    };
  }, [fetchProfileDebounceTimeout]);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const fp = await getBrowserFingerprint();
        if (!isMounted) return;
        setFingerprint(fp);

        const simonairToken = localStorage.getItem('simonairToken');
        if (simonairToken) {
          const token = await decryptToken(simonairToken, fp);
          if (token && !isTokenExpired(token)) {
            setIsAuthenticated(true);
            scheduleTokenRefresh(token); // Schedule automatic refresh
            emitDebouncedProfileFetch();
          } else {
            clearAuthStorage();
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        clearAuthStorage();
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setIsInitialized(true);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isInitialized || !fingerprint) return;

    const cleanupTokenRefreshed = eventBus.on('token-refreshed', async ({ token }) => {
      console.log('🔄 Token refreshed, updating storage and scheduling next refresh');
      await saveTokenToStorage(token);
      scheduleTokenRefresh(token);
      emitDebouncedProfileFetch();
    });

    const cleanupAuthError = eventBus.on('auth-error', ({ type, error }) => {
      console.error('🚨 Auth error:', type, error);
      
      if (type === 'refresh_failed') {
        toast.error('Sesi berakhir, silakan masuk kembali.');
        performLogout();
      } else if (type === 'unauthorized') {
        performLogout();
      } else {
        toast.error('Terjadi kesalahan otentikasi.');
      }
    });

    const cleanupLogoutRequired = eventBus.on('logout-required', () => {
      console.log('🚪 Logout required, performing logout');
      performLogout();
    });

    const cleanupTokenExpired = eventBus.on('token-expired', () => {
      console.log('⏰ Token expired, attempting refresh');
      attemptTokenRefresh();
    });

    const cleanupProfileUpdated = eventBus.on('profile-updated', ({ user: updatedUser }) => {
      const currentUserJson = user ? JSON.stringify(user) : null;
      const updatedUserJson = JSON.stringify(updatedUser);
      if (currentUserJson !== updatedUserJson) {
        setUser(updatedUser);
        saveUserToStorage(updatedUser);
      }
    });

    return () => {
      cleanupTokenRefreshed();
      cleanupAuthError();
      cleanupLogoutRequired();
      cleanupTokenExpired();
      cleanupProfileUpdated();
    };
  }, [isInitialized, fingerprint, user]);

  const isTokenExpired = (token: string): boolean => {
    try {
      const decoded: { exp: number } = jwtDecode(token);
      return Date.now() >= decoded.exp * 1000;
    } catch {
      return true;
    }
  };

  const getTokenExpiryTime = (token: string): number | null => {
    try {
      const decoded: { exp: number } = jwtDecode(token);
      return decoded.exp * 1000;
    } catch {
      return null;
    }
  };

  const scheduleTokenRefresh = useCallback((token: string) => {
    // Clear existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    const expiryTime = getTokenExpiryTime(token);
    if (!expiryTime) return;

    // Schedule refresh 2 minutes before expiry
    const refreshTime = expiryTime - (2 * 60 * 1000) - Date.now();
    
    if (refreshTime > 0) {
      console.log(`⏰ Scheduling token refresh in ${Math.round(refreshTime / 1000)} seconds`);
      
      refreshTimeoutRef.current = setTimeout(() => {
        attemptTokenRefresh();
      }, refreshTime);
    } else {
      // Token expires soon or already expired, refresh immediately
      console.log('⚡ Token expires soon, refreshing immediately');
      attemptTokenRefresh();
    }
  }, []);

  const attemptTokenRefresh = useCallback(async () => {
    // Prevent multiple simultaneous refresh attempts
    if (isRefreshingRef.current) {
      console.log('🔄 Refresh already in progress, skipping');
      return;
    }

    // Rate limiting: don't attempt refresh more than once per minute
    const now = Date.now();
    if (now - lastRefreshAttemptRef.current < 60000) {
      console.log('⏱️ Rate limiting: skipping refresh attempt');
      return;
    }

    isRefreshingRef.current = true;
    lastRefreshAttemptRef.current = now;

    try {
      console.log('🔄 Attempting token refresh...');
      await refreshMutation.mutateAsync();
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
    } finally {
      isRefreshingRef.current = false;
    }
  }, []);

  const saveTokenToStorage = async (token: string): Promise<void> => {
    if (!fingerprint) return;

    try {
      const encrypted = await encryptToken(token, fingerprint);
      localStorage.setItem('simonairToken', encrypted);
    } catch (error) {

    }
  };

  const saveUserToStorage = async (userData: User): Promise<void> => {
    if (!fingerprint) return;

    try {
      const userJson = JSON.stringify(userData);
      const encrypted = await encryptToken(userJson, fingerprint);
      localStorage.setItem('simonairUser', encrypted);
    } catch (error) {
      
    }
  };

  const clearAuthStorage = () => {
    localStorage.removeItem('simonairToken');
    localStorage.removeItem('simonairUser');
    
    // Clear refresh timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  };

  const emitDebouncedProfileFetch = useCallback(() => {
    if (fetchProfileDebounceTimeout) clearTimeout(fetchProfileDebounceTimeout);
    const timeout = setTimeout(() => {
      eventBus.emit('profile-fetch-required', {});
    }, 300); // Debounce 300ms
    setFetchProfileDebounceTimeout(timeout);
  }, [fetchProfileDebounceTimeout]);

  const performLogout = useCallback(() => {
    clearAuthStorage();
    setUser(null);
    setIsAuthenticated(false);
    isRefreshingRef.current = false;
    queryClient.clear();
    eventBus.emit('user-logged-out', {});
    navigate({ to: '/login' });
  }, [navigate, queryClient]);

  const loginMutation = useMutation({
    mutationFn: (data: { email: string; password: string }) => apiClient.post('/auth/login', data),
    onSuccess: async ({ data }) => {
      const token = data.data.accessToken;
      await saveTokenToStorage(token);
      setIsAuthenticated(true);
      scheduleTokenRefresh(token); // Schedule refresh for new token
      emitDebouncedProfileFetch();
      toast.success('Login berhasil');
      navigate({ to: '/dashboard' });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Login gagal';
      toast.error(message);
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: { fullName: string; email: string; password: string }) =>
      apiClient.post('/auth/register', data),
    onSuccess: async ({ data }) => {
      const token = data.data.accessToken;
      await saveTokenToStorage(token);
      setIsAuthenticated(true);
      scheduleTokenRefresh(token); // Schedule refresh for new token
      emitDebouncedProfileFetch();
      toast.success('Registrasi berhasil. Selamat datang!');
      navigate({ to: '/dashboard' });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Pendaftaran gagal';
      toast.error(message);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiClient.post('/auth/logout'),
    onSuccess: () => {
      performLogout();
      toast.success('Logout berhasil');
    },
    onError: () => {
      performLogout();
    },
  });

  const refreshMutation = useMutation({
    mutationFn: () => apiClient.post('/auth/refresh'),
    onSuccess: async ({ data }) => {
      const token = data.data.accessToken;
      console.log('✅ Token refresh successful');
      eventBus.emit('token-refreshed', { token });
    },
    onError: (error: any) => {
      console.error('❌ Refresh mutation failed:', error);
      eventBus.emit('auth-error', { 
        error, 
        type: 'refresh_failed' 
      });
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: (email: string) => apiClient.post('/auth/forgot-password', { email }),
    onSuccess: () => {
      toast.success('If the email exists, a password reset link has been sent.');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to send reset email';
      toast.error(message);
    },
  });

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login: async (data) => {
      await loginMutation.mutateAsync(data);
    },
    register: async (data) => {
      await registerMutation.mutateAsync(data);
    },
    forgotPassword: async (email) => {
      await forgotPasswordMutation.mutateAsync(email);
    },
    validateResetToken: async (token) => {
      try {
        const response = await apiClient.get(`/auth/reset-password/validate/${token}`);
        return response.data.data.valid;
      } catch (error) {
        return false;
      }
    },
    resetPassword: async (token, password, confirmPassword) => {
      try {
        await apiClient.post('/auth/reset-password', {
          token,
          password,
          confirmPassword
        });
        toast.success('Password has been reset successfully. Please login with your new password.');
        navigate({ to: '/login' });
      } catch (error: any) {
        const message = error.response?.data?.error?.message || 'Password reset failed';
        toast.error(message);
        throw error;
      }
    },
    logout: async () => {
      await logoutMutation.mutateAsync();
    },
    refresh: async () => {
      await refreshMutation.mutateAsync();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
