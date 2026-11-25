'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  TrendingUp,
  Building2,
  Users,
  MessageSquare,
  RefreshCw,
  PieChart as PieChartIcon,
  Table,
} from 'lucide-react';
import { adminReportService } from '@/services/adminReportService';
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
  AreaChart,
  Area,
} from 'recharts';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import { useToast } from '@/components/ui/ToastContext';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#64748B'];

export default function ReportsPage() {
  const { error } = useToast();
  const [userReports, setUserReports] = useState<any>(null);
  const [propertyReports, setPropertyReports] = useState<any>(null);
  const [inquiryReports, setInquiryReports] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const [u, p, i] = await Promise.all([
        adminReportService.getUserReports(),
        adminReportService.getPropertyReports(),
        adminReportService.getInquiryReports(),
      ]);

      setUserReports(u.data);
      setPropertyReports(p.data);
      setInquiryReports(i.data);
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to generate platform reports');
    } finally {
      setIsLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Calculate percentage helper
  const calculatePercent = (count: number, total: number) => {
    if (!total || total === 0) return '0%';
    return `${Math.round((count / total) * 100)}%`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reports & Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Aggregated database intelligence on user growth, property trends, and market volume
          </p>
        </div>
        <button
          onClick={fetchReports}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {isLoading ? (
        <TableSkeleton rows={8} columns={4} />
      ) : (
        <div className="space-y-8">
          {/* Top Growth Charts: User & Property Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Registration Growth */}
            <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">User Growth Trend</h3>
                    <p className="text-xs text-slate-500">Monthly new registrations</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                  {userReports?.total || 0} Total Users
                </span>
              </div>

              <div className="h-64 w-full">
                {userReports?.monthlyGrowth && userReports.monthlyGrowth.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={userReports.monthlyGrowth}>
                      <defs>
                        <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
                      <Area type="monotone" dataKey="count" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#userGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    No historical registration data
                  </div>
                )}
              </div>
            </div>

            {/* Property Listing Growth */}
            <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Property Listings Volume</h3>
                    <p className="text-xs text-slate-500">Monthly properties submitted</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                  {propertyReports?.total || 0} Properties
                </span>
              </div>

              <div className="h-64 w-full">
                {propertyReports?.monthlyGrowth && propertyReports.monthlyGrowth.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={propertyReports.monthlyGrowth}>
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
                      <Bar dataKey="count" fill="#10B981" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    No historical property data
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Breakdown Distributions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sale vs Rent */}
            <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Sale vs Rental Split</h3>
                <p className="text-xs text-slate-500 mb-4">Listing contract type breakdown</p>
              </div>

              <div className="h-48 w-full">
                {propertyReports?.byListingType && propertyReports.byListingType.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={propertyReports.byListingType}
                        dataKey="count"
                        nameKey="type"
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        label={(e) => `${e.type}: ${e.count}`}
                      >
                        {propertyReports.byListingType.map((_: any, idx: number) => (
                          <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">No data</div>
                )}
              </div>

              {/* Data Table */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <table className="w-full text-xs">
                  <tbody>
                    {propertyReports?.byListingType?.map((item: any, idx: number) => (
                      <tr key={idx} className="border-b border-slate-50 last:border-0">
                        <td className="py-1.5 flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                          <span className="font-medium text-slate-700">{item.type}</span>
                        </td>
                        <td className="py-1.5 font-bold text-slate-900 text-right">{item.count}</td>
                        <td className="py-1.5 text-slate-400 text-right pl-2 font-mono">
                          {calculatePercent(item.count, propertyReports?.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Approved vs Rejected vs Pending Status */}
            <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Property Status Split</h3>
                <p className="text-xs text-slate-500 mb-4">Moderation state distribution</p>
              </div>

              <div className="h-48 w-full">
                {propertyReports?.byStatus && propertyReports.byStatus.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={propertyReports.byStatus}
                        dataKey="count"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        label={(e) => `${e.status}: ${e.count}`}
                      >
                        {propertyReports.byStatus.map((_: any, idx: number) => (
                          <Cell key={`cell-${idx}`} fill={COLORS[(idx + 2) % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">No data</div>
                )}
              </div>

              {/* Data Table */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <table className="w-full text-xs">
                  <tbody>
                    {propertyReports?.byStatus?.map((item: any, idx: number) => (
                      <tr key={idx} className="border-b border-slate-50 last:border-0">
                        <td className="py-1.5 flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[(idx + 2) % COLORS.length] }} />
                          <span className="font-medium text-slate-700">{item.status}</span>
                        </td>
                        <td className="py-1.5 font-bold text-slate-900 text-right">{item.count}</td>
                        <td className="py-1.5 text-slate-400 text-right pl-2 font-mono">
                          {calculatePercent(item.count, propertyReports?.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* User Roles Split */}
            <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">User Roles Split</h3>
                <p className="text-xs text-slate-500 mb-4">Admins, Agents, and Regular Users</p>
              </div>

              <div className="h-48 w-full">
                {userReports?.byRole && userReports.byRole.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={userReports.byRole}
                        dataKey="count"
                        nameKey="role"
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        label={(e) => `${e.role}: ${e.count}`}
                      >
                        {userReports.byRole.map((_: any, idx: number) => (
                          <Cell key={`cell-${idx}`} fill={COLORS[(idx + 4) % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">No data</div>
                )}
              </div>

              {/* Data Table */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <table className="w-full text-xs">
                  <tbody>
                    {userReports?.byRole?.map((item: any, idx: number) => (
                      <tr key={idx} className="border-b border-slate-50 last:border-0">
                        <td className="py-1.5 flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[(idx + 4) % COLORS.length] }} />
                          <span className="font-medium text-slate-700">{item.role}</span>
                        </td>
                        <td className="py-1.5 font-bold text-slate-900 text-right">{item.count}</td>
                        <td className="py-1.5 text-slate-400 text-right pl-2 font-mono">
                          {calculatePercent(item.count, userReports?.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
