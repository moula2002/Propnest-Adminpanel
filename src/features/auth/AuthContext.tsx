'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AdminUser } from '@/types';
import { adminAuthService } from '@/services/adminAuthService';
import { setAccessToken, getAccessToken } from '@/services/api';

interface AuthContextType {
  user: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const loadUser = useCallback(async () => {
    try {
      const token = getAccessToken();
      if (!token) {
        // If not logged in and already on login page, skip unauthenticated API calls
        if (pathname === '/login') {
          setUser(null);
          setIsLoading(false);
          return;
        }

        // On protected page without token, try silent refresh once
        try {
          const refreshRes = await adminAuthService.refresh();
          if (refreshRes?.data?.accessToken) {
            const res = await adminAuthService.getMe();
            setUser(res.data);
            return;
          }
        } catch {
          // No active session or refresh cookie
        }
        setUser(null);
        return;
      }

      // If we have token, verify profile with backend
      const res = await adminAuthService.getMe();
      if (res?.data) {
        setUser(res.data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
      setAccessToken(null);
    } finally {
      setIsLoading(false);
    }
  }, [pathname]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (!isLoading) {
      if (!user && pathname !== '/login') {
        router.push('/login');
      } else if (user && pathname === '/login') {
        router.push('/dashboard');
      }
    }
  }, [user, isLoading, pathname, router]);

  const login = async (credentials: { email: string; password: string }) => {
    const res = await adminAuthService.login(credentials);
    if (res?.data?.user) {
      setUser(res.data.user);
      router.push('/dashboard');
    }
  };

  const logout = async () => {
    try {
      await adminAuthService.logout();
    } finally {
      setUser(null);
      router.push('/login');
    }
  };

  const refreshProfile = async () => {
    try {
      const res = await adminAuthService.getMe();
      if (res?.data) {
        setUser(res.data);
      }
    } catch (e) {
      console.error('Failed to refresh admin profile', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

