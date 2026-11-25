import { api } from './api';
import { ApiResponse, AdminUser } from '../types';

export const adminSettingsService = {
  async getProfile() {
    const { data } = await api.get<ApiResponse<AdminUser>>('/admin/profile');
    return data;
  },

  async updateProfile(payload: { fullName: string; phone?: string | null }) {
    const { data } = await api.patch<ApiResponse<AdminUser>>('/admin/profile', payload);
    return data;
  },

  async changePassword(payload: { currentPassword: string; newPassword: string }) {
    const { data } = await api.patch<ApiResponse<null>>('/admin/change-password', payload);
    return data;
  },
};

