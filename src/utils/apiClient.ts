import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { eventBus } from './eventBus';
import { getBrowserFingerprint, decryptToken, encryptToken } from './fingerprint';
import { jwtDecode } from 'jwt-decode';
import { API_BASE_URL } from './constants';

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
    config: AxiosRequestConfig;
  }> = [];

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      withCredentials: true,
    });

    this.setupInterceptors();
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    eventBus.on('profile-fetch-required', () => {
      this.fetchProfile();
    });
  }

  private async fetchProfile(): Promise<void> {
    try {
      const response = await this.client.get('/auth/profile');

      const user = response.data.data;

      if (!user) {
        throw new Error('User data missing in profile response');
      }

      eventBus.emit('profile-updated', { user });
    } catch (error: any) {
      let errorType:
        | 'refresh_failed'
        | 'network_error'
        | 'invalid_token'
        | 'fetch_failed'
        | 'unauthorized' = 'fetch_failed';
      if (error.response?.status === 401) {
        errorType = 'unauthorized';
        eventBus.emit('logout-required', {});
      }
      eventBus.emit('auth-error', { error, type: errorType });
    }
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      async (config) => {
        const token = await this.getTokenFromStorage();
        if (token) {
          // Check if token is expired before making request
          if (this.isTokenExpired(token)) {
            console.log('🚨 Token expired in request interceptor');
            eventBus.emit('token-expired', {});
            // Continue with expired token, let response interceptor handle refresh
          }
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Don't retry refresh endpoint
        if (originalRequest.url?.includes('/auth/refresh')) {
          return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            console.log('🔄 Refresh in progress, queuing request');
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject, config: originalRequest });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            console.log('🔄 Attempting token refresh from interceptor');
            const response = await this.client.post('/auth/refresh');
            const newToken = response.data.data.accessToken;

            console.log('✅ Token refreshed successfully in interceptor');

            // Update storage immediately
            await this.saveTokenToStorage(newToken);

            // Emit event for context to handle
            eventBus.emit('token-refreshed', { token: newToken });

            // Update original request with new token
            originalRequest.headers.Authorization = `Bearer ${newToken}`;

            // Process queued requests
            this.processQueue(null, newToken);

            // Retry original request
            return this.client(originalRequest);
          } catch (refreshError: any) {
            console.error('❌ Token refresh failed in interceptor:', refreshError);

            // Process queued requests with error
            this.processQueue(refreshError);

            // Emit auth error event
            eventBus.emit('auth-error', {
              error: refreshError,
              type: 'refresh_failed',
            });

            if (refreshError.response?.status === 401) {
              eventBus.emit('logout-required', {});
            }

            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      },
    );
  }

  private async getTokenFromStorage(): Promise<string | null> {
    try {
      const encrypted = localStorage.getItem('simonairToken');
      if (!encrypted) return null;

      const fingerprint = await getBrowserFingerprint();
      return await decryptToken(encrypted, fingerprint);
    } catch (error) {
      console.error('Failed to get token from storage:', error);
      return null;
    }
  }

  private async saveTokenToStorage(token: string): Promise<void> {
    try {
      const fingerprint = await getBrowserFingerprint();
      const encrypted = await encryptToken(token, fingerprint);
      localStorage.setItem('simonairToken', encrypted);
    } catch (error) {
      console.error('Failed to save token to storage:', error);
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const decoded: { exp: number } = jwtDecode(token);
      return Date.now() >= decoded.exp * 1000 - 30000;
    } catch (error) {
      return true;
    }
  }

  private processQueue(error: any, token?: string): void {
    this.failedQueue.forEach(({ resolve, reject, config }) => {
      if (error) {
        reject(error);
      } else {
        if (!config.headers) {
          config.headers = {};
        }
        config.headers.Authorization = `Bearer ${token}`;
        resolve(this.client(config));
      }
    });

    this.failedQueue = [];
  }

  get(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return this.client.get(url, config);
  }

  post(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return this.client.post(url, data, config);
  }

  put(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return this.client.put(url, data, config);
  }

  delete(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return this.client.delete(url, config);
  }

  destroy(): void {
    this.client.defaults.timeout = 1;
    this.failedQueue = [];
  }
}

export const apiClient = new ApiClient(API_BASE_URL || 'http://localhost:8000/');
