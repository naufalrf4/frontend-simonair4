import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { getBrowserFingerprint } from './fingerprint';

const BASE_URL = import.meta.env.VITE_BASE_URL;

const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    console.log(`🚀 [${config.method?.toUpperCase()}] ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => {
    console.log(`📥 Response [${response.status}] from ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ Response error:', error.response || error);
    return Promise.reject(error);
  },
);

function parseJwt(token: string): { exp?: number } {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return {};
  }
}

function encryptData(data: string, fingerprint: string): string {
  let encrypted = '';
  for (let i = 0; i < data.length; i++) {
    const charCode = data.charCodeAt(i) ^ fingerprint.charCodeAt(i % fingerprint.length);
    encrypted += String.fromCharCode(charCode);
  }
  return btoa(encrypted);
}

function decryptData(encryptedData: string, fingerprint: string): string {
  try {
    const data = atob(encryptedData);
    let decrypted = '';
    for (let i = 0; i < data.length; i++) {
      const charCode = data.charCodeAt(i) ^ fingerprint.charCodeAt(i % fingerprint.length);
      decrypted += String.fromCharCode(charCode);
    }
    return decrypted;
  } catch {
    return '';
  }
}

export async function setSecureItem(key: string, value: string): Promise<void> {
  const fingerprint = await getBrowserFingerprint();
  const encrypted = encryptData(value, fingerprint);
  localStorage.setItem(`${key}_${fingerprint}`, encrypted);
}

export async function getSecureItem(key: string): Promise<string | null> {
  try {
    const fingerprint = await getBrowserFingerprint();
    const encrypted = localStorage.getItem(`${key}_${fingerprint}`);
    if (!encrypted) return null;
    return decryptData(encrypted, fingerprint);
  } catch {
    return null;
  }
}

export async function removeSecureItem(key: string): Promise<void> {
  try {
    const fingerprint = await getBrowserFingerprint();
    localStorage.removeItem(`${key}_${fingerprint}`);
  } catch {
    localStorage.removeItem(key);
  }
}

export async function clearAuthData(): Promise<void> {
  await removeSecureItem('access_token');
  await removeSecureItem('user_data');
}

export function hasTokenSync(): boolean {
  return !!localStorage.getItem('access_token');
}

export async function hasToken(): Promise<boolean> {
  const token = await getSecureItem('access_token');
  return !!token;
}

apiClient.interceptors.request.use(async (config) => {
  const token = await getSecureItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

export async function refreshAccessToken(): Promise<string> {
  try {
    const response = await apiClient.post('/auth/refresh', undefined, {
      withCredentials: true,
    });

    const token = response.data?.data?.access_token;
    if (!token) throw new Error('No token');

    const decoded = parseJwt(token);
    if (!decoded?.exp || isNaN(decoded.exp)) throw new Error('Invalid token');

    await setSecureItem('access_token', token);
    console.info('Access token refreshed');
    window.dispatchEvent(new Event('auth:refresh'));
    return token;
  } catch (err) {
    console.warn('Token refresh failed', err);
    throw err;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const newToken = await refreshAccessToken();
          isRefreshing = false;
          onRefreshed(newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          isRefreshing = false;
          await clearAuthData();
          window.dispatchEvent(new Event('auth:logout'));
          return Promise.reject(refreshError);
        }
      }

      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((token: string) => {
          if (!token) {
            reject(error);
            return;
          }
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(apiClient(originalRequest));
        });
      });
    }
    return Promise.reject(error);
  },
);

export async function getProfile(): Promise<any> {
  const response = await apiClient.get('/auth/profile');
  return response.data?.data;
}

export const loginUser = async (email: string, password: string) => {
  const response = await apiClient.post('/auth/login', { email, password });
  const token = response.data?.data?.access_token;
  if (!token) throw new Error('No access token returned');

  await setSecureItem('access_token', token);

  const user = response.data?.data?.user;
  if (!user) throw new Error('No user data returned');
  const userData = {
    id: user.id,
    email: user.email,
    name: user.fullName,
    user_type: user.role,
  };
  await setSecureItem('user_data', JSON.stringify(userData));

  window.dispatchEvent(new CustomEvent('auth:login', { detail: { user: userData } }));

  return response.data.data;
};

export default apiClient;
