import { type UseMutationResult } from '@tanstack/react-query';

export type UserRole = 'superuser' | 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  fullName: string;
  name: string; // For compatibility with existing components
  role: UserRole;
  user_type: UserRole; // For compatibility with existing components
  emailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin: string | null;
}

export interface AuthResponse {
  status: 'success' | 'error';
  data?: {
    accessToken: string;
    user: User;
  };
  error?: {
    statusCode: number;
    message: string;
    error: string;
  };
  metadata: {
    timestamp: string;
    path: string;
    executionTime: number;
  };
}

export interface RefreshResponse {
  status: 'success' | 'error';
  data?: {
    accessToken: string;
  };
  error?: {
    statusCode: number;
    message: string;
    error: string;
  };
  metadata: {
    timestamp: string;
    path: string;
    executionTime: number;
  };
}

export interface ApiErrorResponse {
  status: 'error';
  error: {
    statusCode: number;
    message: string;
    error: string;
  };
  metadata: {
    timestamp: string;
    path: string;
    executionTime: number;
  };
}


export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoggingIn: boolean;
  isLoggingOut: boolean;
  isRegistering: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string, confirmPassword: string) => Promise<void>;
  validateResetToken: (token: string) => Promise<boolean>;
  refreshToken: () => Promise<string>;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  loginMutation: any;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  fullName: string;
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface GoogleAuthResponse {
  status: 'success';
  data: {
    url: string;
  };
  metadata: {
    timestamp: string;
    path: string;
    executionTime: number;
  };
}
