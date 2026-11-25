'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumbs: React.FC = () => {
  const pathname = usePathname();
  const segments = (pathname || '').split('/').filter(Boolean);

  const getBreadcrumbName = (segment: string) => {
    switch (segment) {
      case 'dashboard':
        return 'Dashboard';
      case 'users':
        return 'Users';
      case 'properties':
        return 'Properties';
      case 'pending':
        return 'Pending Approvals';
      case 'inquiries':
        return 'Inquiries';
      case 'reports':
        return 'Reports & Analytics';
      case 'audit-logs':
        return 'Audit Logs';
      case 'settings':
        return 'Settings';
      default:
        // UUID or ID check
        if (segment.length > 20) {
          return 'Details';
        }
        return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    }
  };

  return (
    <nav className="flex items-center text-xs font-medium text-slate-500 gap-1.5">
      <Link href="/dashboard" className="text-slate-400 hover:text-blue-600 transition-colors flex items-center">
        <Home className="w-3.5 h-3.5" />
      </Link>

      {segments.map((seg, idx) => {
        const href = `/${segments.slice(0, idx + 1).join('/')}`;
        const isLast = idx === segments.length - 1;
        const name = getBreadcrumbName(seg);

        return (
          <React.Fragment key={href}>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            {isLast ? (
              <span className="text-slate-900 font-semibold">{name}</span>
            ) : (
              <Link href={href} className="hover:text-blue-600 transition-colors">
                {name}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

