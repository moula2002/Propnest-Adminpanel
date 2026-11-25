'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  MapPin,
  Building,
  User,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { adminPropertyService } from '@/services/adminPropertyService';
import { Property, PaginationMeta } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { EmptyState } from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import { Pagination } from '@/components/tables/Pagination';
import { ConfirmationModal } from '@/components/dialogs/ConfirmationModal';
import { useToast } from '@/components/ui/ToastContext';

export default function PendingApprovalsPage() {
  const { success, error } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Approve Modal
  const [approveModal, setApproveModal] = useState<{
    isOpen: boolean;
    property: Property | null;
  }>({ isOpen: false, property: null });

  // Reject Modal
  const [rejectModal, setRejectModal] = useState<{
    isOpen: boolean;
    property: Property | null;
    reason: string;
  }>({ isOpen: false, property: null, reason: '' });

  const [isProcessing, setIsProcessing] = useState(false);

  const fetchPendingProperties = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminPropertyService.getPendingProperties({
        page: pagination.page,
        limit: pagination.limit,
      });
      setProperties(res.data);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to load pending properties');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, error]);

  useEffect(() => {
    fetchPendingProperties();
  }, [fetchPendingProperties]);

  const handleApprove = async () => {
    if (!approveModal.property) return;
    setIsProcessing(true);
    try {
      await adminPropertyService.approveProperty(approveModal.property.id);
      success(`Property "${approveModal.property.title}" approved and live!`);
      setApproveModal({ isOpen: false, property: null });
      fetchPendingProperties();
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to approve property');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectModal.property) return;
    if (!rejectModal.reason.trim()) {
      error('Please provide a reason for rejecting the property');
      return;
    }
    setIsProcessing(true);
    try {
      await adminPropertyService.rejectProperty(rejectModal.property.id, rejectModal.reason);
      success(`Property "${rejectModal.property.title}" rejected with feedback`);
      setRejectModal({ isOpen: false, property: null, reason: '' });
      fetchPendingProperties();
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to reject property');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Property Moderation Queue
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
              {pagination.total} Pending
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Review submitted properties for quality, accuracy, and platform guidelines
          </p>
        </div>

        <button
          onClick={() => fetchPendingProperties()}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Moderation Cards Grid */}
      {isLoading ? (
        <TableSkeleton rows={4} columns={6} />
      ) : properties.length === 0 ? (
        <EmptyState
          icon={CheckCircle}
          title="Moderation queue is clean!"
          description="There are currently no property listings waiting for admin approval."
        />
      ) : (
        <div className="space-y-4">
          {properties.map((prop) => (
            <div
              key={prop.id}
              className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:border-blue-200 transition-all flex flex-col md:flex-row gap-5 items-start md:items-center justify-between"
            >
              {/* Left Column: Image & Details */}
              <div className="flex items-start gap-4 min-w-0 flex-1">
                {prop.images && prop.images.length > 0 && prop.images[0]?.imageUrl ? (
                  <img
                    src={prop.images[0].imageUrl}
                    alt={prop.title}
                    className="w-24 h-24 rounded-2xl object-cover border border-slate-100 flex-shrink-0"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 flex-shrink-0">
                    <Building className="w-8 h-8" />
                  </div>
                )}

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
                      {prop.listingType}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {prop.propertyType}
                    </span>
                    <span className="text-xs text-slate-400">• Submitted {formatDate(prop.createdAt)}</span>
                  </div>

                  <Link
                    href={`/properties/${prop.id}`}
                    className="text-base font-bold text-slate-900 hover:text-blue-600 transition-colors block truncate"
                  >
                    {prop.title}
                  </Link>

                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{prop.locality}, {prop.city}</span>
                    <span className="text-slate-300">•</span>
                    <span className="font-semibold text-slate-700">{formatCurrency(prop.price)}</span>
                  </p>

                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Owner: {prop.owner?.fullName || 'Anonymous'} ({prop.owner?.email})</span>
                  </p>
                </div>
              </div>

              {/* Right Column: Actions */}
              <div className="flex items-center gap-2.5 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                <Link
                  href={`/properties/${prop.id}`}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect</span>
                </Link>

                <button
                  onClick={() => setRejectModal({ isOpen: true, property: prop, reason: '' })}
                  className="px-3.5 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>

                <button
                  onClick={() => setApproveModal({ isOpen: true, property: prop })}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Approve</span>
                </button>
              </div>
            </div>
          ))}

          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalRecords={pagination.total}
            pageSize={pagination.limit}
            onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
          />
        </div>
      )}

      {/* Approve Confirmation Modal */}
      <ConfirmationModal
        isOpen={approveModal.isOpen}
        title="Approve Property Listing"
        message={`Are you sure you want to approve "${approveModal.property?.title}"? The listing will be published immediately on the public real estate portal.`}
        confirmLabel="Approve & Publish"
        variant="primary"
        isLoading={isProcessing}
        onConfirm={handleApprove}
        onCancel={() => setApproveModal({ isOpen: false, property: null })}
      />

      {/* Reject Modal */}
      {rejectModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 p-6 animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Reject Listing</h3>
            <p className="text-xs text-slate-500 mb-4">
              Please enter feedback for {rejectModal.property?.owner?.fullName || 'the owner'}.
            </p>

            <textarea
              rows={4}
              value={rejectModal.reason}
              onChange={(e) => setRejectModal((prev) => ({ ...prev, reason: e.target.value }))}
              placeholder="e.g. Please provide high resolution photos of the bedrooms and clarify the carpet area..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 mb-4"
            />

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setRejectModal({ isOpen: false, property: null, reason: '' })}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing || !rejectModal.reason.trim()}
                onClick={handleReject}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 rounded-xl hover:bg-rose-700 disabled:opacity-50"
              >
                {isProcessing ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

