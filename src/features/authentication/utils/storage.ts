import { setSecureItem, getSecureItem, removeSecureItem } from '@/utils/apiClient';

export async function setAccessToken(token: string): Promise<void> {
  await setSecureItem('access_token', token);
}

export async function getAccessToken(): Promise<string | null> {
  return getSecureItem('access_token');
}

export async function setUserData(userData: Record<string, any>): Promise<void> {
  await setSecureItem('user_data', JSON.stringify(userData));
}

export async function getUserData(): Promise<Record<string, any> | null> {
  const data = await getSecureItem('user_data');
  return data ? JSON.parse(data) : null;
}

export async function clearAuthData(): Promise<void> {
  await removeSecureItem('access_token');
  await removeSecureItem('user_data');
}
