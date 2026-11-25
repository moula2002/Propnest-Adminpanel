import React from 'react';
import { cn } from '@/lib/utils';
import { AccountStatus, PropertyStatus, Role, InquiryStatus } from '@/types';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  status?: AccountStatus | PropertyStatus | Role | InquiryStatus | string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant, status, className }) => {
  let resolvedVariant = variant || 'default';

  if (status) {
    switch (status) {
      // User / Account Status
      case 'ACTIVE':
      case 'APPROVED':
        resolvedVariant = 'success';
        break;
      case 'PENDING_APPROVAL':
      case 'IN_PROGRESS':
      case 'CONTACTED':
        resolvedVariant = 'warning';
        break;
      case 'REJECTED':
      case 'SUSPENDED':
      case 'DEACTIVATED':
      case 'SPAM':
        resolvedVariant = 'danger';
        break;
      case 'DRAFT':
      case 'NEW':
        resolvedVariant = 'info';
        break;
      case 'SOLD':
      case 'RENTED':
      case 'CLOSED':
      case 'ARCHIVED':
        resolvedVariant = 'neutral';
        break;
      case 'SUPER_ADMIN':
      case 'ADMIN':
        resolvedVariant = 'info';
        break;
      case 'AGENT':
        resolvedVariant = 'warning';
        break;
      case 'USER':
        resolvedVariant = 'neutral';
        break;
      default:
        resolvedVariant = 'default';
    }
  }

  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    neutral: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  const displayText = children || (typeof status === 'string' ? status.replace(/_/g, ' ') : '');

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border tracking-wide uppercase',
        variantStyles[resolvedVariant],
        className
      )}
    >
      {displayText}
    </span>
  );
};

