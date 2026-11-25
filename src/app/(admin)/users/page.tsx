'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  MoreVertical,
  Shield,
  Building,
  UserCheck,
} from 'lucide-react';
import { adminUserService, UserFilterParams } from '@/services/adminUserService';
import { AdminUser, AccountStatus, Role, PaginationMeta } from '@/types';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/tables/Pagination';
import { ConfirmationModal } from '@/components/dialogs/ConfirmationModal';
import { ChangeRoleModal } from '@/components/dialogs/ChangeRoleModal';
import { useToast } from '@/components/ui/ToastContext';

export default function UsersPage() {
  const { success, error } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role | ''>('');
  const [selectedStatus, setSelectedStatus] = useState<AccountStatus | ''>('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(true);

  // Status Action Modal State
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    user: AdminUser | null;
    targetStatus: AccountStatus;
  }>({
    isOpen: false,
    user: null,
    targetStatus: 'ACTIVE',
  });
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Role Action Modal State
  const [roleModalUser, setRoleModalUser] = useState<AdminUser | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: UserFilterParams = {
        page: pagination.page,
        limit: pagination.limit,
        search: search.trim() || undefined,
        role: selectedRole || undefined,
        status: selectedStatus || undefined,
        sortBy,
        sortOrder,
      };

      const res = await adminUserService.getUsers(params);
      setUsers(res.data);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, search, selectedRole, selectedStatus, sortBy, sortOrder, error]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleStatusChange = async () => {
    if (!statusModal.user) return;
    setIsUpdatingStatus(true);
    try {
      await adminUserService.updateUserStatus(statusModal.user.id, statusModal.targetStatus);
      success(`User ${statusModal.user.fullName} is now ${statusModal.targetStatus.toLowerCase()}`);
      setStatusModal({ isOpen: false, user: null, targetStatus: 'ACTIVE' });
      fetchUsers();
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to update user status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            View, moderate, manage roles, and monitor platform registered users, agents, and administrators
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchUsers()}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filters and Search Toolbar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => {
              setSelectedRole(e.target.value as Role | '');
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="">All Roles</option>
            <option value="USER">User</option>
            <option value="AGENT">Agent</option>
            <option value="ADMIN">Admin</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value as AccountStatus | '');
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="DEACTIVATED">Deactivated</option>
          </select>

          {/* Sorting Order */}
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
            <option value="fullName-asc">Name (A-Z)</option>
            <option value="fullName-desc">Name (Z-A)</option>
          </select>
        </div>
      </div>

      {/* Users Data Table */}
      {isLoading ? (
        <TableSkeleton rows={6} columns={7} />
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description="Try adjusting your search query, status filters, or role selections."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">User</th>
                  <th className="py-3.5 px-6">Phone</th>
                  <th className="py-3.5 px-6">Role</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Properties</th>
                  <th className="py-3.5 px-6">Joined Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                          {user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/users/${user.id}`}
                            className="font-semibold text-slate-900 hover:text-blue-600 transition-colors truncate block"
                          >
                            {user.fullName}
                          </Link>
                          <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-600 font-mono">
                      {user.phone || '—'}
                    </td>

                    <td className="py-4 px-6">
                      <Badge status={user.role} />
                    </td>

                    <td className="py-4 px-6">
                      <Badge status={user.accountStatus} />
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-700 font-semibold">
                      {user._count?.properties ?? 0}
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-500">
                      {formatDate(user.createdAt)}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View User */}
                        <Link
                          href={`/users/${user.id}`}
                          title="View Profile & Listings"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        {/* Change Role Button */}
                        <button
                          title="Change User Role"
                          onClick={() => setRoleModalUser(user)}
                          className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        >
                          <Shield className="w-4 h-4" />
                        </button>

                        {/* Status Toggle Action */}
                        {user.accountStatus === 'ACTIVE' ? (
                          <button
                            title="Suspend User Account"
                            onClick={() =>
                              setStatusModal({ isOpen: true, user, targetStatus: 'SUSPENDED' })
                            }
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            title="Reactivate User Account"
                            onClick={() =>
                              setStatusModal({ isOpen: true, user, targetStatus: 'ACTIVE' })
                            }
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
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

      {/* Change Role Modal */}
      <ChangeRoleModal
        isOpen={!!roleModalUser}
        user={roleModalUser}
        onClose={() => setRoleModalUser(null)}
        onSuccess={() => {
          setRoleModalUser(null);
          fetchUsers();
        }}
      />

      {/* Account Status Confirmation Modal */}
      <ConfirmationModal
        isOpen={statusModal.isOpen}
        title={statusModal.targetStatus === 'ACTIVE' ? 'Activate User Account' : 'Suspend User Account'}
        message={
          statusModal.targetStatus === 'ACTIVE'
            ? `Are you sure you want to activate ${statusModal.user?.fullName}'s account? They will regain full platform access.`
            : `Are you sure you want to suspend ${statusModal.user?.fullName}'s account? They will be locked out immediately.`
        }
        confirmLabel={statusModal.targetStatus === 'ACTIVE' ? 'Activate User' : 'Suspend User'}
        variant={statusModal.targetStatus === 'ACTIVE' ? 'primary' : 'danger'}
        isLoading={isUpdatingStatus}
        onConfirm={handleStatusChange}
        onCancel={() => setStatusModal({ isOpen: false, user: null, targetStatus: 'ACTIVE' })}
      />
    </div>
  );
}
