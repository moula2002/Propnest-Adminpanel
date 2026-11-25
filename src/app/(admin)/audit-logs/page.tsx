'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Search,
  RefreshCw,
  Eye,
  Calendar,
  X,
  Code,
  User,
} from 'lucide-react';
import { adminAuditLogService, AuditLogFilterParams } from '@/services/adminAuditLogService';
import { AuditLogItem, PaginationMeta } from '@/types';
import { formatDateTime } from '@/lib/utils';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/tables/Pagination';
import { useToast } from '@/components/ui/ToastContext';

export default function AuditLogsPage() {
  const { error } = useToast();
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Inspector Modal State
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const fetchAuditLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: AuditLogFilterParams = {
        page: pagination.page,
        limit: pagination.limit,
        search: search.trim() || undefined,
        action: actionFilter || undefined,
      };

      const res = await adminAuditLogService.getAuditLogs(params);
      setLogs(res.data);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to load audit logs');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, search, actionFilter, error]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Audit Logs</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Immutable administrative tracking, security actions, and moderation history
          </p>
        </div>
        <button
          onClick={() => fetchAuditLogs()}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Search and Action Filter */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by action, actor, or entity..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="">All Actions</option>
            <option value="ADMIN_LOGIN">ADMIN LOGIN</option>
            <option value="PROPERTY_APPROVED">PROPERTY APPROVED</option>
            <option value="PROPERTY_REJECTED">PROPERTY REJECTED</option>
            <option value="USER_STATUS_CHANGE">USER STATUS CHANGE</option>
            <option value="USER_ROLE_CHANGE">USER ROLE CHANGE</option>
            <option value="INQUIRY_STATUS_CHANGE">INQUIRY STATUS CHANGE</option>
            <option value="ADMIN_PASSWORD_CHANGE">PASSWORD CHANGE</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      {isLoading ? (
        <TableSkeleton rows={8} columns={6} />
      ) : logs.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No audit records found"
          description="There are currently no audit entries matching your query."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Timestamp</th>
                  <th className="py-3.5 px-6">Administrator / Actor</th>
                  <th className="py-3.5 px-6">Action</th>
                  <th className="py-3.5 px-6">Entity Target</th>
                  <th className="py-3.5 px-6">IP Address</th>
                  <th className="py-3.5 px-6 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 text-xs text-slate-500 whitespace-nowrap">
                      {formatDateTime(log.createdAt)}
                    </td>

                    <td className="py-4 px-6">
                      <p className="text-xs font-semibold text-slate-900">
                        {log.actor?.fullName || 'System Automated'}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {log.actor?.role || 'SYSTEM'}
                      </p>
                    </td>

                    <td className="py-4 px-6">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200/60">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-600">
                      <p className="font-semibold text-slate-800">{log.entityType}</p>
                      <p className="text-[11px] text-slate-400 font-mono truncate max-w-xs">
                        {log.entityId}
                      </p>
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-500 font-mono">
                      {log.ipAddress || '127.0.0.1'}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        title="View Raw Audit Details"
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalRecords={pagination.total}
            pageSize={pagination.limit}
            onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
            onPageSizeChange={(limit) => setPagination((prev) => ({ ...prev, limit, page: 1 }))}
          />
        </div>
      )}

      {/* Detail JSON Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 p-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Code className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Audit Record Detail</h3>
                  <p className="text-xs text-slate-400 font-mono">ID: {selectedLog.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs mb-4">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Action:</span>
                <span className="font-bold text-blue-700 font-mono">{selectedLog.action}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Actor:</span>
                <span className="font-semibold text-slate-900">{selectedLog.actor?.fullName || 'System'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Target Entity:</span>
                <span className="font-mono text-slate-700">{selectedLog.entityType} ({selectedLog.entityId})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Timestamp:</span>
                <span className="text-slate-700">{formatDateTime(selectedLog.createdAt)}</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-700 mb-1.5">Recorded Metadata:</p>
              <pre className="p-3 bg-slate-900 text-emerald-400 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-56">
                {JSON.stringify(selectedLog.metadata || {}, null, 2)}
              </pre>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

