import { type User, type ApiErrorResponse } from '../types';

export const adaptUserResponse = (rawUser: any): User => {
  return {
    id: rawUser.id || rawUser.userId || '',
    email: rawUser.email || '',
    fullName: rawUser.fullName || rawUser.name || '',
    name: rawUser.fullName || rawUser.name || '', // For compatibility
    role: rawUser.role || rawUser.userType || 'user',
    user_type: rawUser.role || rawUser.userType || 'user', // For compatibility
    emailVerified: rawUser.emailVerified || false,
    isActive: rawUser.isActive !== undefined ? rawUser.isActive : true,
    createdAt: rawUser.createdAt || new Date().toISOString(),
    updatedAt: rawUser.updatedAt || new Date().toISOString(),
    lastLogin: rawUser.lastLogin || null,
  };
};

export const adaptAuthResponse = (responseData: any): { accessToken: string; user: User } => {
  const data = responseData.data || responseData;
  return {
    accessToken: data.accessToken || data.access_token || '',
    user: adaptUserResponse(data.user || data),
  };
};

export const adaptRefreshResponse = (responseData: any): { accessToken: string } => {
  const data = responseData.data || responseData;
  return {
    accessToken: data.accessToken || data.access_token || '',
  };
};

export const isApiError = (response: any): response is ApiErrorResponse => {
  return response?.status === 'error' && response?.error;
};
