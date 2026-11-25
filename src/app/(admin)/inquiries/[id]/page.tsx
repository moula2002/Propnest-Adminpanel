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
  User,
  MessageSquare,
  ShieldAlert,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { adminInquiryService } from '@/services/adminInquiryService';
import { InquirySummary, InquiryStatus } from '@/types';
import { formatDate, formatDateTime, formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { useToast } from '@/components/ui/ToastContext';

export default function InquiryDetailPage() {
  const params = useParams();
  const inquiryId = params?.id as string;
  const router = useRouter();
  const { success, error } = useToast();

  const [inquiry, setInquiry] = useState<InquirySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInquiry = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminInquiryService.getInquiryById(inquiryId);
      setInquiry(res.data);
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to load inquiry');
    } finally {
      setIsLoading(false);
    }
  }, [inquiryId, error]);

  useEffect(() => {
    if (inquiryId) {
      fetchInquiry();
    }
  }, [inquiryId, fetchInquiry]);

  const handleStatusUpdate = async (status: InquiryStatus) => {
    if (!inquiry) return;
    try {
      await adminInquiryService.updateInquiryStatus(inquiry.id, status);
      success(`Status changed to ${status}`);
      fetchInquiry();
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to update status');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <LoadingSkeleton className="h-64 lg:col-span-2" />
          <LoadingSkeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className="p-12 bg-white rounded-3xl text-center border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800">Inquiry not found</h2>
        <Link
          href="/inquiries"
          className="inline-flex items-center gap-2 px-4 py-2 mt-4 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Inquiries</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inquiry Lead</h1>
              <Badge status={inquiry.inquiryStatus} />
            </div>
            <p className="text-xs text-slate-500 font-mono">ID: {inquiry.id}</p>
          </div>
        </div>

        {/* Status Transition Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Status:</span>
          <select
            value={inquiry.inquiryStatus}
            onChange={(e) => handleStatusUpdate(e.target.value as InquiryStatus)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
          >
            <option value="NEW">NEW</option>
            <option value="CONTACTED">CONTACTED</option>
            <option value="IN_PROGRESS">IN PROGRESS</option>
            <option value="CLOSED">CLOSED</option>
            <option value="SPAM">SPAM</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Message & Property Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Inquiry Message Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <span>Inquiry Message</span>
            </h3>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {inquiry.message}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Source: {inquiry.source || 'Website'}</span>
              <span>Submitted: {formatDateTime(inquiry.createdAt)}</span>
            </div>
          </div>

          {/* Target Property Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                <span>Inquired Property</span>
              </h3>
              {inquiry.property && (
                <Link
                  href={`/properties/${inquiry.property.id}`}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <span>View Full Listing</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              {inquiry.property ? (
                <>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{inquiry.property.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{inquiry.property.city}</p>
                  </div>
                  {inquiry.property.price && (
                    <p className="text-sm font-bold text-slate-900 font-mono">
                      {formatCurrency(inquiry.property.price)}
                    </p>
                  )}
                </>
              ) : (
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-[#F5820D] border border-orange-200 mb-1">
                    General Contact Us Inquiry
                  </span>
                  <p className="text-xs text-slate-500">Submitted via Website Contact Form</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Buyer & Owner Info */}
        <div className="space-y-6">
          {/* Buyer / Inquirer Information */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Buyer Contact</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center">
                {inquiry.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-sm text-slate-900">{inquiry.name}</p>
                <span className="text-[11px] text-slate-500">
                  {inquiry.buyer ? 'Registered User' : 'Guest Lead'}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-xs space-y-2">
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono">{inquiry.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{inquiry.email}</span>
              </div>
            </div>
          </div>

          {/* Property Owner Information */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Property Owner</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center">
                {inquiry.owner?.fullName?.charAt(0) || 'O'}
              </div>
              <div>
                <p className="font-bold text-sm text-slate-900">{inquiry.owner?.fullName || 'PropNest Admin Team'}</p>
                <p className="text-xs text-slate-500">{inquiry.owner?.email || 'General Contact Lead'}</p>
              </div>
            </div>

            {inquiry.owner?.phone && (
              <div className="pt-3 border-t border-slate-100 text-xs flex items-center gap-2 text-slate-600">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono">{inquiry.owner.phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

