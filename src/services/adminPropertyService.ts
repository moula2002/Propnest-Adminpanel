import { api } from './api';
import { Property, ApiResponse, PropertyStatus, PropertyType, ListingType, ModerationHistoryItem } from '../types';

export interface PropertyFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: PropertyStatus;
  city?: string;
  locality?: string;
  propertyType?: PropertyType;
  listingType?: ListingType;
  minPrice?: number;
  maxPrice?: number;
  from?: string;
  to?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const adminPropertyService = {
  async getProperties(params?: PropertyFilterParams) {
    const { data } = await api.get<ApiResponse<Property[]>>('/admin/properties', { params });
    return data;
  },

  async getPendingProperties(params?: { page?: number; limit?: number; search?: string }) {
    const { data } = await api.get<ApiResponse<Property[]>>('/admin/properties/pending', { params });
    return data;
  },

  async getPropertyById(id: string) {
    const { data } = await api.get<ApiResponse<Property>>(`/admin/properties/${id}`);
    return data;
  },

  async createProperty(payload: any) {
    const { data } = await api.post<ApiResponse<Property>>('/admin/properties', payload);
    return data;
  },

  async approveProperty(id: string) {
    const { data } = await api.patch<ApiResponse<Property>>(`/admin/properties/${id}/approve`);
    return data;
  },

  async updateProperty(id: string, payload: Partial<Property>) {
    const { data } = await api.patch<ApiResponse<Property>>(`/admin/properties/${id}`, payload);
    return data;
  },

  async rejectProperty(id: string, reason: string) {
    const { data } = await api.patch<ApiResponse<Property>>(`/admin/properties/${id}/reject`, { reason });
    return data;
  },

  async updatePropertyStatus(id: string, status: PropertyStatus, reason?: string) {
    const { data } = await api.patch<ApiResponse<Property>>(`/admin/properties/${id}/status`, { status, reason });
    return data;
  },

  async deleteProperty(id: string) {
    const { data } = await api.delete<ApiResponse<null>>(`/admin/properties/${id}`);
    return data;
  },

  async getModerationHistory(id: string) {
    const { data } = await api.get<ApiResponse<ModerationHistoryItem[]>>(`/admin/properties/${id}/moderation-history`);
    return data;
  },
};

