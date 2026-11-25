'use client';

import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, ShieldCheck } from 'lucide-react';
import { AdminUser, Role } from '@/types';
import { adminUserService } from '@/services/adminUserService';
import { useToast } from '@/components/ui/ToastContext';

interface ChangeRoleModalProps {
  isOpen: boolean;
  user: AdminUser | null;
  onClose: () => void;
  onSuccess: (updatedUser: AdminUser) => void;
}

export const ChangeRoleModal: React.FC<ChangeRoleModalProps> = ({
  isOpen,
  user,
  onClose,
  onSuccess,
}) => {
  const { success, error } = useToast();
  const [selectedRole, setSelectedRole] = useState<Role>('USER');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole === user.role) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await adminUserService.updateUserRole(user.id, selectedRole);
      success(`Updated role for ${user.fullName} to ${selectedRole}`);
      onSuccess(res.data);
      onClose();
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to update user role');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Change User Role</h3>
              <p className="text-xs text-slate-500 truncate max-w-[220px]">{user.fullName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-2">Assign System Role</label>
            <div className="space-y-2">
              {(
                [
                  { role: 'USER', label: 'User', desc: 'Standard platform user who can search and submit inquiries' },
                  { role: 'AGENT', label: 'Agent', desc: 'Can post properties and manage property listings' },
                  { role: 'ADMIN', label: 'Admin', desc: 'Full administrative access to manage users, properties & inquiries' },
                  { role: 'SUPER_ADMIN', label: 'Super Admin', desc: 'Unrestricted access including promoting other administrators' },
                ] as const
              ).map((item) => (
                <label
                  key={item.role}
                  className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                    selectedRole === item.role
                      ? 'border-purple-600 bg-purple-50/60 ring-2 ring-purple-500/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={item.role}
                    checked={selectedRole === item.role}
                    onChange={() => setSelectedRole(item.role)}
                    className="mt-0.5 text-purple-600 focus:ring-purple-500"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">{item.label}</span>
                    <span className="text-[11px] text-slate-500">{item.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || selectedRole === user.role}
              className="px-5 py-2 font-semibold text-white bg-purple-600 rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              {isSubmitting ? 'Updating...' : 'Confirm Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

