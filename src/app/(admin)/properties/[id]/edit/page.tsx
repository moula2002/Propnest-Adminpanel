'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  Building2,
  DollarSign,
  MapPin,
  Layers,
  Sparkles,
  Image as ImageIcon,
  Plus,
  Trash2,
  CheckCircle,
  ExternalLink,
  Save,
} from 'lucide-react';
import { adminPropertyService } from '@/services/adminPropertyService';
import { categoryService, AmenityItem, PropertyCategoryStat } from '@/services/categoryService';
import { Property, PropertyType, ListingType, PropertyStatus, FurnishingStatus, PossessionStatus } from '@/types';
import { useToast } from '@/components/ui/ToastContext';
import { ConfirmationModal } from '@/components/dialogs/ConfirmationModal';
import { GalleryUpload } from '@/components/ui/GalleryUpload';

const editPropertyFormSchema = z.object({
  title: z.string().trim().min(5, 'Title must be at least 5 characters').max(255),
  description: z.string().trim().min(20, 'Description must be at least 20 characters'),
  propertyType: z.string().trim().min(2, 'Category is required'),
  listingType: z.enum(['SALE', 'RENT', 'LEASE']),
  price: z.coerce.number().positive('Price must be greater than 0'),
  negotiable: z.boolean().default(false),
  bedrooms: z.coerce.number().int().min(0).default(0),
  bathrooms: z.coerce.number().int().min(0).default(0),
  balconies: z.coerce.number().int().min(0).default(0),
  carpetArea: z.coerce.number().positive('Carpet area is required'),
  builtUpArea: z.coerce.number().positive().optional().nullable(),
  furnishingStatus: z.enum(['UNFURNISHED', 'SEMI_FURNISHED', 'FULLY_FURNISHED']).default('UNFURNISHED'),
  possessionStatus: z.enum(['READY_TO_MOVE', 'UNDER_CONSTRUCTION']).default('READY_TO_MOVE'),
  parkingSpaces: z.coerce.number().int().min(0).default(0),
  propertyAge: z.string().optional().nullable(),
  facing: z.string().optional().nullable(),
  address: z.string().trim().min(5, 'Address is required'),
  locality: z.string().trim().min(2, 'Locality is required'),
  city: z.string().trim().min(2, 'City is required'),
  state: z.string().trim().min(2, 'State is required'),
  postalCode: z.string().trim().min(4, 'Valid postal code is required'),
  status: z.enum(['APPROVED', 'PENDING_APPROVAL', 'DRAFT', 'REJECTED', 'SOLD', 'RENTED', 'ARCHIVED']).default('APPROVED'),
  isFeatured: z.boolean().default(false),
  isLatest: z.boolean().default(true),
});

type EditPropertyFormData = z.infer<typeof editPropertyFormSchema>;

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params?.id as string;
  const { success, error } = useToast();

  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<PropertyCategoryStat[]>([]);
  const [availableAmenities, setAvailableAmenities] = useState<AmenityItem[]>([]);
  const [selectedAmenityIds, setSelectedAmenityIds] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditPropertyFormData>({
    resolver: zodResolver(editPropertyFormSchema),
  });

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [propRes, amenitiesRes, catRes] = await Promise.all([
          adminPropertyService.getPropertyById(propertyId),
          categoryService.getAmenities().catch(() => ({ data: [] })),
          categoryService.getCategoryStats().catch(() => ({ data: { categories: [], amenities: [] } })),
        ]);

        const propData = propRes.data;
        setProperty(propData);
        setAvailableAmenities(amenitiesRes.data || []);
        setCategories(catRes.data?.categories || []);

        // Pre-fill form
        reset({
          title: propData.title,
          description: propData.description,
          propertyType: propData.propertyType,
          listingType: propData.listingType,
          price: Number(propData.price),
          negotiable: propData.negotiable ?? false,
          bedrooms: propData.bedrooms ?? 0,
          bathrooms: propData.bathrooms ?? 0,
          balconies: propData.balconies ?? 0,
          carpetArea: Number(propData.carpetArea),
          builtUpArea: propData.builtUpArea ? Number(propData.builtUpArea) : null,
          furnishingStatus: propData.furnishingStatus || 'UNFURNISHED',
          possessionStatus: propData.possessionStatus || 'READY_TO_MOVE',
          parkingSpaces: propData.parkingSpaces ?? 0,
          propertyAge: propData.propertyAge || '',
          facing: propData.facing || '',
          address: propData.address,
          locality: propData.locality,
          city: propData.city,
          state: propData.state,
          postalCode: propData.postalCode,
          status: propData.status,
          isFeatured: propData.isFeatured ?? false,
          isLatest: propData.isLatest ?? false,
        });

        if (propData.images && propData.images.length > 0) {
          setImageUrls(propData.images.map((img) => img.imageUrl));
        }

        if (propData.amenities && propData.amenities.length > 0) {
          setSelectedAmenityIds(propData.amenities.map((a: any) => a.amenityId || a.id));
        }
      } catch (err: any) {
        error(err?.response?.data?.message || 'Failed to load property details');
      } finally {
        setIsLoading(false);
      }
    }

    if (propertyId) {
      loadData();
    }
  }, [propertyId, reset, error]);

  const handleToggleAmenity = (id: string) => {
    setSelectedAmenityIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const onSubmit = async (data: EditPropertyFormData) => {
    try {
      await adminPropertyService.updateProperty(propertyId, {
        ...data,
        images: imageUrls.map((url, i) => ({
          imageUrl: url,
          isPrimary: i === 0,
          displayOrder: i,
        })) as any,
        amenities: selectedAmenityIds as any,
      });

      success(`Property "${data.title}" updated successfully!`);
      router.push('/properties');
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to update property');
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await adminPropertyService.deleteProperty(propertyId);
      success('Property successfully deleted and archived');
      router.push('/properties');
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to delete property');
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto py-12 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Loading Property Details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/properties"
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Edit Property</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Modify listing details, specifications, pricing, and photo gallery
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {property?.slug && (
            <a
              href={`http://localhost:3000/properties/${property.slug}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
            >
              <span>View on Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 transition-colors shadow-sm"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Listing</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Section 1: Basic Information */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Basic Information</h2>
              <p className="text-[11px] text-slate-400">Title, category classification, and overview</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Property Title *</label>
              <input
                type="text"
                {...register('title')}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              {errors.title && <p className="text-rose-500 text-[11px] mt-1">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Property Type (Category) *</label>
                <select
                  {...register('propertyType')}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#F5820D]/20 focus:border-[#F5820D]"
                >
                  {categories.map((cat) => (
                    <option key={cat.type} value={cat.type}>
                      {cat.name}
                    </option>
                  ))}
                  {property?.propertyType && !categories.some((c) => c.type === property.propertyType) && (
                    <option value={property.propertyType}>{property.propertyType}</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Listing Type *</label>
                <select
                  {...register('listingType')}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="SALE">For Sale</option>
                  <option value="RENT">For Rent</option>
                  <option value="LEASE">For Lease</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description *</label>
              <textarea
                rows={4}
                {...register('description')}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              {errors.description && <p className="text-rose-500 text-[11px] mt-1">{errors.description.message}</p>}
            </div>
          </div>
        </div>

        {/* Section 2: Pricing */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Pricing Details</h2>
              <p className="text-[11px] text-slate-400">Total expected price and negotiation policy</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Price (₹ INR) *</label>
              <input
                type="number"
                {...register('price')}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              {errors.price && <p className="text-rose-500 text-[11px] mt-1">{errors.price.message}</p>}
            </div>

            <div className="pt-5">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('negotiable')}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span className="text-xs font-semibold text-slate-700">Price is Negotiable</span>
              </label>
            </div>
          </div>
        </div>

        {/* Section 3: Specifications */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Property Specifications</h2>
              <p className="text-[11px] text-slate-400">Bedrooms, bathrooms, carpet area, and furnishing</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bedrooms</label>
              <input
                type="number"
                {...register('bedrooms')}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bathrooms</label>
              <input
                type="number"
                {...register('bathrooms')}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Balconies</label>
              <input
                type="number"
                {...register('balconies')}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Carpet Area (sqft) *</label>
              <input
                type="number"
                {...register('carpetArea')}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Furnishing Status</label>
              <select
                {...register('furnishingStatus')}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              >
                <option value="UNFURNISHED">Unfurnished</option>
                <option value="SEMI_FURNISHED">Semi Furnished</option>
                <option value="FULLY_FURNISHED">Fully Furnished</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Possession Status</label>
              <select
                {...register('possessionStatus')}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              >
                <option value="READY_TO_MOVE">Ready to Move</option>
                <option value="UNDER_CONSTRUCTION">Under Construction</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Parking Spaces</label>
              <input
                type="number"
                {...register('parkingSpaces')}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Location */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Location Details</h2>
              <p className="text-[11px] text-slate-400">Street address, locality, city, and state</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Street Address *</label>
              <input
                type="text"
                {...register('address')}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Locality *</label>
                <input
                  type="text"
                  {...register('locality')}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
                <input
                  type="text"
                  {...register('city')}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">State *</label>
                <input
                  type="text"
                  {...register('state')}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Postal Code *</label>
                <input
                  type="text"
                  {...register('postalCode')}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Gallery Images */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Property Gallery Images</h2>
              <p className="text-[11px] text-slate-400">
                Upload local photos directly from your device. First photo is used as the cover listing image.
              </p>
            </div>
          </div>

          <GalleryUpload
            value={imageUrls}
            onChange={setImageUrls}
            maxPhotos={20}
            maxSizeMB={10}
          />
        </div>

        {/* Section 6: Status & Submission */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 cursor-pointer flex items-center justify-between gap-4 transition-all">
              <div>
                <span className="text-xs font-bold text-[#0B2246] uppercase tracking-wide block">
                  FEATURED PROPERTIES
                </span>
                <span className="text-[11px] text-slate-500">
                  Show in Featured Properties section on the website
                </span>
              </div>
              <div className="relative inline-flex items-center shrink-0">
                <input
                  type="checkbox"
                  {...register('isFeatured')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F5820D]" />
              </div>
            </label>

            <label className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 cursor-pointer flex items-center justify-between gap-4 transition-all">
              <div>
                <span className="text-xs font-bold text-[#0B2246] uppercase tracking-wide block">
                  Latest Listings
                </span>
                <span className="text-[11px] text-slate-500">
                  Show in Latest Listings section on the website
                </span>
              </div>
              <div className="relative inline-flex items-center shrink-0">
                <input
                  type="checkbox"
                  {...register('isLatest')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0B2246]" />
              </div>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Publication Status</label>
            <select
              {...register('status')}
              className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none"
            >
              <option value="APPROVED">Approved (Visible on Website)</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
              <option value="DRAFT">Draft</option>
              <option value="REJECTED">Rejected</option>
              <option value="SOLD">Sold</option>
              <option value="RENTED">Rented</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/properties"
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-xs font-semibold text-white bg-[#F5820D] hover:bg-[#DC6F05] rounded-xl transition-colors shadow-sm shadow-[#F5820D]/20 flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving Changes...' : 'Save Changes'}</span>
            </button>
          </div>
          </div>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete Property Listing"
        message={`Are you sure you want to delete "${property?.title}"? This property listing will be permanently archived and removed from the website.`}
        confirmLabel="Delete Property"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
}

