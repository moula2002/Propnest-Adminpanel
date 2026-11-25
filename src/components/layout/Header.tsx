'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Menu,
  Search,
  Bell,
  Shield,
  ChevronDown,
  User,
  LogOut,
  Settings,
  Building2,
  Users,
  Clock,
  ArrowRight,
  ExternalLink,
  X,
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { Breadcrumbs } from './Breadcrumbs';
import { adminPropertyService } from '@/services/adminPropertyService';
import { adminUserService } from '@/services/adminUserService';
import { dashboardService } from '@/services/dashboardService';
import { Property, AdminUser, DashboardStats } from '@/types';
import { getImageUrl } from '@/lib/utils';

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Global search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    properties: Property[];
    users: AdminUser[];
  }>({ properties: [], users: [] });
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Live notification / pending metrics
  const [metrics, setMetrics] = useState<DashboardStats | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        const res = await dashboardService.getStats();
        if (isMounted) {
          setMetrics(res.data);
        }
      } catch {
        // Silently keep default
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 60000); // refresh every minute
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Global search handler
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults({ properties: [], users: [] });
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const [propRes, userRes] = await Promise.all([
          adminPropertyService.getProperties({ search: searchQuery.trim(), limit: 4 }),
          adminUserService.getUsers({ search: searchQuery.trim(), limit: 4 }),
        ]);

        setSearchResults({
          properties: propRes.data || [],
          users: userRes.data || [],
        });
      } catch {
        // Handle gracefully
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const pendingApprovalsCount = metrics?.pendingProperties ?? 0;
  const totalInquiriesCount = metrics?.totalInquiries ?? 0;
  const totalNotifications = pendingApprovalsCount + (totalInquiriesCount > 0 ? 1 : 0);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left section: mobile hamburger & breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Dynamic Breadcrumbs */}
        <div className="hidden sm:block">
          <Breadcrumbs />
        </div>
      </div>

      {/* Middle section: Global Dynamic Search */}
      <div ref={searchRef} className="relative flex-1 max-w-md hidden md:block">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search properties, owners, users, cities..."
            value={searchQuery}
            onFocus={() => setIsSearchOpen(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F5820D]/20 focus:border-[#F5820D] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setIsSearchOpen(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Global Search Results Dropdown */}
        {isSearchOpen && searchQuery.trim().length >= 2 && (
          <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 max-h-96 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            {isSearching ? (
              <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                Searching platform database...
              </div>
            ) : searchResults.properties.length === 0 && searchResults.users.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No matching properties or users found for &ldquo;{searchQuery}&rdquo;
              </div>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {/* Properties Matches */}
                {searchResults.properties.length > 0 && (
                  <div className="py-2">
                    <p className="px-4 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Properties ({searchResults.properties.length})
                    </p>
                    {searchResults.properties.map((prop) => (
                      <Link
                        key={prop.id}
                        href={`/properties/${prop.id}`}
                        onClick={() => setIsSearchOpen(false)}
                        className="flex items-center justify-between px-4 py-2 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-3.5 h-3.5" />
                          </div>
                          <div className="truncate">
                            <p className="font-semibold text-slate-800 truncate">{prop.title}</p>
                            <p className="text-[11px] text-slate-400 truncate">
                              {prop.city} • ₹{Number(prop.price).toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded ml-2">
                          {prop.status}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Users Matches */}
                {searchResults.users.length > 0 && (
                  <div className="py-2">
                    <p className="px-4 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Users ({searchResults.users.length})
                    </p>
                    {searchResults.users.map((usr) => (
                      <Link
                        key={usr.id}
                        href={`/users/${usr.id}`}
                        onClick={() => setIsSearchOpen(false)}
                        className="flex items-center justify-between px-4 py-2 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {usr.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div className="truncate">
                            <p className="font-semibold text-slate-800 truncate">{usr.fullName}</p>
                            <p className="text-[11px] text-slate-400 truncate">{usr.email}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded ml-2">
                          {usr.role}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right section: Role badge, notifications, profile */}
      <div className="flex items-center gap-3">
        {/* Environment Status Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EEF3FA] border border-[#0B2246]/15 text-[#0B2246] text-xs font-semibold">
          <Shield className="w-3.5 h-3.5 text-[#F5820D]" />
          <span>Role: {user?.role || 'ADMIN'}</span>
        </div>

        {/* Dynamic Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="relative p-2 text-slate-500 hover:text-[#0B2246] rounded-xl hover:bg-slate-100 transition-colors"
            title="System Notifications & Alerts"
          >
            <Bell className="w-5 h-5" />
            {totalNotifications > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-[#F5820D] text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-sm">
                {totalNotifications}
              </span>
            )}
          </button>

          {isNotificationOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setIsNotificationOpen(false)} />
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-40 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">Notifications</h4>
                  <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full">
                    {totalNotifications} New
                  </span>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  {/* Pending Approvals Item */}
                  <Link
                    href="/properties/pending"
                    onClick={() => setIsNotificationOpen(false)}
                    className="flex items-start gap-3 p-3.5 hover:bg-slate-50 transition-colors block"
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800">
                        {pendingApprovalsCount} Properties Pending
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Awaiting administrator review and moderation approval
                      </p>
                    </div>
                  </Link>

                  {/* Active Inquiries Item */}
                  <Link
                    href="/inquiries"
                    onClick={() => setIsNotificationOpen(false)}
                    className="flex items-start gap-3 p-3.5 hover:bg-slate-50 transition-colors block"
                  >
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800">
                        {totalInquiriesCount} Total Buyer Inquiries
                      </p>
                      <p className="text-[11px] text-slate-500">
                        View buyer leads, schedules, and agent inquiries
                      </p>
                    </div>
                  </Link>
                </div>

                <div className="px-4 py-2 border-t border-slate-100 text-center">
                  <Link
                    href="/dashboard"
                    onClick={() => setIsNotificationOpen(false)}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1"
                  >
                    <span>View Dashboard Activity</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-[#0B2246] text-white font-semibold text-xs flex items-center justify-center uppercase shadow-sm overflow-hidden ring-2 ring-[#F5820D]/30">
              {user?.profileImage ? (
                <img
                  src={getImageUrl(user.profileImage)}
                  alt={user?.fullName || 'Admin'}
                  className="w-full h-full object-cover"
                />
              ) : (
                user?.fullName?.charAt(0) || 'A'
              )}
            </div>
            <div className="hidden sm:block text-left text-xs">
              <p className="font-semibold text-slate-800 leading-tight">{user?.fullName || 'Administrator'}</p>
              <p className="text-slate-400 font-medium">{user?.role}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </button>

          {isProfileOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setIsProfileOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{user?.fullName}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                </div>

                <Link
                  href="/settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Admin Profile</span>
                </Link>

                <Link
                  href="/settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Security & Settings</span>
                </Link>

                <div className="border-t border-slate-100 my-1" />

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
