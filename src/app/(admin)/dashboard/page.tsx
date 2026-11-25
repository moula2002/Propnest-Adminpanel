'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Users,
  Building2,
  Clock,
  MessageSquare,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Home,
  Calendar,
  ArrowRight,
  ShieldAlert,
  Activity,
  RefreshCw,
  Eye,
  Plus,
  Layers,
} from 'lucide-react';
import { dashboardService } from '@/services/dashboardService';
import { adminReportService } from '@/services/adminReportService';
import { DashboardStats, DashboardRecentActivity } from '@/types';
import { formatCurrency, formatDate, formatTimeAgo } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const PIE_COLORS = ['#0B2246', '#F5820D', '#10B981', '#1B417A', '#8B5CF6', '#EC4899', '#06B6D4'];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<DashboardRecentActivity | null>(null);
  const [propertyReports, setPropertyReports] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsRes, recentRes, propReportsRes] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRecentActivity(),
        adminReportService.getPropertyReports(),
      ]);

      setStats(statsRes.data);
      setRecent(recentRes.data);
      setPropertyReports(propReportsRes.data);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (error) {
    return (
      <div className="p-8 bg-white rounded-3xl border border-rose-100 shadow-sm text-center">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900">Failed to load Dashboard</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-5">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Title & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Platform Overview</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time analytics, property moderation workflow, and system activity
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/properties/create"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#F5820D] rounded-xl hover:bg-[#DC6F05] transition-colors shadow-sm shadow-[#F5820D]/25"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Property</span>
          </Link>
          <Link
            href="/categories"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0B2246] bg-[#EEF3FA] border border-[#0B2246]/15 rounded-xl hover:bg-[#0B2246] hover:text-white transition-colors shadow-sm"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Categories</span>
          </Link>
          <button
            onClick={fetchDashboardData}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            href="/properties/pending"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#C46000] bg-[#FFF4E8] border border-[#F5820D]/30 rounded-xl hover:bg-[#F5820D] hover:text-white transition-colors shadow-sm"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Moderate Pending</span>
          </Link>
        </div>
      </div>

      {/* 13 Primary Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            {/* 1. Total Users */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-blue-200 transition-all">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Users</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">{stats?.totalUsers ?? 0}</span>
                <span className="text-xs text-slate-500 font-medium">registered</span>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs">
                <span className="text-emerald-600 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {stats?.activeUsers ?? 0} Active
                </span>
                <span className="text-slate-400">{stats?.inactiveUsers ?? 0} Inactive</span>
              </div>
            </div>

            {/* 2. Total Properties */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-blue-200 transition-all">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Properties</span>
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">{stats?.totalProperties ?? 0}</span>
                <span className="text-xs text-slate-500 font-medium">all listings</span>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs">
                <span className="text-emerald-600 font-medium">{stats?.activeProperties ?? 0} Approved</span>
                <span className="text-blue-600 font-medium">{stats?.rentalProperties ?? 0} Rentals</span>
              </div>
            </div>

            {/* 3. Pending Approvals */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-amber-200 transition-all">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Pending Approvals</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-amber-600">{stats?.pendingProperties ?? 0}</span>
                <span className="text-xs text-slate-500 font-medium">needs review</span>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs">
                <span className="text-rose-600 font-medium">{stats?.rejectedProperties ?? 0} Rejected</span>
                <span className="text-slate-500">{stats?.soldProperties ?? 0} Sold</span>
              </div>
            </div>

            {/* 4. Total Inquiries */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-emerald-200 transition-all">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Buyer Inquiries</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">{stats?.totalInquiries ?? 0}</span>
                <span className="text-xs text-slate-500 font-medium">leads</span>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs">
                <span className="text-blue-600 font-medium">{stats?.newInquiries ?? 0} Unread / New</span>
                <span className="text-slate-400">Total volume</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Secondary Today Metrics Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-gradient-to-r from-[#0B2246] to-[#133160] rounded-2xl text-white shadow-sm flex items-center justify-between border border-[#1B417A]/40">
          <div>
            <p className="text-xs font-medium text-slate-300">Properties Added Today</p>
            <p className="text-2xl font-bold mt-0.5 text-white">{stats?.propertiesAddedToday ?? 0}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#F5820D]/20 flex items-center justify-center">
            <Home className="w-5 h-5 text-[#F5820D]" />
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-[#0B2246] to-[#133160] rounded-2xl text-white shadow-sm flex items-center justify-between border border-[#1B417A]/40">
          <div>
            <p className="text-xs font-medium text-slate-300">Users Registered Today</p>
            <p className="text-2xl font-bold mt-0.5 text-white">{stats?.usersRegisteredToday ?? 0}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#F5820D]/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-[#F5820D]" />
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-[#071731] to-[#0B2246] rounded-2xl text-white shadow-sm flex items-center justify-between border border-[#F5820D]/30">
          <div>
            <p className="text-xs font-medium text-slate-300">Pending Moderation Queue</p>
            <p className="text-2xl font-bold mt-0.5 text-[#F5820D]">{stats?.pendingProperties ?? 0}</p>
          </div>
          <Link
            href="/properties/pending"
            className="px-3 py-1.5 bg-[#F5820D] text-white text-xs font-semibold rounded-lg hover:bg-[#DC6F05] transition-colors shadow-sm"
          >
            Review Now
          </Link>
        </div>
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Properties By Type */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Listings by Property Type</h2>
              <p className="text-xs text-slate-500">Distribution across categories</p>
            </div>
            <span className="text-xs font-semibold text-[#0B2246] bg-[#EEF3FA] px-2.5 py-1 rounded-lg">
              {stats?.totalProperties || 0} Total
            </span>
          </div>

          <div className="h-64 w-full">
            {propertyReports?.byType && propertyReports.byType.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={propertyReports.byType}>
                  <XAxis dataKey="type" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }}
                  />
                  <Bar dataKey="count" fill="#0B2246" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No property data available
              </div>
            )}
          </div>
        </div>

        {/* Top Cities */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Listings by Top Cities</h2>
              <p className="text-xs text-slate-500">Geographic market distribution</p>
            </div>
          </div>

          <div className="h-64 w-full">
            {propertyReports?.byCity && propertyReports.byCity.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={propertyReports.byCity}
                    dataKey="count"
                    nameKey="city"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => `${entry.city} (${entry.count})`}
                  >
                    {propertyReports.byCity.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No city data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approvals Queue */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Pending Approvals Queue</h3>
                  <p className="text-xs text-slate-500">Requires admin review before publishing</p>
                </div>
              </div>
              <Link
                href="/properties/pending"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {recent?.pendingApprovals && recent.pendingApprovals.length > 0 ? (
                recent.pendingApprovals.map((prop) => (
                  <div key={prop.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900 truncate">{prop.title}</p>
                      <p className="text-xs text-slate-500">
                        {prop.city} • {formatCurrency(prop.price)} • Owner: {prop.owner.fullName}
                      </p>
                    </div>
                    <Link
                      href={`/properties/${prop.id}`}
                      className="px-3 py-1.5 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 text-slate-700 text-xs font-medium rounded-lg border border-slate-200 transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Review</span>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  No properties currently waiting for approval.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Inquiries */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Recent Inquiries</h3>
                  <p className="text-xs text-slate-500">Latest buyer messages on listings</p>
                </div>
              </div>
              <Link
                href="/inquiries"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {recent?.recentInquiries && recent.recentInquiries.length > 0 ? (
                recent.recentInquiries.map((inq) => (
                  <div key={inq.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900 truncate">{inq.name}</p>
                        <Badge status={inq.inquiryStatus} />
                      </div>
                      <p className="text-xs text-slate-500 truncate">
                        {inq.property
                          ? `On: ${inq.property.title} (${inq.property.city})`
                          : 'Contact Us — Website Inquiry'}
                      </p>
                    </div>
                    <span className="text-[11px] text-slate-400 flex-shrink-0">
                      {formatTimeAgo(inq.createdAt)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  No recent inquiries recorded.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent User Registrations & Audit Logs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent User Registrations */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Recent Users</h3>
            <Link
              href="/users"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Manage Users</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recent?.recentUsers && recent.recentUsers.length > 0 ? (
              recent.recentUsers.map((u) => (
                <div key={u.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{u.fullName}</p>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge status={u.role} />
                    <Badge status={u.accountStatus} />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">No users found</div>
            )}
          </div>
        </div>

        {/* Recent Admin Actions / Audit Trail */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Recent Admin Actions</h3>
            <Link
              href="/audit-logs"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Full Audit Logs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recent?.recentAuditLogs && recent.recentAuditLogs.length > 0 ? (
              recent.recentAuditLogs.map((log) => (
                <div key={log.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-800">
                      {log.actor?.fullName || 'System'} •{' '}
                      <span className="text-blue-600 font-mono text-[11px]">{log.action}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      Target: {log.entityType} ({log.entityId})
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-400 flex-shrink-0">
                    {formatTimeAgo(log.createdAt)}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">No recent audit logs</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

