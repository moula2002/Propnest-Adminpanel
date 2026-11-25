import { api } from './api';
import { ApiResponse, DashboardStats, DashboardRecentActivity } from '../types';

export const dashboardService = {
  async getStats() {
    const { data } = await api.get<ApiResponse<DashboardStats>>('/admin/dashboard/stats');
    return data;
  },

  async getRecentActivity() {
    const { data } = await api.get<ApiResponse<DashboardRecentActivity>>('/admin/dashboard/recent-activity');
    return data;
  },

  async getAnalytics() {
    const { data } = await api.get<ApiResponse<any>>('/admin/analytics');
    return data;
  },
};

