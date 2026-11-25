import { api } from './api';
import { ApiResponse, InquirySummary, InquiryStatus } from '../types';

export interface InquiryFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: InquiryStatus;
  city?: string;
  from?: string;
  to?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const adminInquiryService = {
  async getInquiries(params?: InquiryFilterParams) {
    const { data } = await api.get<ApiResponse<InquirySummary[]>>('/admin/inquiries', { params });
    return data;
  },

  async getInquiryById(id: string) {
    const { data } = await api.get<ApiResponse<InquirySummary>>(`/admin/inquiries/${id}`);
    return data;
  },

  async updateInquiryStatus(id: string, status: InquiryStatus) {
    const { data } = await api.patch<ApiResponse<InquirySummary>>(`/admin/inquiries/${id}/status`, {
      status,
    });
    return data;
  },
};

