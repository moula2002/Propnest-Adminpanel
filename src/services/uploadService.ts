import { api } from './api';
import { ApiResponse } from '../types';

export interface UploadResult {
  url: string;
  path: string;
  storageKey: string;
}

export const uploadService = {
  async uploadSingle(file: File): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post<ApiResponse<UploadResult>>('/upload', formData);

    return data.data;
  },

  async uploadMultiple(files: File[]): Promise<UploadResult[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const { data } = await api.post<ApiResponse<UploadResult[]>>('/upload/multiple', formData);

    return data.data;
  },

  async uploadAdminAvatar(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('avatar', file);

    const { data } = await api.patch<ApiResponse<any>>('/admin/profile/avatar', formData);

    return data.data;
  },

  async deleteFile(storageKey: string): Promise<void> {
    await api.delete(`/upload/${storageKey}`);
  },
};

