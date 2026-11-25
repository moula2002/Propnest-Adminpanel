'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  Layers,
  Building2,
  Sparkles,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  RefreshCw,
  X,
  Tag,
  Image as ImageIcon,
  Upload,
  CheckCircle,
  FolderPlus,
} from 'lucide-react';
import { categoryService, PropertyCategoryStat, AmenityItem } from '@/services/categoryService';
import { useToast } from '@/components/ui/ToastContext';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import { ConfirmationModal } from '@/components/dialogs/ConfirmationModal';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { getImageUrl } from '@/lib/utils';

export default function CategoriesPage() {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState<'types' | 'amenities'>('types');
  const [categories, setCategories] = useState<PropertyCategoryStat[]>([]);
  const [amenities, setAmenities] = useState<AmenityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Category Modal (Tab 1)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<PropertyCategoryStat | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryType, setCategoryType] = useState('');
  const [categoryImage, setCategoryImage] = useState('');
  const [categoryDesc, setCategoryDesc] = useState('');
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [deleteCategoryItem, setDeleteCategoryItem] = useState<PropertyCategoryStat | null>(null);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);

  // 2. Feature / Amenity Modal (Tab 2)
  const [isAmenityModalOpen, setIsAmenityModalOpen] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState<AmenityItem | null>(null);
  const [amenityName, setAmenityName] = useState('');
  const [amenityIcon, setAmenityIcon] = useState('check_circle');
  const [amenityImage, setAmenityImage] = useState('');
  const [isSavingAmenity, setIsSavingAmenity] = useState(false);
  const [deleteAmenityItem, setDeleteAmenityItem] = useState<AmenityItem | null>(null);
  const [isDeletingAmenity, setIsDeletingAmenity] = useState(false);

  const fetchCategoryData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await categoryService.getCategoryStats();
      if (res.data) {
        setCategories(res.data.categories || []);
        setAmenities(res.data.amenities || []);
      }
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchCategoryData();
  }, [fetchCategoryData]);

  // Category Handlers (Tab 1)
  const handleOpenAddCategoryModal = () => {
    setEditingCategory(null);
    setCategoryName('');
    setCategoryType('');
    setCategoryImage('');
    setCategoryDesc('');
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategoryModal = (cat: PropertyCategoryStat) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setCategoryType(cat.type);
    setCategoryImage(cat.imageUrl || '');
    setCategoryDesc(cat.description || '');
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      error('Category name is required');
      return;
    }

    setIsSavingCategory(true);
    try {
      if (editingCategory && editingCategory.id) {
        await categoryService.updateCategory(editingCategory.id, {
          name: categoryName.trim(),
          imageUrl: categoryImage.trim() || undefined,
          description: categoryDesc.trim() || undefined,
        });
        success(`Category "${categoryName}" updated successfully`);
      } else {
        await categoryService.createCategory({
          name: categoryName.trim(),
          type: categoryType.trim() || undefined,
          imageUrl: categoryImage.trim() || undefined,
          description: categoryDesc.trim() || undefined,
        });
        success(`New category "${categoryName}" created successfully`);
      }
      setIsCategoryModalOpen(false);
      fetchCategoryData();
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to save category');
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteCategoryItem) return;
    setIsDeletingCategory(true);
    try {
      if (deleteCategoryItem.id) {
        await categoryService.deleteCategory(deleteCategoryItem.id);
      }
      success(`Category "${deleteCategoryItem.name}" deleted successfully`);
      setDeleteCategoryItem(null);
      fetchCategoryData();
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to delete category');
    } finally {
      setIsDeletingCategory(false);
    }
  };

  // Feature Handlers (Tab 2)
  const handleOpenAddAmenityModal = () => {
    setEditingAmenity(null);
    setAmenityName('');
    setAmenityIcon('check_circle');
    setAmenityImage('');
    setIsAmenityModalOpen(true);
  };

  const handleOpenEditAmenityModal = (item: AmenityItem) => {
    setEditingAmenity(item);
    setAmenityName(item.name);
    setAmenityIcon(item.icon || 'check_circle');
    setAmenityImage(item.imageUrl || '');
    setIsAmenityModalOpen(true);
  };

  const handleSaveAmenity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amenityName.trim()) {
      error('Feature / Amenity name is required');
      return;
    }

    setIsSavingAmenity(true);
    try {
      if (editingAmenity) {
        await categoryService.updateAmenity(editingAmenity.id, {
          name: amenityName.trim(),
          icon: amenityIcon.trim() || 'check_circle',
          imageUrl: amenityImage.trim() || null,
        });
        success(`Feature "${amenityName}" updated successfully`);
      } else {
        await categoryService.createAmenity({
          name: amenityName.trim(),
          icon: amenityIcon.trim() || 'check_circle',
          imageUrl: amenityImage.trim() || null,
        });
        success(`Feature "${amenityName}" created and added to database`);
      }
      setIsAmenityModalOpen(false);
      fetchCategoryData();
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to save feature');
    } finally {
      setIsSavingAmenity(false);
    }
  };

  const handleDeleteAmenity = async () => {
    if (!deleteAmenityItem) return;
    setIsDeletingAmenity(true);
    try {
      await categoryService.deleteAmenity(deleteAmenityItem.id);
      success(`Feature "${deleteAmenityItem.name}" deleted`);
      setDeleteAmenityItem(null);
      fetchCategoryData();
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to delete amenity');
    } finally {
      setIsDeletingAmenity(false);
    }
  };

  const totalListings = categories.reduce((acc, c) => acc + c.totalProperties, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Category Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage real estate property categories, lifestyle types, and feature tags
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => fetchCategoryData()}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleOpenAddCategoryModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#F5820D] rounded-xl hover:bg-[#DC6F05] transition-colors shadow-sm shadow-[#F5820D]/25"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Property Category</span>
          </button>

          <button
            onClick={handleOpenAddAmenityModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0B2246] bg-[#EEF3FA] border border-[#0B2246]/15 rounded-xl hover:bg-[#0B2246] hover:text-white transition-colors shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Add Feature / Amenity</span>
          </button>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Property Categories</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{categories.length}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Platform property classifications</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Total Classified Listings</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{totalListings}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Properties mapped across categories</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Feature Tags & Amenities</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{amenities.length}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Available for listing filtering</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="border-b border-slate-200">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('types')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'types'
                ? 'border-[#F5820D] text-[#0B2246]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className={`w-4 h-4 ${activeTab === 'types' ? 'text-[#F5820D]' : ''}`} />
            <span>Property Categories ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('amenities')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'amenities'
                ? 'border-[#F5820D] text-[#0B2246]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${activeTab === 'amenities' ? 'text-[#F5820D]' : ''}`} />
            <span>Amenities & Lifestyle Features ({amenities.length})</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={6} columns={4} />
      ) : activeTab === 'types' ? (
        /* Tab 1: Property Types / Categories with Image Banners, Edit & Delete */
        categories.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#EEF3FA] text-[#0B2246] flex items-center justify-center mx-auto">
              <Layers className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0B2246]">No Property Categories Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Create dynamic property categories with custom cover images and descriptions. They will be stored in PostgreSQL and synced across the platform.
              </p>
            </div>
            <button
              onClick={handleOpenAddCategoryModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#F5820D] hover:bg-[#DC6F05] text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Property Category</span>
            </button>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.type}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:border-blue-300 hover:shadow-md transition-all group"
            >
              <div>
                {/* Category Header Image */}
                <div className="relative h-32 w-full overflow-hidden bg-slate-800 flex items-center justify-center">
                  {cat.imageUrl ? (
                    <img
                      src={getImageUrl(cat.imageUrl)}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-slate-400">
                      <Layers className="w-8 h-8 opacity-40" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none" />
                  
                  {/* Category Action Buttons Overlay (Edit & Delete) */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEditCategoryModal(cat)}
                      className="p-1.5 bg-white/90 hover:bg-white text-slate-800 rounded-lg shadow-sm hover:text-blue-600 transition-colors"
                      title="Edit Category"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteCategoryItem(cat)}
                      className="p-1.5 bg-white/90 hover:bg-white text-slate-800 rounded-lg shadow-sm hover:text-rose-600 transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white">
                    <div>
                      <h3 className="font-bold text-white text-base leading-tight drop-shadow-sm">{cat.name}</h3>
                      <p className="text-[10px] text-slate-300 font-mono">TYPE: {cat.type}</p>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      {cat.approvedProperties} Live
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {cat.description || `All properties classified under ${cat.name}`}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                    <span className="font-medium">Total Listings:</span>
                    <span className="font-bold text-slate-900">{cat.totalProperties} properties</span>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0">
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    href={`/properties?propertyType=${cat.type}`}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <span>Filter in Admin</span>
                  </Link>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditCategoryModal(cat)}
                      className="px-2 py-1 text-[11px] font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Edit className="w-3 h-3" />
                      <span>Edit</span>
                    </button>

                    <a
                      href={`http://localhost:3000/properties?propertyType=${cat.type}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 rounded-lg transition-colors"
                      title="Preview on Website"
                    >
                      <span>Website</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        )
      ) : (
        /* Tab 2: Amenities & Features with Images, Edit & Delete */
        amenities.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#FFF4E8] text-[#F5820D] flex items-center justify-center mx-auto">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0B2246]">No Amenities or Features Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Add feature tags and amenities (like Swimming Pool, Gym, Parking) that can be attached to property listings.
              </p>
            </div>
            <button
              onClick={handleOpenAddAmenityModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#F5820D] hover:bg-[#DC6F05] text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Feature / Amenity</span>
            </button>
          </div>
        ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Feature / Amenity</th>
                  <th className="py-3.5 px-6">Slug</th>
                  <th className="py-3.5 px-6">Icon Identifier</th>
                  <th className="py-3.5 px-6">Properties Using This</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {amenities.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-6 font-semibold text-slate-900 flex items-center gap-3">
                      {item.imageUrl ? (
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0 bg-slate-100 shadow-xs">
                          <img
                            src={getImageUrl(item.imageUrl)}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center flex-shrink-0">
                          <Tag className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{item.name}</p>
                        {item.imageUrl ? (
                          <span className="text-[10px] text-emerald-600 font-medium">Has image</span>
                        ) : (
                          <span className="text-[10px] text-slate-400">No image set</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-6 text-slate-500 font-mono text-[11px]">
                      {item.slug}
                    </td>
                    <td className="py-3 px-6 text-slate-600 font-mono text-[11px]">
                      {item.icon || 'check_circle'}
                    </td>
                    <td className="py-3 px-6 font-semibold text-slate-700">
                      {item.usageCount ?? 0} properties
                    </td>
                    <td className="py-3 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditAmenityModal(item)}
                          className="px-2 py-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1 font-semibold"
                          title="Edit Feature"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => setDeleteAmenityItem(item)}
                          className="px-2 py-1 text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1 font-semibold"
                          title="Delete Feature"
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
        </div>
        )
      )}

      {/* MODAL 1: Add / Edit Property Category Modal (Tab 1) */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <FolderPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {editingCategory ? 'Edit Property Category' : 'Add New Property Category'}
                  </h3>
                  <p className="text-[11px] text-slate-500">Configure classification title, image, and description</p>
                </div>
              </div>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 space-y-4 text-xs overflow-y-auto">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Luxury Villa, Penthouse, Modern Apartment..."
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {!editingCategory && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category Type Identifier</label>
                  <input
                    type="text"
                    placeholder="e.g. VILLA, PENTHOUSE, STUDIO (leave empty to auto-generate)"
                    value={categoryType}
                    onChange={(e) => setCategoryType(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono uppercase"
                  />
                </div>
              )}

              {/* Category Cover Image Upload */}
              <ImageUpload
                value={categoryImage}
                onChange={setCategoryImage}
                label="Category Cover Image"
                maxSizeMB={10}
              />

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief description for this category displayed to users..."
                  value={categoryDesc}
                  onChange={(e) => setCategoryDesc(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
                  disabled={isSavingCategory || !categoryName.trim()}
                  className="px-5 py-2 font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {isSavingCategory ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Add / Edit Amenity / Feature Modal (Tab 2) */}
      {isAmenityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {editingAmenity ? 'Edit Category Feature' : 'Add New Category Feature'}
                  </h3>
                  <p className="text-[11px] text-slate-500">Feature tag and photo displayed on property listings</p>
                </div>
              </div>
              <button
                onClick={() => setIsAmenityModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAmenity} className="p-6 space-y-4 text-xs overflow-y-auto">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Feature / Amenity Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Infinity Swimming Pool, 24/7 Security, Fitness Gym..."
                  value={amenityName}
                  onChange={(e) => setAmenityName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              {/* Feature Image Upload */}
              <ImageUpload
                value={amenityImage}
                onChange={setAmenityImage}
                label="Feature / Amenity Photo"
                maxSizeMB={10}
              />

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Icon Keyword</label>
                <input
                  type="text"
                  placeholder="e.g. pool, shield, fitness, elevator, bolt, groups, park"
                  value={amenityIcon}
                  onChange={(e) => setAmenityIcon(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAmenityModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingAmenity || !amenityName.trim()}
                  className="px-5 py-2 font-semibold text-white bg-purple-600 rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {isSavingAmenity ? 'Saving...' : editingAmenity ? 'Update Feature' : 'Create Feature'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Category Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteCategoryItem}
        title="Delete Property Category"
        message={`Are you sure you want to delete the category "${deleteCategoryItem?.name}"? Property listings under this category will remain safe.`}
        confirmLabel="Delete Category"
        variant="danger"
        isLoading={isDeletingCategory}
        onConfirm={handleDeleteCategory}
        onCancel={() => setDeleteCategoryItem(null)}
      />

      {/* Delete Amenity Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteAmenityItem}
        title="Delete Amenity Feature"
        message={`Are you sure you want to delete "${deleteAmenityItem?.name}"? It will be removed from all property tags.`}
        confirmLabel="Delete Feature"
        variant="danger"
        isLoading={isDeletingAmenity}
        onConfirm={handleDeleteAmenity}
        onCancel={() => setDeleteAmenityItem(null)}
      />
    </div>
  );
}
