import { api, setAccessToken } from './api';
import { AdminUser, ApiResponse } from '../types';

export const adminAuthService = {
  async login(credentials: { email: string; password: string }) {
    const { data } = await api.post<ApiResponse<{ user: AdminUser; accessToken: string }>>(
      '/admin/auth/login',
      credentials
    );
    if (data?.data?.accessToken) {
      setAccessToken(data.data.accessToken);
    }
    return data;
  },

  async logout() {
    try {
      await api.post('/admin/auth/logout');
    } finally {
      setAccessToken(null);
    }
  },

  async getMe() {
    const { data } = await api.get<ApiResponse<AdminUser>>('/admin/auth/me');
    return data;
  },

  async refresh() {
    const { data } = await api.post<ApiResponse<{ accessToken: string }>>('/admin/auth/refresh');
    if (data?.data?.accessToken) {
      setAccessToken(data.data.accessToken);
    }
    return data;
  },
};

