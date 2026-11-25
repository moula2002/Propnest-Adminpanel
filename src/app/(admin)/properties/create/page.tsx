'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  X,
  FolderPlus,
} from 'lucide-react';
import { adminPropertyService } from '@/services/adminPropertyService';
import { categoryService, AmenityItem, PropertyCategoryStat } from '@/services/categoryService';
import { PropertyType, ListingType, PropertyStatus, FurnishingStatus, PossessionStatus } from '@/types';
import { useToast } from '@/components/ui/ToastContext';
import { GalleryUpload } from '@/components/ui/GalleryUpload';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { getImageUrl } from '@/lib/utils';

const createPropertyFormSchema = z.object({
  title: z.string().trim().min(5, 'Title must be at least 5 characters').max(255),
  description: z.string().trim().min(20, 'Description must be at least 20 characters'),
  propertyType: z.string().trim().min(2, 'Please select or add a property category'),
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
  status: z.enum(['APPROVED', 'PENDING_APPROVAL', 'DRAFT']).default('APPROVED'),
  isFeatured: z.boolean().default(false),
  isLatest: z.boolean().default(true),
});

type CreatePropertyFormData = z.infer<typeof createPropertyFormSchema>;

export default function AddPropertyPage() {
  const router = useRouter();
  const { success, error } = useToast();

  const [categories, setCategories] = useState<PropertyCategoryStat[]>([]);
  const [availableAmenities, setAvailableAmenities] = useState<AmenityItem[]>([]);
  const [selectedAmenityIds, setSelectedAmenityIds] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick-add Category Modal state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatImage, setNewCatImage] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreatePropertyFormData>({
    resolver: zodResolver(createPropertyFormSchema),
    defaultValues: {
      propertyType: '',
      listingType: 'SALE',
      status: 'APPROVED',
      isFeatured: false,
      isLatest: false,
      furnishingStatus: 'SEMI_FURNISHED',
      possessionStatus: 'READY_TO_MOVE',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      postalCode: '400001',
      negotiable: true,
      bedrooms: 3,
      bathrooms: 2,
      carpetArea: 1450,
      parkingSpaces: 1,
    } as any,
  });

  const selectedCategoryType = watch('propertyType');

  // Load dynamic categories & amenities from database
  const loadCategoriesAndAmenities = async () => {
    try {
      const [catRes, amenRes] = await Promise.all([
        categoryService.getCategoryStats().catch(() => ({ data: { categories: [], amenities: [] } })),
        categoryService.getAmenities().catch(() => ({ data: [] })),
      ]);
      const loadedCats = catRes.data?.categories || [];
      setCategories(loadedCats);
      setAvailableAmenities(amenRes.data || []);

      if (loadedCats.length > 0 && !watch('propertyType')) {
        setValue('propertyType', loadedCats[0].type, { shouldValidate: true });
      }
    } catch {
      // Ignore quietly
    }
  };

  useEffect(() => {
    loadCategoriesAndAmenities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleQuickCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      error('Category name is required');
      return;
    }
    setIsSavingCategory(true);
    try {
      const res = await categoryService.createCategory({
        name: newCatName.trim(),
        imageUrl: newCatImage.trim() || undefined,
        description: newCatDesc.trim() || undefined,
      });
      success(`Category "${newCatName.trim()}" created!`);
      setIsCategoryModalOpen(false);
      setNewCatName('');
      setNewCatImage('');
      setNewCatDesc('');
      await loadCategoriesAndAmenities();
      if (res.data?.type) {
        setValue('propertyType', res.data.type, { shouldValidate: true });
      }
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to create category');
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleToggleAmenity = (id: string) => {
    setSelectedAmenityIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const onSubmit = async (data: CreatePropertyFormData) => {
    if (imageUrls.length === 0) {
      error('Please add at least 1 image for the property listing');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        amenityIds: selectedAmenityIds,
        images: imageUrls,
      };

      const res = await adminPropertyService.createProperty(payload);
      success(`Property "${data.title}" successfully created and published!`);
      router.push(`/properties/${res.data.id}`);
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to create property');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/properties"
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Add New Property</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Create and publish a verified property listing directly to the public website
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Section 1: Basic Information */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
              1
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Basic Listing Details</h2>
              <p className="text-[11px] text-slate-400">Core identity, category, and marketing overview</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Property Title *</label>
            <input
              type="text"
              placeholder="e.g. Luxury 3 BHK Sea View Apartment in Bandra West"
              {...register('title')}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description *</label>
            <textarea
              rows={4}
              placeholder="Provide a compelling description of the property, architecture, proximity to landmarks, and unique selling points..."
              {...register('description')}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            {errors.description && <p className="text-xs text-rose-500 mt-1">{errors.description.message}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-700">
                Property Category *
              </label>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-[#F5820D] bg-[#FFF4E8] hover:bg-[#F5820D] hover:text-white border border-[#F5820D]/30 rounded-lg transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Add Category</span>
              </button>
            </div>

            {categories.length === 0 ? (
              <div className="p-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-slate-600">
                  <Layers className="w-4 h-4 text-[#F5820D] shrink-0" />
                  <span className="text-xs">
                    No categories created yet. Add a category (e.g. Apartment, Villa, Farmhouse) to assign this property.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="px-3.5 py-2 bg-[#F5820D] hover:bg-[#DC6F05] text-white text-xs font-semibold rounded-xl transition-colors shrink-0 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Category</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {categories.map((cat) => {
                  const isSelected = selectedCategoryType === cat.type;
                  return (
                    <button
                      type="button"
                      key={cat.type}
                      onClick={() => setValue('propertyType', cat.type, { shouldValidate: true })}
                      className={`group relative rounded-2xl border text-left overflow-hidden transition-all ${
                        isSelected
                          ? 'border-[#F5820D] ring-2 ring-[#F5820D]/25 bg-[#FFF4E8]/40'
                          : 'border-slate-200 hover:border-[#0B2246]/40 bg-white'
                      }`}
                    >
                      <div className="h-20 w-full bg-[#0B2246] relative overflow-hidden flex items-center justify-center">
                        {cat.imageUrl ? (
                          <img
                            src={getImageUrl(cat.imageUrl)}
                            alt={cat.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <Layers className="w-6 h-6 text-slate-400 opacity-50" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        {isSelected && (
                          <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#F5820D] text-white flex items-center justify-center shadow-sm">
                            <CheckCircle className="w-3.5 h-3.5" />
                          </span>
                        )}
                        <span className="absolute bottom-1.5 left-2.5 right-2 text-xs font-bold text-white truncate">
                          {cat.name}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            <input type="hidden" {...register('propertyType')} />
            {errors.propertyType && (
              <p className="text-xs text-rose-500 mt-1.5">{errors.propertyType.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Listing Type *</label>
            <select
              {...register('listingType')}
              className="w-full sm:w-1/2 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#F5820D]/20 focus:border-[#F5820D]"
            >
              <option value="SALE">For Sale</option>
              <option value="RENT">For Rent</option>
              <option value="LEASE">For Lease</option>
            </select>
          </div>
        </div>

        {/* Section 2: Pricing & Specifications */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
              2
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Pricing & Layout Specifications</h2>
              <p className="text-[11px] text-slate-400">Dimensions, layout, and valuation</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Price (₹) *</label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 25000000"
                {...register('price')}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              {errors.price && <p className="text-xs text-rose-500 mt-1">{errors.price.message}</p>}
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  {...register('negotiable')}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <span className="text-xs font-semibold text-slate-700">Price is negotiable</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bedrooms</label>
              <input
                type="number"
                {...register('bedrooms')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bathrooms</label>
              <input
                type="number"
                {...register('bathrooms')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Balconies</label>
              <input
                type="number"
                {...register('balconies')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Parking Spaces</label>
              <input
                type="number"
                {...register('parkingSpaces')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Carpet Area (sq.ft) *</label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 1200"
                {...register('carpetArea')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
              />
              {errors.carpetArea && <p className="text-xs text-rose-500 mt-1">{errors.carpetArea.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Furnishing Status</label>
              <select
                {...register('furnishingStatus')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
              >
                <option value="UNFURNISHED">Unfurnished</option>
                <option value="SEMI_FURNISHED">Semi-Furnished</option>
                <option value="FULLY_FURNISHED">Fully Furnished</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Possession Status</label>
              <select
                {...register('possessionStatus')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
              >
                <option value="READY_TO_MOVE">Ready to Move</option>
                <option value="UNDER_CONSTRUCTION">Under Construction</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Location */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
              3
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Location & Geographic Details</h2>
              <p className="text-[11px] text-slate-400">Where this property is situated</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address *</label>
            <input
              type="text"
              placeholder="e.g. 402 Ocean Heights, Turner Road"
              {...register('address')}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            {errors.address && <p className="text-xs text-rose-500 mt-1">{errors.address.message}</p>}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Locality *</label>
              <input
                type="text"
                placeholder="e.g. Bandra West"
                {...register('locality')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
              {errors.locality && <p className="text-xs text-rose-500 mt-1">{errors.locality.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
              <input
                type="text"
                placeholder="e.g. Mumbai"
                {...register('city')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
              {errors.city && <p className="text-xs text-rose-500 mt-1">{errors.city.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">State *</label>
              <input
                type="text"
                placeholder="e.g. Maharashtra"
                {...register('state')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
              {errors.state && <p className="text-xs text-rose-500 mt-1">{errors.state.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Postal Code *</label>
              <input
                type="text"
                placeholder="e.g. 400050"
                {...register('postalCode')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
              {errors.postalCode && <p className="text-xs text-rose-500 mt-1">{errors.postalCode.message}</p>}
            </div>
          </div>
        </div>

        {/* Section 4: Amenities & Lifestyle Features */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs">
              4
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Amenities & Features</h2>
              <p className="text-[11px] text-slate-400">Select all amenities available at this property</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {availableAmenities.map((amenity) => {
              const isChecked = selectedAmenityIds.includes(amenity.id);
              return (
                <button
                  type="button"
                  key={amenity.id}
                  onClick={() => handleToggleAmenity(amenity.id)}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
                    isChecked
                      ? 'border-blue-600 bg-blue-50/80 text-blue-900 ring-2 ring-blue-500/20'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center flex-shrink-0 ${
                      isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'
                    }`}
                  >
                    {isChecked && <CheckCircle className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-xs font-semibold truncate">{amenity.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 5: Gallery Images */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
              5
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Property Image Gallery</h2>
              <p className="text-[11px] text-slate-400">
                Upload local photos directly from your device. First photo becomes the primary listing cover.
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

        {/* Section 6: Publication Status & Submission */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-xs">
              6
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Publication & Visibility</h2>
              <p className="text-[11px] text-slate-400">Choose website placement sections and publication status</p>
            </div>
          </div>

          {/* Website Section Toggles: FEATURED PROPERTIES & Latest Listings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
            <label className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 cursor-pointer flex items-center justify-between gap-4 transition-all">
              <div>
                <span className="text-xs font-bold text-[#0B2246] uppercase tracking-wide block">
                  FEATURED PROPERTIES
                </span>
                <span className="text-[11px] text-slate-500">
                  Show this listing in the Featured Properties section on the website
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
                  Show this listing in the Latest Listings section on the website
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                watch('status') === 'APPROVED'
                  ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                value="APPROVED"
                {...register('status')}
                className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Publish Immediately (Recommended)
                </span>
                <span className="text-[11px] text-slate-500">
                  Listing becomes active & visible on website right away.
                </span>
              </div>
            </label>

            <label
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                watch('status') === 'PENDING_APPROVAL'
                  ? 'border-amber-600 bg-amber-50/60 ring-2 ring-amber-500/20'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                value="PENDING_APPROVAL"
                {...register('status')}
                className="mt-0.5 text-amber-600 focus:ring-amber-500"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 block">Pending Review</span>
                <span className="text-[11px] text-slate-500">
                  Sends to the pending moderation queue.
                </span>
              </div>
            </label>

            <label
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                watch('status') === 'DRAFT'
                  ? 'border-slate-600 bg-slate-50 ring-2 ring-slate-500/20'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                value="DRAFT"
                {...register('status')}
                className="mt-0.5 text-slate-600 focus:ring-slate-500"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 block">Save as Draft</span>
                <span className="text-[11px] text-slate-500">
                  Private draft. Only visible inside Admin Panel.
                </span>
              </div>
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <Link
              href="/properties"
              className="px-5 py-2.5 font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-xs transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 font-semibold text-white bg-[#F5820D] rounded-xl hover:bg-[#DC6F05] transition-colors shadow-sm shadow-[#F5820D]/30 text-xs flex items-center gap-2 disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isSubmitting ? 'Publishing to Website...' : 'Publish Property to Website'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Quick-Add Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-[#EEF3FA]/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FFF4E8] text-[#F5820D] flex items-center justify-center font-bold">
                  <FolderPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0B2246]">Add New Property Category</h3>
                  <p className="text-[11px] text-slate-500">Create a category and assign it immediately</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickCreateCategory} className="p-6 space-y-4 text-xs overflow-y-auto">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Luxury Villa, Farmhouse, Modern Apartment..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#F5820D]/20 focus:border-[#F5820D]"
                />
              </div>

              <ImageUpload
                value={newCatImage}
                onChange={setNewCatImage}
                label="Category Cover Image"
                maxSizeMB={10}
              />

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief description for this category..."
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#F5820D]/20 focus:border-[#F5820D]"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingCategory || !newCatName.trim()}
                  className="px-5 py-2 font-semibold text-white bg-[#F5820D] rounded-xl hover:bg-[#DC6F05] disabled:opacity-50 transition-colors shadow-sm"
                >
                  {isSavingCategory ? 'Saving...' : 'Create & Select'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

