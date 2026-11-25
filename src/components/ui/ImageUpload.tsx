'use client';

import React, { useRef, useState } from 'react';
import { Upload, X, Loader2, CheckCircle2, RefreshCw } from 'lucide-react';
import { uploadService } from '@/services/uploadService';
import { useToast } from '@/components/ui/ToastContext';
import { getImageUrl } from '@/lib/utils';

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string) => void;
  onRemove?: () => void;
  label?: string;
  description?: string;
  className?: string;
  aspectRatio?: 'video' | 'square' | 'banner';
  maxSizeMB?: number;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onRemove,
  label = 'Upload Image',
  description = 'Select an image from your device (JPG, PNG, WebP up to 10MB)',
  className = '',
  aspectRatio = 'video',
}) => {
  const { error, success } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const displayImage = localPreview || (value ? getImageUrl(value) : null);

  const aspectClasses = {
    video: 'h-40 sm:h-48 w-full',
    square: 'h-36 w-36',
    banner: 'h-32 sm:h-40 w-full',
  }[aspectRatio];

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so same file can be re-selected if replaced
    e.target.value = '';

    // Validate format
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      error('Unsupported format. Please select a JPG, PNG, or WebP image.');
      return;
    }

    // Validate size (10 MB)
    if (file.size > 10 * 1024 * 1024) {
      error('File is too large. Image must be less than 10MB.');
      return;
    }

    // Instant local preview
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    setIsUploading(true);

    try {
      const res = await uploadService.uploadSingle(file);
      // Pass the uploaded path to parent
      onChange(res.url);
      success('Image uploaded successfully to server!');
    } catch (err: any) {
      setLocalPreview(null);
      error(err?.response?.data?.message || err?.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setLocalPreview(null);
    if (onRemove) onRemove();
    onChange('');
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-700">{label}</label>
          {description && <span className="text-[11px] text-slate-400">{description}</span>}
        </div>
      )}

      {/* Hidden Device File Picker Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {displayImage ? (
        /* Image Preview Box with Replace & Remove options */
        <div className={`relative ${aspectClasses} rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 group shadow-sm`}>
          <img
            src={displayImage}
            alt="Uploaded preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />

          {/* Uploading Overlay */}
          {isUploading && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center text-white">
              <Loader2 className="w-6 h-6 animate-spin text-blue-400 mb-1.5" />
              <p className="text-xs font-semibold">Uploading to Server...</p>
            </div>
          )}

          {!isUploading && (
            <>
              {/* Ready Indicator */}
              <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-[10px] text-white font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Uploaded</span>
              </div>

              {/* Action Buttons: Replace & Remove */}
              <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1.5 bg-white/95 hover:bg-white text-slate-800 rounded-lg text-xs font-semibold shadow-sm hover:text-blue-600 transition-colors flex items-center gap-1"
                  title="Replace with another image"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Replace</span>
                </button>

                <button
                  type="button"
                  onClick={handleRemove}
                  className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm transition-colors"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        /* Empty Upload Trigger Button */
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className={`w-full ${aspectClasses} border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/40 rounded-2xl flex flex-col items-center justify-center p-6 text-center transition-all cursor-pointer group`}
        >
          <div className="w-11 h-11 rounded-2xl bg-blue-50 group-hover:bg-blue-100 text-blue-600 flex items-center justify-center mb-2 transition-colors">
            {isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Upload className="w-5 h-5 group-hover:scale-110 transition-transform" />
            )}
          </div>
          <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
            {isUploading ? 'Uploading Image...' : 'Click to Upload Image'}
          </span>
          <p className="text-[11px] text-slate-400 mt-0.5">Select image file directly from your computer</p>
        </button>
      )}
    </div>
  );
};
