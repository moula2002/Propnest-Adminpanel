'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  Building,
  User,
  Calendar,
  DollarSign,
  Bed,
  Bath,
  Maximize,
  Shield,
  CheckCircle,
  XCircle,
  Trash2,
  Clock,
  Sparkles,
  Edit,
} from 'lucide-react';
import { adminPropertyService } from '@/services/adminPropertyService';
import { Property, PropertyStatus } from '@/types';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { ConfirmationModal } from '@/components/dialogs/ConfirmationModal';
import { EditPropertyModal } from '@/components/dialogs/EditPropertyModal';
import { useToast } from '@/components/ui/ToastContext';

export default function PropertyDetailPage() {
  const params = useParams();
  const propertyId = params?.id as string;
  const router = useRouter();
  const { success, error } = useToast();

  const [property, setProperty] = useState<Property | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Status Action Modal
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    action: 'approve' | 'delete';
  }>({ isOpen: false, action: 'approve' });

  // Reject Modal
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);

  const fetchProperty = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminPropertyService.getPropertyById(propertyId);
      setProperty(res.data);
      if (res.data.images && res.data.images.length > 0) {
        setSelectedImage(res.data.images[0].imageUrl);
      }
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to load property details');
    } finally {
      setIsLoading(false);
    }
  }, [propertyId, error]);

  useEffect(() => {
    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId, fetchProperty]);

  const handleApprove = async () => {
    if (!property) return;
    setIsProcessing(true);
    try {
      await adminPropertyService.approveProperty(property.id);
      success('Property approved and published successfully');
      setActionModal({ isOpen: false, action: 'approve' });
      fetchProperty();
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to approve property');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!property) return;
    if (!rejectReason.trim()) {
      error('Please specify a rejection reason');
      return;
    }
    setIsProcessing(true);
    try {
      await adminPropertyService.rejectProperty(property.id, rejectReason);
      success('Property rejected with feedback');
      setRejectModal(false);
      fetchProperty();
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to reject property');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStatusChange = async (newStatus: PropertyStatus) => {
    if (!property) return;
    try {
      await adminPropertyService.updatePropertyStatus(property.id, newStatus);
      success(`Property status updated to ${newStatus}`);
      fetchProperty();
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to update property status');
    }
  };

  const handleDelete = async () => {
    if (!property) return;
    setIsProcessing(true);
    try {
      await adminPropertyService.deleteProperty(property.id);
      success('Property archived successfully');
      router.push('/properties');
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to delete property');
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <LoadingSkeleton className="h-96 lg:col-span-2" />
          <LoadingSkeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="p-12 bg-white rounded-3xl text-center border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800">Property not found</h2>
        <Link
          href="/properties"
          className="inline-flex items-center gap-2 px-4 py-2 mt-4 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Properties</span>
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
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{property.title}</h1>
              <Badge status={property.status} />
            </div>
            <p className="text-xs text-slate-500 font-mono">ID: {property.id}</p>
          </div>
        </div>

        {/* Action Buttons & Status Selector */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Status Selector */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2 py-1 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 pl-1">Status:</span>
            <select
              value={property.status}
              onChange={(e) => handleStatusChange(e.target.value as PropertyStatus)}
              className="text-xs font-semibold bg-transparent border-0 text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="APPROVED">Approved</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
              <option value="REJECTED">Rejected</option>
              <option value="DRAFT">Draft</option>
              <option value="SOLD">Sold</option>
              <option value="RENTED">Rented</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          {/* Edit Property Button */}
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit Property</span>
          </button>

          {property.status === 'PENDING_APPROVAL' && (
            <>
              <button
                onClick={() => setRejectModal(true)}
                className="px-3.5 py-2 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 transition-colors flex items-center gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>
              <button
                onClick={() => setActionModal({ isOpen: true, action: 'approve' })}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Approve</span>
              </button>
            </>
          )}

          <button
            onClick={() => setActionModal({ isOpen: true, action: 'delete' })}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-200 transition-colors"
            title="Delete Property"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Image Gallery & Description */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Showcase */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
            {selectedImage ? (
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 relative mb-4">
                <img
                  src={selectedImage}
                  alt={property.title}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="aspect-video w-full rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                <Building className="w-12 h-12" />
              </div>
            )}

            {/* Thumbnail Navigation */}
            {property.images && property.images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-2">
                {property.images.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(img.imageUrl)}
                    className={`w-20 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                      selectedImage === img.imageUrl
                        ? 'border-blue-600 ring-2 ring-blue-500/20'
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.imageUrl} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Property Description & Key Info */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Description</h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Attributes Grid */}
            <div className="pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl">
                <p className="text-slate-400 font-medium">Bedrooms</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {property.bedrooms ? `${property.bedrooms} BHK` : 'N/A'}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl">
                <p className="text-slate-400 font-medium">Bathrooms</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {property.bathrooms ? `${property.bathrooms} Baths` : 'N/A'}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl">
                <p className="text-slate-400 font-medium">Carpet Area</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {property.carpetArea ? `${property.carpetArea} sq.ft` : 'N/A'}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl">
                <p className="text-slate-400 font-medium">Furnishing</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {property.furnishingStatus ? property.furnishingStatus.replace('_', ' ') : 'Unspecified'}
                </p>
              </div>
            </div>

            {/* Address Details */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>Full Address</span>
              </h4>
              <p className="text-xs text-slate-600">
                {property.address}, {property.locality}, {property.city}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing, Owner info, Moderation Details */}
        <div className="space-y-6">
          {/* Price & Listing Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Pricing & Contract</h3>
            <div>
              <p className="text-xs text-slate-400">Listing Price</p>
              <p className="text-3xl font-extrabold text-blue-600 tracking-tight mt-1">
                {formatCurrency(property.price)}
              </p>
              {property.negotiable && (
                <span className="inline-block mt-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  Price Negotiable
                </span>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Property Type</span>
                <span className="font-semibold text-slate-800">{property.propertyType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Listing Type</span>
                <span className="font-semibold text-slate-800">{property.listingType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date Listed</span>
                <span className="font-semibold text-slate-800">{formatDate(property.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Owner Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Owner Information</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center">
                {property.owner?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">
                  {property.owner?.fullName}
                </p>
                <p className="text-xs text-slate-500 truncate">{property.owner?.email}</p>
                {property.owner?.phone && (
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{property.owner.phone}</p>
                )}
              </div>
            </div>

            {property.owner && (
              <div className="pt-4 border-t border-slate-100">
                <Link
                  href={`/users/${property.owner.id}`}
                  className="w-full text-center block py-2 text-xs font-semibold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                >
                  View Owner Profile
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Property Modal */}
      <EditPropertyModal
        isOpen={isEditModalOpen}
        property={property}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={(updated) => {
          setProperty(updated);
          setIsEditModalOpen(false);
        }}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={actionModal.isOpen}
        title={actionModal.action === 'approve' ? 'Approve Property' : 'Delete Property'}
        message={
          actionModal.action === 'approve'
            ? `Publish "${property.title}" immediately to the public portal?`
            : `Are you sure you want to delete and archive "${property.title}"?`
        }
        confirmLabel={actionModal.action === 'approve' ? 'Approve & Publish' : 'Delete'}
        variant={actionModal.action === 'approve' ? 'primary' : 'danger'}
        isLoading={isProcessing}
        onConfirm={actionModal.action === 'approve' ? handleApprove : handleDelete}
        onCancel={() => setActionModal({ isOpen: false, action: 'approve' })}
      />

      {/* Rejection Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 p-6 animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Reject Listing</h3>
            <p className="text-xs text-slate-500 mb-4">
              Specify reason for rejection to send to the owner.
            </p>

            <textarea
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Inaccurate location, duplicate photos..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 mb-4"
            />

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setRejectModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing || !rejectReason.trim()}
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
