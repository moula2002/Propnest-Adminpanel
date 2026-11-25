import { api } from './api';
import { AdminUser, ApiResponse, Role, AccountStatus } from '../types';

export interface UserFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role;
  status?: AccountStatus;
  from?: string;
  to?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const adminUserService = {
  async getUsers(params?: UserFilterParams) {
    const { data } = await api.get<ApiResponse<AdminUser[]>>('/admin/users', { params });
    return data;
  },

  async getUserById(id: string) {
    const { data } = await api.get<ApiResponse<AdminUser>>(`/admin/users/${id}`);
    return data;
  },

  async updateUserStatus(id: string, status: AccountStatus, reason?: string) {
    const { data } = await api.patch<ApiResponse<AdminUser>>(`/admin/users/${id}/status`, {
      status,
      reason,
    });
    return data;
  },

  async updateUserRole(id: string, role: Role) {
    const { data } = await api.patch<ApiResponse<AdminUser>>(`/admin/users/${id}/role`, {
      role,
    });
    return data;
  },
};

