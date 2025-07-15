import apiClient from '@/utils/apiClient';
import { authConfig } from '../config/authConfig';
import { setSecureItem, removeSecureItem, getSecureItem } from '@/utils/apiClient';
import { adaptUserResponse } from '../adapters/responseAdapter';
import type { User } from '../types';

class AuthApiService {
  static hasTokenSync(): boolean {
    try {
      const token = localStorage.getItem('access_token');
      return !!token;
    } catch (error) {
      return false;
    }
  }

  async setAccessToken(token: string): Promise<void> {
    await setSecureItem('access_token', token);
    
    try {
      localStorage.setItem('access_token', token);
    } catch (error) {

    }
  }

  async getAccessToken(): Promise<string | null> {
    return await getSecureItem('access_token');
  }

  async hasToken(): Promise<boolean> {
    const token = await this.getAccessToken();
    return !!token;
  }

  async setUserData(user: User): Promise<void> {
    await setSecureItem('user_data', JSON.stringify(user));
  }

  async getUserData(): Promise<User | null> {
    try {
      const userData = await getSecureItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      await this.clearAuthData();
      return null;
    }
  }

  async clearAuthData(): Promise<void> {
    await removeSecureItem('access_token');
    await removeSecureItem('user_data');
    
    try {
      localStorage.removeItem('access_token');
    } catch (error) {
    }
  }

  async login(email: string, password: string) {
    try {
      if (authConfig.isSimulation) {
        const token = authConfig.simulation.dummyToken;
        const rawUser = { ...authConfig.simulation.dummyUser, email };
        const userData = adaptUserResponse(rawUser);
        
        await this.setAccessToken(token);
        await this.setUserData(userData);
        
        return { token, user: userData };
      }

      const response = await apiClient.post(authConfig.endpoints.login, { email, password });
      const { accessToken, user } = authConfig.responseParsers.parseAuthResponse(response.data);
      
      if (!accessToken) throw new Error('No access token returned');
      if (!user.id) throw new Error('No user data returned');

      await this.setAccessToken(accessToken);
      await this.setUserData(user);

      return { token: accessToken, user };
    } catch (error) {
      throw error;
    }
  }

  async register(fullName: string, email: string, password: string) {
    try {
      if (authConfig.isSimulation) {
        const token = authConfig.simulation.dummyToken;
        const rawUser = { ...authConfig.simulation.dummyUser, fullName, email };
        const userData = adaptUserResponse(rawUser);
        
        await this.setAccessToken(token);
        await this.setUserData(userData);
        
        return { token, user: userData };
      }

      const response = await apiClient.post(authConfig.endpoints.register, { fullName, email, password });
      const { accessToken, user } = authConfig.responseParsers.parseAuthResponse(response.data);
      
      if (!accessToken) throw new Error('No access token returned');
      if (!user.id) throw new Error('No user data returned');

      await this.setAccessToken(accessToken);
      await this.setUserData(user);

      return { token: accessToken, user };
    } catch (error) {
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      if (authConfig.isSimulation) {
        await this.clearAuthData();
        return;
      }

      try {
        await apiClient.post(authConfig.endpoints.logout, undefined, { withCredentials: true });
      } catch (error) {}

      await this.clearAuthData();
    } catch (error) {
      await this.clearAuthData();
    }
  }

  async refreshToken(): Promise<string> {
    try {
      if (authConfig.isSimulation) {
        const token = authConfig.simulation.dummyToken;
        await this.setAccessToken(token);
        return token;
      }

      const response = await apiClient.post(authConfig.endpoints.refresh, undefined, { withCredentials: true });
      const { accessToken } = authConfig.responseParsers.parseRefreshResponse(response.data);
      
      if (!accessToken) throw new Error('No access token returned');
      
      await this.setAccessToken(accessToken);
      return accessToken;
    } catch (error) {
      throw error;
    }
  }

  async getProfile(): Promise<User> {
    try {
      if (authConfig.isSimulation) {
        const storedUser = await this.getUserData();
        return storedUser || adaptUserResponse(authConfig.simulation.dummyUser);
      }

      const response = await apiClient.get(authConfig.endpoints.profile);
      const userData = authConfig.responseParsers.parseUser(response.data);
      
      if (!userData.id) throw new Error('No user data returned');
      
      await this.setUserData(userData);
      return userData;
    } catch (error) {
      throw error;
    }
  }

  async forgotPassword(email: string): Promise<void> {
    if (authConfig.isSimulation) return;
    await apiClient.post(authConfig.endpoints.forgotPassword, { email });
  }

  async resetPassword(token: string, password: string, confirmPassword: string): Promise<void> {
    if (authConfig.isSimulation) return;
    await apiClient.post(authConfig.endpoints.resetPassword, { token, password, confirmPassword });
  }

  async validateResetToken(token: string): Promise<boolean> {
    if (authConfig.isSimulation) return true;
    
    try {
      const response = await apiClient.get(`${authConfig.endpoints.validateResetToken}/${token}`);
      return response.data?.data?.valid || false;
    } catch (error) {
      return false;
    }
  }

  async getGoogleAuthUrl(redirectUri: string, state: string): Promise<string> {
    try {
      if (authConfig.isSimulation) {
        return 'https://dummy-google-auth-url.com';
      }

      const baseUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
      const params = new URLSearchParams({
        client_id: authConfig.google.clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'email profile',
        state,
        access_type: 'offline',
        prompt: 'consent',
      });

      return `${baseUrl}?${params.toString()}`;
    } catch (error) {
      throw new Error('Failed to generate Google auth URL');
    }
  }

  async handleGoogleCallback(code: string, state: string): Promise<void> {
    try {
      if (authConfig.isSimulation) {
        const token = authConfig.simulation.dummyToken;
        const rawUser = authConfig.simulation.dummyUser;
        const userData = adaptUserResponse(rawUser);
        
        await this.setAccessToken(token);
        await this.setUserData(userData);
        return;
      }

      const response = await apiClient.post(authConfig.endpoints.googleCallback, { code, state });
      const { accessToken, user } = authConfig.responseParsers.parseAuthResponse(response.data);
      
      if (!accessToken) throw new Error('No access token returned');
      if (!user.id) throw new Error('No user data returned');

      await this.setAccessToken(accessToken);
      await this.setUserData(user);
    } catch (error) {
      throw error;
    }
  }
}

export default new AuthApiService();
