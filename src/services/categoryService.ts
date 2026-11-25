import { api } from './api';
import { ApiResponse } from '../types';

export interface PropertyCategoryStat {
  id?: string;
  type: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  isActive?: boolean;
  totalProperties: number;
  approvedProperties: number;
}

export interface AmenityItem {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  imageUrl?: string | null;
  createdAt: string;
  usageCount?: number;
}

export interface CategoryStatsResponse {
  categories: PropertyCategoryStat[];
  amenities: AmenityItem[];
}

export const categoryService = {
  async getCategoryStats() {
    const { data } = await api.get<ApiResponse<CategoryStatsResponse>>('/admin/categories');
    return data;
  },

  async createCategory(payload: { name: string; type?: string; imageUrl?: string; description?: string }) {
    const { data } = await api.post<ApiResponse<PropertyCategoryStat>>('/admin/categories', payload);
    return data;
  },

  async updateCategory(id: string, payload: { name?: string; imageUrl?: string; description?: string; isActive?: boolean }) {
    const { data } = await api.patch<ApiResponse<PropertyCategoryStat>>(`/admin/categories/${id}`, payload);
    return data;
  },

  async deleteCategory(id: string) {
    const { data } = await api.delete<ApiResponse<null>>(`/admin/categories/${id}`);
    return data;
  },

  async getAmenities() {
    const { data } = await api.get<ApiResponse<AmenityItem[]>>('/amenities');
    return data;
  },

  async createAmenity(payload: { name: string; icon?: string; imageUrl?: string | null }) {
    const { data } = await api.post<ApiResponse<AmenityItem>>('/amenities', payload);
    return data;
  },

  async updateAmenity(id: string, payload: { name?: string; icon?: string; imageUrl?: string | null }) {
    const { data } = await api.patch<ApiResponse<AmenityItem>>(`/amenities/${id}`, payload);
    return data;
  },

  async deleteAmenity(id: string) {
    const { data } = await api.delete<ApiResponse<null>>(`/amenities/${id}`);
    return data;
  },
};

