import { adaptAuthResponse, adaptRefreshResponse, adaptUserResponse } from '../adapters/responseAdapter';
import { parseJwt } from '../utils/token';

export const authConfig = {
  isSimulation: false, 
  endpoints: {
    login: '/auth/login',
    register: '/auth/register',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    google: '/auth/google',
    googleCallback: '/auth/google/callback',
    profile: '/auth/profile',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    validateResetToken: '/auth/reset-password/validate',
  },
  responseParsers: {
    parseAccessToken: (responseData: any) => responseData?.data?.accessToken || responseData?.data?.access_token,
    parseUser: (responseData: any) => adaptUserResponse(responseData?.data?.user || responseData?.data),
    parseAuthResponse: (responseData: any) => adaptAuthResponse(responseData),
    parseRefreshResponse: (responseData: any) => adaptRefreshResponse(responseData),
    parseExpFromToken: (token: string) => {
      const decoded = parseJwt(token);
      return decoded?.exp;
    },
  },
  features: {
    autoRefreshOn401: true,
    useFingerprintEncryption: true,
    enableResetPassword: true,
    enableEmailVerification: false,
  },
  google: {
    redirectUri: window.location.origin + '/',
    callbackPath: '/auth/callback',
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
    scopes: ['email', 'profile']
  },
  simulation: {
    dummyToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE5OTk5OTk5OTl9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    dummyUser: {
      id: 'user-123',
      email: 'dummy@example.com',
      fullName: 'Dummy User',
      role: 'user',
      emailVerified: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    },
  },
};