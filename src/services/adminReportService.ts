import { api } from './api';
import { ApiResponse } from '../types';

export const adminReportService = {
  async getUserReports() {
    const { data } = await api.get<ApiResponse<{
      total: number;
      byRole: { role: string; count: number }[];
      byStatus: { status: string; count: number }[];
      monthlyGrowth: { month: string; count: number }[];
    }>>('/admin/reports/users');
    return data;
  },

  async getPropertyReports() {
    const { data } = await api.get<ApiResponse<{
      total: number;
      byType: { type: string; count: number }[];
      byListingType: { type: string; count: number }[];
      byCity: { city: string; count: number }[];
      byStatus: { status: string; count: number }[];
      monthlyGrowth: { month: string; count: number }[];
    }>>('/admin/reports/properties');
    return data;
  },

  async getInquiryReports() {
    const { data } = await api.get<ApiResponse<{
      total: number;
      byStatus: { status: string; count: number }[];
      monthlyGrowth: { month: string; count: number }[];
    }>>('/admin/reports/inquiries');
    return data;
  },
};

