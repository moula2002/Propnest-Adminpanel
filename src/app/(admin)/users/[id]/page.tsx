'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Building,
  MessageSquare,
  Shield,
  CheckCircle,
  XCircle,
  RefreshCw,
  Clock,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { adminUserService } from '@/services/adminUserService';
import { AdminUser, AccountStatus } from '@/types';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { ConfirmationModal } from '@/components/dialogs/ConfirmationModal';
import { ChangeRoleModal } from '@/components/dialogs/ChangeRoleModal';
import { useToast } from '@/components/ui/ToastContext';

export default function UserDetailPage() {
  const params = useParams();
  const userId = params?.id as string;
  const router = useRouter();
  const { success, error } = useToast();

  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Status Action Modal
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<AccountStatus>('ACTIVE');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Role Modal
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  const fetchUserDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminUserService.getUserById(userId);
      setUser(res.data);
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to load user details');
    } finally {
      setIsLoading(false);
    }
  }, [userId, error]);

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [userId, fetchUserDetails]);

  const handleStatusChange = async () => {
    if (!user) return;
    setIsUpdatingStatus(true);
    try {
      await adminUserService.updateUserStatus(user.id, targetStatus);
      success(`User account status updated to ${targetStatus}`);
      setIsStatusModalOpen(false);
      fetchUserDetails();
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to update user status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <LoadingSkeleton className="h-64" />
          <LoadingSkeleton className="h-64 lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-12 bg-white rounded-3xl text-center border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800">User not found</h2>
        <p className="text-sm text-slate-500 mt-1 mb-6">
          The requested user record does not exist or has been deleted.
        </p>
        <Link
          href="/users"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Users</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{user.fullName}</h1>
            <p className="text-xs text-slate-500 font-mono">User ID: {user.id}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          {/* Change Role Button */}
          <button
            onClick={() => setIsRoleModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Change Role ({user.role})</span>
          </button>

          {/* Account Status Toggle */}
          {user.accountStatus === 'ACTIVE' ? (
            <button
              onClick={() => {
                setTargetStatus('SUSPENDED');
                setIsStatusModalOpen(true);
              }}
              className="px-3.5 py-2 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 transition-colors flex items-center gap-1.5"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Suspend Account</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setTargetStatus('ACTIVE');
                setIsStatusModalOpen(true);
              }}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Activate Account</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-700 font-extrabold text-2xl flex items-center justify-center uppercase shadow-inner">
                {user.fullName.charAt(0)}
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-slate-900 truncate">{user.fullName}</h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <Badge status={user.role} />
                  <Badge status={user.accountStatus} />
                </div>
              </div>
            </div>

            <div className="space-y-3.5 text-xs pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3 text-slate-600">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{user.phone || 'No phone registered'}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Member since {formatDate(user.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Properties & Inquiries Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Properties Created by User */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Owned Property Listings ({user.properties?.length || 0})
                </h3>
              </div>
            </div>

            {!user.properties || user.properties.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                This user has not submitted any property listings yet.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {user.properties.map((prop) => (
                  <div key={prop.id} className="py-3 flex items-center justify-between">
                    <div>
                      <Link
                        href={`/properties/${prop.id}`}
                        className="font-semibold text-slate-800 hover:text-blue-600 transition-colors"
                      >
                        {prop.title}
                      </Link>
                      <p className="text-[11px] text-slate-400">
                        {prop.city} • {formatCurrency(prop.price)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge status={prop.status} />
                      <Link
                        href={`/properties/${prop.id}`}
                        className="p-1 text-slate-400 hover:text-blue-600 rounded"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Inquiries Made by User */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Buyer Inquiries Submitted ({user.buyerInquiries?.length || 0})
                </h3>
              </div>
            </div>

            {!user.buyerInquiries || user.buyerInquiries.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                This user has not sent any property inquiries yet.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {user.buyerInquiries.map((inq: any) => (
                  <div key={inq.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">{inq.property?.title || 'Property'}</p>
                      <p className="text-[11px] text-slate-400 italic">&ldquo;{inq.message}&rdquo;</p>
                    </div>
                    <Badge status={inq.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Change Role Modal */}
      <ChangeRoleModal
        isOpen={isRoleModalOpen}
        user={user}
        onClose={() => setIsRoleModalOpen(false)}
        onSuccess={(updated) => {
          setUser(updated);
          setIsRoleModalOpen(false);
        }}
      />

      {/* Account Status Confirmation Modal */}
      <ConfirmationModal
        isOpen={isStatusModalOpen}
        title={targetStatus === 'ACTIVE' ? 'Activate User Account' : 'Suspend User Account'}
        message={
          targetStatus === 'ACTIVE'
            ? `Are you sure you want to activate ${user.fullName}'s account?`
            : `Are you sure you want to suspend ${user.fullName}'s account?`
        }
        confirmLabel={targetStatus === 'ACTIVE' ? 'Activate User' : 'Suspend User'}
        variant={targetStatus === 'ACTIVE' ? 'primary' : 'danger'}
        isLoading={isUpdatingStatus}
        onConfirm={handleStatusChange}
        onCancel={() => setIsStatusModalOpen(false)}
      />
    </div>
  );
}
