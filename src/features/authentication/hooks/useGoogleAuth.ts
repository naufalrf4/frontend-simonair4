// src/features/authentication/hooks/useGoogleAuth.tsx
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';
import AuthApiService from '../api/authApiService';
import { authConfig } from '../config/authConfig';

export const useGoogleAuth = (redirectTo = '/dashboard') => {
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate({ from: '/login' });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');
    
    if (code && state) {
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      
      const processGoogleCallback = async () => {
        try {
          setGoogleLoading(true);
          await AuthApiService.handleGoogleCallback(code, state);
          toast.success('Google login successful', { position: 'bottom-left' });
          navigate({ to: redirectTo, replace: true });
        } catch (error: any) {
          console.error('Google auth callback failed:', error);
          toast.error(error?.message || 'Google login failed', { position: 'bottom-left' });
        } finally {
          setGoogleLoading(false);
        }
      };
      
      processGoogleCallback();
    } else if (error) {
      toast.error(`Google login failed: ${params.get('error_description') || error}`, { position: 'bottom-left' });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [navigate, redirectTo]);

  const handleGoogleLogin = useCallback(async () => {
    if (googleLoading) return;
    
    setGoogleLoading(true);
    try {
      const redirectUri = authConfig.google?.redirectUri || 
                         `${window.location.origin}/auth/callback`;
      
      const state = Math.random().toString(36).substring(2, 15);
      
      const authUrl = await AuthApiService.getGoogleAuthUrl(redirectUri, state);
      if (!authUrl) {
        throw new Error('Failed to get Google authentication URL');
      }
      
      window.location.href = authUrl;
    } catch (error: any) {
      console.error('Failed to initiate Google login:', error);
      toast.error(error.message || 'Failed to start Google login', { position: 'bottom-left' });
      setGoogleLoading(false);
    }
  }, [googleLoading]);

  return { handleGoogleLogin, googleLoading };
};
