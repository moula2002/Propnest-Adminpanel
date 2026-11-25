'use client';

import React, { useRef, useState } from 'react';
import { Upload, X, Loader2, Star } from 'lucide-react';
import { uploadService } from '@/services/uploadService';
import { useToast } from '@/components/ui/ToastContext';
import { getImageUrl } from '@/lib/utils';

interface GalleryUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
  maxPhotos?: number;
  maxSizeMB?: number;
  label?: string;
  description?: string;
}

export const GalleryUpload: React.FC<GalleryUploadProps> = ({
  value = [],
  onChange,
  maxFiles,
  maxPhotos,
  maxSizeMB = 10,
  label = 'Property Photo Gallery',
  description = 'Upload high quality photos from your computer (JPG, PNG, WebP up to 10MB each)',
}) => {
  const effectiveMaxFiles = maxPhotos ?? maxFiles ?? 15;
  const { error, success } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFilesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Copy FileList before resetting input (clearing value empties live FileList in Chromium)
    const fileList = Array.from(files);
    e.target.value = '';

    // Validate count
    if (value.length + fileList.length > effectiveMaxFiles) {
      error(`You can upload at most ${effectiveMaxFiles} photos in total.`);
      return;
    }

    // Validate format & size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    for (const f of fileList) {
      if (!allowedTypes.includes(f.type)) {
        error(`File "${f.name}" has an unsupported format. Only JPG, PNG, and WebP are allowed.`);
        return;
      }
      if (f.size > 10 * 1024 * 1024) {
        error(`File "${f.name}" is too large. Each image must be under 10MB.`);
        return;
      }
    }

    setIsUploading(true);
    try {
      const results = await uploadService.uploadMultiple(fileList);
      const newUrls = results.map((r) => r.url);
      onChange([...value, ...newUrls]);
      success(`${results.length} photo(s) uploaded successfully!`);
    } catch (err: any) {
      error(err?.response?.data?.message || err?.message || 'Failed to upload photos. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = (index: number) => {
    const updated = value.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    const selected = value[index];
    const filtered = value.filter((_, idx) => idx !== index);
    onChange([selected, ...filtered]);
    success('Set as primary cover photo');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-semibold text-slate-800">{label}</label>
          <p className="text-[11px] text-slate-400">{description}</p>
        </div>
        <span className="text-xs font-semibold text-slate-500 font-mono">
          {value.length}/{maxFiles} photos
        </span>
      </div>

      {/* Hidden File Picker Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFilesSelect}
        className="hidden"
      />

      {/* Upload Button Bar */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || value.length >= effectiveMaxFiles}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm shadow-blue-600/20 disabled:opacity-50 cursor-pointer"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Uploading Photos...</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span>Upload Photos from Device</span>
            </>
          )}
        </button>

        <span className="text-[11px] text-slate-400">
          No URLs required. Select directly from your computer or mobile storage.
        </span>
      </div>

      {/* Uploaded Gallery Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-2">
          {value.map((url, idx) => {
            const displayUrl = getImageUrl(url);
            const isPrimary = idx === 0;

            return (
              <div
                key={idx}
                className="relative group rounded-2xl overflow-hidden border border-slate-200 h-28 bg-slate-100 shadow-xs"
              >
                <img
                  src={displayUrl}
                  alt={`Listing photo ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />

                {/* Primary / Cover Tag */}
                {isPrimary ? (
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 text-[9px] font-bold bg-blue-600 text-white rounded-md shadow-sm">
                    Cover Photo
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(idx)}
                    className="absolute bottom-2 left-2 px-1.5 py-0.5 text-[9px] font-semibold bg-black/60 hover:bg-black/80 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                    title="Set as Cover photo"
                  >
                    <Star className="w-2.5 h-2.5" />
                    <span>Set Cover</span>
                  </button>
                )}

                {/* Remove Photo Button */}
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="absolute top-1.5 right-1.5 p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm opacity-90 group-hover:opacity-100 transition-opacity"
                  title="Remove this photo"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
