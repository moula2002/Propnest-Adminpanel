import { api } from './api';
import { ApiResponse, AuditLogItem } from '../types';

export interface AuditLogFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  action?: string;
  entityType?: string;
  actorId?: string;
  from?: string;
  to?: string;
}

export const adminAuditLogService = {
  async getAuditLogs(params?: AuditLogFilterParams) {
    const { data } = await api.get<ApiResponse<AuditLogItem[]>>('/admin/audit-logs', { params });
    return data;
  },

  async getAuditLogById(id: string) {
    const { data } = await api.get<ApiResponse<AuditLogItem>>(`/admin/audit-logs/${id}`);
    return data;
  },
};

