'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Building2,
  Clock,
  MessageSquare,
  BarChart3,
  ShieldCheck,
  Settings,
  LogOut,
  Building,
  Layers,
  PlusCircle,
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { getImageUrl } from '@/lib/utils';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Properties', href: '/properties', icon: Building2 },
    { name: 'Add Property', href: '/properties/create', icon: PlusCircle },
    { name: 'Categories', href: '/categories', icon: Layers },
    { name: 'Pending Approvals', href: '/properties/pending', icon: Clock },
    { name: 'Inquiries', href: '/inquiries', icon: MessageSquare },
    { name: 'Reports & Analytics', href: '/reports', icon: BarChart3 },
    { name: 'Audit Logs', href: '/audit-logs', icon: ShieldCheck },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleLinkClick = () => {
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden animate-in fade-in"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0B2246] text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 border-r border-[#163566] ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / PropNest Logo */}
        <div className="h-16 flex items-center px-4 border-b border-[#163566] gap-3 bg-[#081A36]">
          <div className="bg-white rounded-xl px-2.5 py-1 shadow-md flex items-center justify-center shrink-0">
            <img
              src="/images/propnest-logo.png"
              alt="PropNest"
              className="h-8 w-auto object-contain"
            />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-sm tracking-tight text-white leading-tight truncate">
              PropNest <span className="text-[#F5820D]">Admin</span>
            </h1>
            <p className="text-[10px] text-slate-300 font-medium truncate">Enterprise Management</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const currentPath = pathname || '';
            const isActive =
              item.href === '/properties'
                ? currentPath === '/properties' || (currentPath.startsWith('/properties/') && !currentPath.startsWith('/properties/pending'))
                : currentPath === item.href || (item.href !== '/dashboard' && currentPath.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-[#F5820D] text-white shadow-md shadow-[#F5820D]/30 font-semibold'
                    : 'text-slate-300 hover:bg-[#133160] hover:text-white'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-300 group-hover:text-[#F5820D]'
                  }`}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout in Footer */}
        <div className="p-4 border-t border-[#163566] bg-[#081A36]/60">
          <div className="flex items-center gap-3 px-2 py-2 mb-2 rounded-xl bg-[#102B54]/80 border border-[#1C3F75]">
            <div className="w-8 h-8 rounded-full bg-[#F5820D]/20 border border-[#F5820D]/40 text-[#FF9D3B] flex items-center justify-center font-bold text-xs uppercase overflow-hidden">
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
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.fullName || 'Admin'}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

