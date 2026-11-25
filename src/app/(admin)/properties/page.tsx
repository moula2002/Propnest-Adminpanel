'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Building2,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Trash2,
  RefreshCw,
  Clock,
  Edit,
  ArrowUpDown,
  SlidersHorizontal,
  Plus,
} from 'lucide-react';
import { adminPropertyService, PropertyFilterParams } from '@/services/adminPropertyService';
import { Property, PropertyStatus, PropertyType, ListingType, PaginationMeta } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/tables/Pagination';
import { ConfirmationModal } from '@/components/dialogs/ConfirmationModal';
import { EditPropertyModal } from '@/components/dialogs/EditPropertyModal';
import { useToast } from '@/components/ui/ToastContext';

export default function PropertiesPage() {
  const { success, error } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<PropertyStatus | ''>('');
  const [selectedType, setSelectedType] = useState<PropertyType | ''>('');
  const [selectedListing, setSelectedListing] = useState<ListingType | ''>('');
  const [cityFilter, setCityFilter] = useState('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(true);

  // Edit Modal State
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  // Rejection Dialog State
  const [rejectModal, setRejectModal] = useState<{
    isOpen: boolean;
    property: Property | null;
    reason: string;
  }>({
    isOpen: false,
    property: null,
    reason: '',
  });

  // Action Confirmation State
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    property: Property | null;
    action: 'approve' | 'delete';
  }>({
    isOpen: false,
    property: null,
    action: 'approve',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchProperties = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: PropertyFilterParams = {
        page: pagination.page,
        limit: pagination.limit,
        search: search.trim() || undefined,
        status: selectedStatus || undefined,
        propertyType: selectedType || undefined,
        listingType: selectedListing || undefined,
        city: cityFilter.trim() || undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        sortBy,
        sortOrder,
      };

      const res = await adminPropertyService.getProperties(params);
      setProperties(res.data);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to load properties');
    } finally {
      setIsLoading(false);
    }
  }, [
    pagination.page,
    pagination.limit,
    search,
    selectedStatus,
    selectedType,
    selectedListing,
    cityFilter,
    minPrice,
    maxPrice,
    sortBy,
    sortOrder,
    error,
  ]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleApprove = async () => {
    if (!actionModal.property) return;
    setIsProcessing(true);
    try {
      await adminPropertyService.approveProperty(actionModal.property.id);
      success(`Property "${actionModal.property.title}" approved and published`);
      setActionModal({ isOpen: false, property: null, action: 'approve' });
      fetchProperties();
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to approve property');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!actionModal.property) return;
    setIsProcessing(true);
    try {
      await adminPropertyService.deleteProperty(actionModal.property.id);
      success(`Property "${actionModal.property.title}" removed`);
      setActionModal({ isOpen: false, property: null, action: 'delete' });
      fetchProperties();
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to delete property');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectModal.property) return;
    if (!rejectModal.reason.trim()) {
      error('Please provide a rejection reason');
      return;
    }
    setIsProcessing(true);
    try {
      await adminPropertyService.rejectProperty(rejectModal.property.id, rejectModal.reason);
      success(`Property "${rejectModal.property.title}" rejected with feedback`);
      setRejectModal({ isOpen: false, property: null, reason: '' });
      fetchProperties();
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to reject property');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInlineStatusChange = async (propertyId: string, newStatus: PropertyStatus) => {
    try {
      await adminPropertyService.updatePropertyStatus(propertyId, newStatus);
      success(`Property status updated to ${newStatus}`);
      fetchProperties();
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to update property status');
    }
  };

  const handleToggleSectionFlag = async (
    propertyId: string,
    field: 'isFeatured' | 'isLatest',
    nextValue: boolean
  ) => {
    try {
      await adminPropertyService.updateProperty(propertyId, { [field]: nextValue });
      const label = field === 'isFeatured' ? 'Featured Properties' : 'Latest Listings';
      success(`${nextValue ? 'Added to' : 'Removed from'} ${label}`);
      setProperties((prev) =>
        prev.map((p) => (p.id === propertyId ? { ...p, [field]: nextValue } : p))
      );
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to update homepage section placement');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Property Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor, inspect, edit, approve, and manage all property listings
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/properties/create"
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Property</span>
          </Link>
          <Link
            href="/properties/pending"
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors shadow-sm"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Approvals</span>
          </Link>
          <button
            onClick={() => fetchProperties()}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, city, locality, owner..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value as PropertyStatus | '');
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="APPROVED">Approved</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
              <option value="REJECTED">Rejected</option>
              <option value="DRAFT">Draft</option>
              <option value="SOLD">Sold</option>
              <option value="RENTED">Rented</option>
              <option value="ARCHIVED">Archived</option>
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value as PropertyType | '');
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="">All Types</option>
              <option value="APARTMENT">Apartment</option>
              <option value="VILLA">Villa</option>
              <option value="HOUSE">House</option>
              <option value="PLOT">Plot</option>
              <option value="COMMERCIAL">Commercial</option>
              <option value="OFFICE">Office</option>
              <option value="SHOP">Shop</option>
            </select>

            {/* Listing Filter */}
            <select
              value={selectedListing}
              onChange={(e) => {
                setSelectedListing(e.target.value as ListingType | '');
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="">Sale / Rent</option>
              <option value="SALE">Sale</option>
              <option value="RENT">Rent</option>
              <option value="LEASE">Lease</option>
            </select>

            {/* Sort Order */}
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
              <option value="price-desc">Price: High to Low</option>
              <option value="price-asc">Price: Low to High</option>
            </select>

            {/* Toggle Advanced Filters */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                showAdvancedFilters
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>More Filters</span>
            </button>
          </div>
        </div>

        {/* Collapsible Advanced Filters (City & Price Range) */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-150">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Filter by City</label>
              <input
                type="text"
                placeholder="e.g. Mumbai, Bangalore..."
                value={cityFilter}
                onChange={(e) => {
                  setCityFilter(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Min Price (₹)</label>
              <input
                type="number"
                placeholder="Min amount"
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Max Price (₹)</label>
              <input
                type="number"
                placeholder="Max amount"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
              />
            </div>
          </div>
        )}
      </div>

      {/* Property Table */}
      {isLoading ? (
        <TableSkeleton rows={6} columns={8} />
      ) : properties.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No properties found"
          description="Try adjusting your search criteria, property types, or listing status."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Property</th>
                  <th className="py-3.5 px-6">Owner</th>
                  <th className="py-3.5 px-6">Location</th>
                  <th className="py-3.5 px-6">Type</th>
                  <th className="py-3.5 px-6">Price</th>
                  <th className="py-3.5 px-6">Homepage</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Listed On</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {properties.map((prop) => (
                  <tr key={prop.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 max-w-xs">
                      <Link
                        href={`/properties/${prop.id}`}
                        className="font-semibold text-slate-900 hover:text-blue-600 transition-colors truncate block"
                      >
                        {prop.title}
                      </Link>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {prop.listingType} • {prop.bedrooms ? `${prop.bedrooms} BHK` : 'Commercial'}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {prop.owner?.fullName || '—'}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">{prop.owner?.email}</p>
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-600">
                      <p className="font-medium text-slate-800">{prop.city}</p>
                      <p className="text-[11px] text-slate-400 truncate">{prop.locality}</p>
                    </td>

                    <td className="py-4 px-6">
                      <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                        {prop.propertyType}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-xs font-bold text-slate-900 font-mono">
                      {formatCurrency(prop.price)}
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleSectionFlag(prop.id, 'isFeatured', !prop.isFeatured)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-colors text-left w-fit ${
                            prop.isFeatured
                              ? 'bg-orange-50 text-[#F5820D] border-orange-200'
                              : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-600'
                          }`}
                        >
                          {prop.isFeatured ? '★ Featured' : '☆ Feature'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleSectionFlag(prop.id, 'isLatest', !prop.isLatest)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-colors text-left w-fit ${
                            prop.isLatest
                              ? 'bg-blue-50 text-[#0B2246] border-blue-200'
                              : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-600'
                          }`}
                        >
                          {prop.isLatest ? '● Latest' : '○ Latest'}
                        </button>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <select
                        value={prop.status}
                        onChange={(e) => handleInlineStatusChange(prop.id, e.target.value as PropertyStatus)}
                        className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="APPROVED">Approved</option>
                        <option value="PENDING_APPROVAL">Pending</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="DRAFT">Draft</option>
                        <option value="SOLD">Sold</option>
                        <option value="RENTED">Rented</option>
                        <option value="ARCHIVED">Archived</option>
                      </select>
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-500">
                      {formatDate(prop.createdAt)}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Details */}
                        <Link
                          href={`/properties/${prop.id}`}
                          title="View Details"
                          className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </Link>

                        {/* Edit Property Button */}
                        <button
                          title="Edit Property"
                          onClick={() => setEditingProperty(prop)}
                          className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        {prop.status === 'PENDING_APPROVAL' && (
                          <>
                            <button
                              title="Approve Listing"
                              onClick={() => setActionModal({ isOpen: true, property: prop, action: 'approve' })}
                              className="p-1.5 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                            <button
                              title="Reject Listing"
                              onClick={() => setRejectModal({ isOpen: true, property: prop, reason: '' })}
                              className="p-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}

                        {/* Delete Listing Button */}
                        <button
                          title="Delete Listing"
                          onClick={() => setActionModal({ isOpen: true, property: prop, action: 'delete' })}
                          className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
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

      {/* Dynamic Edit Property Modal */}
      <EditPropertyModal
        isOpen={!!editingProperty}
        property={editingProperty}
        onClose={() => setEditingProperty(null)}
        onSuccess={() => {
          setEditingProperty(null);
          fetchProperties();
        }}
      />

      {/* Approve / Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={actionModal.isOpen}
        title={actionModal.action === 'approve' ? 'Approve Property Listing' : 'Delete Property Listing'}
        message={
          actionModal.action === 'approve'
            ? `Are you sure you want to approve "${actionModal.property?.title}"? It will become publicly visible immediately.`
            : `Are you sure you want to delete "${actionModal.property?.title}"? This listing will be archived.`
        }
        confirmLabel={actionModal.action === 'approve' ? 'Approve & Publish' : 'Delete'}
        variant={actionModal.action === 'approve' ? 'primary' : 'danger'}
        isLoading={isProcessing}
        onConfirm={actionModal.action === 'approve' ? handleApprove : handleDelete}
        onCancel={() => setActionModal({ isOpen: false, property: null, action: 'approve' })}
      />

      {/* Reject Reason Modal */}
      {rejectModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 p-6 animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Reject Listing</h3>
            <p className="text-xs text-slate-500 mb-4">
              Specify feedback or reasons for rejection. The property owner will be notified.
            </p>

            <textarea
              rows={4}
              value={rejectModal.reason}
              onChange={(e) => setRejectModal((prev) => ({ ...prev, reason: e.target.value }))}
              placeholder="e.g. Inaccurate location, duplicate images, or missing documents..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 mb-4"
            />

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setRejectModal({ isOpen: false, property: null, reason: '' })}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing || !rejectModal.reason.trim()}
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
