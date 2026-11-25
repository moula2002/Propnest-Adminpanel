'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Building2, AlertCircle } from 'lucide-react';
import { Property, PropertyStatus, PropertyType, ListingType, FurnishingStatus } from '@/types';
import { adminPropertyService } from '@/services/adminPropertyService';
import { useToast } from '@/components/ui/ToastContext';

const propertySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().positive('Price must be greater than 0'),
  propertyType: z.string().trim().min(2, 'Category is required'),
  listingType: z.enum(['SALE', 'RENT', 'LEASE']),
  status: z.enum(['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'SOLD', 'RENTED', 'ARCHIVED']),
  city: z.string().min(2, 'City is required'),
  locality: z.string().min(2, 'Locality is required'),
  address: z.string().min(5, 'Full address is required'),
  bedrooms: z.coerce.number().int().min(0).optional().nullable(),
  bathrooms: z.coerce.number().int().min(0).optional().nullable(),
  carpetArea: z.coerce.number().positive().optional().nullable(),
  furnishingStatus: z.enum(['UNFURNISHED', 'SEMI_FURNISHED', 'FULLY_FURNISHED']).optional().nullable(),
  negotiable: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  isLatest: z.boolean().default(false),
});

type PropertyFormData = z.infer<typeof propertySchema>;

interface EditPropertyModalProps {
  isOpen: boolean;
  property: Property | null;
  onClose: () => void;
  onSuccess: (updated: Property) => void;
}

export const EditPropertyModal: React.FC<EditPropertyModalProps> = ({
  isOpen,
  property,
  onClose,
  onSuccess,
}) => {
  const { success, error } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
  });

  useEffect(() => {
    if (property) {
      reset({
        title: property.title,
        description: property.description,
        price: Number(property.price),
        propertyType: property.propertyType,
        listingType: property.listingType,
        status: property.status,
        city: property.city,
        locality: property.locality,
        address: property.address,
        bedrooms: property.bedrooms ?? null,
        bathrooms: property.bathrooms ?? null,
        carpetArea: property.carpetArea ? Number(property.carpetArea) : null,
        furnishingStatus: property.furnishingStatus ?? null,
        negotiable: property.negotiable ?? false,
        isFeatured: property.isFeatured ?? false,
        isLatest: property.isLatest ?? false,
      });
    }
  }, [property, reset]);

  if (!isOpen || !property) return null;

  const onSubmit = async (data: PropertyFormData) => {
    try {
      const res = await adminPropertyService.updateProperty(property.id, {
        title: data.title,
        description: data.description,
        price: data.price,
        propertyType: data.propertyType,
        listingType: data.listingType,
        status: data.status,
        city: data.city,
        locality: data.locality,
        address: data.address,
        bedrooms: data.bedrooms ?? undefined,
        bathrooms: data.bathrooms ?? undefined,
        carpetArea: data.carpetArea ?? undefined,
        furnishingStatus: data.furnishingStatus ?? undefined,
        negotiable: data.negotiable,
        isFeatured: data.isFeatured,
        isLatest: data.isLatest,
      });
      success(`Property "${data.title}" updated successfully`);
      onSuccess(res.data);
      onClose();
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to update property details');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in zoom-in-95">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Edit Property Details</h3>
              <p className="text-xs text-slate-500 font-mono">ID: {property.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto p-6 space-y-4 text-xs">
          {/* Title */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Property Title *</label>
            <input
              type="text"
              {...register('title')}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            {errors.title && <p className="text-rose-500 mt-1">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description *</label>
            <textarea
              rows={3}
              {...register('description')}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            {errors.description && <p className="text-rose-500 mt-1">{errors.description.message}</p>}
          </div>

          {/* Grid: Price, Status, Type, Listing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Price (₹) *</label>
              <input
                type="number"
                step="any"
                {...register('price')}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              {errors.price && <p className="text-rose-500 mt-1">{errors.price.message}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status *</label>
              <select
                {...register('status')}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="APPROVED">Approved (Public)</option>
                <option value="PENDING_APPROVAL">Pending Approval</option>
                <option value="REJECTED">Rejected</option>
                <option value="DRAFT">Draft</option>
                <option value="SOLD">Sold</option>
                <option value="RENTED">Rented</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Property Type *</label>
              <select
                {...register('propertyType')}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="APARTMENT">Apartment</option>
                <option value="HOUSE">House</option>
                <option value="VILLA">Villa</option>
                <option value="PLOT">Plot</option>
                <option value="COMMERCIAL">Commercial</option>
                <option value="OFFICE">Office</option>
                <option value="SHOP">Shop</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Listing Type *</label>
              <select
                {...register('listingType')}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="SALE">Sale</option>
                <option value="RENT">Rent</option>
                <option value="LEASE">Lease</option>
              </select>
            </div>
          </div>

          {/* Location fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">City *</label>
              <input
                type="text"
                {...register('city')}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              {errors.city && <p className="text-rose-500 mt-1">{errors.city.message}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Locality *</label>
              <input
                type="text"
                {...register('locality')}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              {errors.locality && <p className="text-rose-500 mt-1">{errors.locality.message}</p>}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Address *</label>
            <input
              type="text"
              {...register('address')}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            {errors.address && <p className="text-rose-500 mt-1">{errors.address.message}</p>}
          </div>

          {/* Specifications */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bedrooms</label>
              <input
                type="number"
                {...register('bedrooms')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bathrooms</label>
              <input
                type="number"
                {...register('bathrooms')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Carpet Area (sq.ft)</label>
              <input
                type="number"
                step="any"
                {...register('carpetArea')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Furnishing Status</label>
              <select
                {...register('furnishingStatus')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs"
              >
                <option value="">Not Specified</option>
                <option value="UNFURNISHED">Unfurnished</option>
                <option value="SEMI_FURNISHED">Semi Furnished</option>
                <option value="FULLY_FURNISHED">Fully Furnished</option>
              </select>
            </div>
          </div>

          {/* Negotiable Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="negotiable"
              {...register('negotiable')}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            <label htmlFor="negotiable" className="font-semibold text-slate-700 select-none cursor-pointer">
              Price is negotiable
            </label>
          </div>

          {/* Website Homepage Placement Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <label className="p-3 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 cursor-pointer flex items-center justify-between gap-3 transition-all">
              <div>
                <span className="text-xs font-bold text-[#0B2246] uppercase tracking-wide block">
                  Featured Properties
                </span>
                <span className="text-[11px] text-slate-500">Show in Featured section</span>
              </div>
              <input
                type="checkbox"
                {...register('isFeatured')}
                className="w-4 h-4 text-[#F5820D] rounded border-slate-300 focus:ring-[#F5820D]"
              />
            </label>

            <label className="p-3 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 cursor-pointer flex items-center justify-between gap-3 transition-all">
              <div>
                <span className="text-xs font-bold text-[#0B2246] uppercase tracking-wide block">
                  Latest Listings
                </span>
                <span className="text-[11px] text-slate-500">Show in Latest section</span>
              </div>
              <input
                type="checkbox"
                {...register('isLatest')}
                className="w-4 h-4 text-[#0B2246] rounded border-slate-300 focus:ring-[#0B2246]"
              />
            </label>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

