'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Building,
  User,
  ExternalLink,
} from 'lucide-react';
import { adminInquiryService, InquiryFilterParams } from '@/services/adminInquiryService';
import { InquirySummary, InquiryStatus, PaginationMeta } from '@/types';
import { formatDate, formatTimeAgo } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/tables/Pagination';
import { useToast } from '@/components/ui/ToastContext';

export default function InquiriesPage() {
  const { success, error } = useToast();
  const [inquiries, setInquiries] = useState<InquirySummary[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<InquiryStatus | ''>('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(true);

  const fetchInquiries = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: InquiryFilterParams = {
        page: pagination.page,
        limit: pagination.limit,
        search: search.trim() || undefined,
        status: selectedStatus || undefined,
        sortBy,
        sortOrder,
      };

      const res = await adminInquiryService.getInquiries(params);
      setInquiries(res.data);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to load inquiries');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, search, selectedStatus, sortBy, sortOrder, error]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const handleStatusChange = async (inquiryId: string, newStatus: InquiryStatus) => {
    try {
      await adminInquiryService.updateInquiryStatus(inquiryId, newStatus);
      success(`Inquiry status updated to ${newStatus.replace(/_/g, ' ')}`);
      fetchInquiries();
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to update inquiry status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inquiry Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor buyer inquiries, communication leads, and spam moderation
          </p>
        </div>
        <button
          onClick={() => fetchInquiries()}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search inquiries by sender, phone, message..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value as InquiryStatus | '');
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="CLOSED">Closed</option>
            <option value="SPAM">Spam</option>
          </select>

          {/* Sort Order */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order as 'asc' | 'desc');
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Inquiry Data Table */}
      {isLoading ? (
        <TableSkeleton rows={6} columns={7} />
      ) : inquiries.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No inquiries found"
          description="There are currently no property inquiries matching your search or filters."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Sender</th>
                  <th className="py-3.5 px-6">Property</th>
                  <th className="py-3.5 px-6">Owner</th>
                  <th className="py-3.5 px-6">Message Preview</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {inquiries.map((inq) => (
                  <tr key={inq.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <Link
                        href={`/inquiries/${inq.id}`}
                        className="font-semibold text-slate-900 hover:text-blue-600 transition-colors truncate block"
                      >
                        {inq.name}
                      </Link>
                      <p className="text-xs text-slate-500 font-mono">{inq.phone}</p>
                      <p className="text-[11px] text-slate-400 truncate">{inq.email}</p>
                    </td>

                    <td className="py-4 px-6 max-w-xs">
                      {inq.property ? (
                        <>
                          <Link
                            href={`/properties/${inq.property.id}`}
                            className="font-medium text-slate-800 hover:text-blue-600 transition-colors truncate block text-xs"
                          >
                            {inq.property.title}
                          </Link>
                          <span className="text-[11px] text-slate-400">{inq.property.city}</span>
                        </>
                      ) : (
                        <>
                          <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-50 text-[#F5820D] border border-orange-200">
                            Contact Us
                          </span>
                          <span className="block text-[11px] text-slate-400 mt-0.5">Website Inquiry</span>
                        </>
                      )}
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-600">
                      <p className="font-semibold text-slate-800">{inq.owner?.fullName || 'Admin Team'}</p>
                      <p className="text-[11px] text-slate-400 truncate">{inq.owner?.email || 'General Lead'}</p>
                    </td>

                    <td className="py-4 px-6 max-w-sm">
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {inq.message}
                      </p>
                    </td>

                    <td className="py-4 px-6">
                      <Badge status={inq.inquiryStatus} />
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-500">
                      {formatTimeAgo(inq.createdAt)}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/inquiries/${inq.id}`}
                          title="View Details"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        {inq.inquiryStatus === 'NEW' && (
                          <button
                            title="Mark Contacted"
                            onClick={() => handleStatusChange(inq.id, 'CONTACTED')}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}

                        {inq.inquiryStatus !== 'SPAM' && (
                          <button
                            title="Mark Spam"
                            onClick={() => handleStatusChange(inq.id, 'SPAM')}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
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
    </div>
  );
}

