// src/hooks/use-mock-auth.ts
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Role } from '@/types';

const ROLE_STORAGE_KEY = 'MCA Dept-user-role';

interface MockAuth {
  role: Role | null;
  isLoading: boolean;
  login: (selectedRole: Role) => void;
  logout: () => void;
}

export function useMockAuth(): MockAuth {
  const [role, setRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedRole = localStorage.getItem(ROLE_STORAGE_KEY) as Role | null;
      if (storedRole) {
        setRole(storedRole);
      }
    } catch (error) {
      console.error("Failed to access localStorage:", error);
      // Fallback or error handling if localStorage is not available
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((selectedRole: Role) => {
    try {
      localStorage.setItem(ROLE_STORAGE_KEY, selectedRole);
    } catch (error) {
      console.error("Failed to access localStorage:", error);
    }
    setRole(selectedRole);
    // Determine redirect path based on role
    let redirectPath = '/home'; // Default redirect
    if (selectedRole === 'admin') redirectPath = '/admin/dashboard';
    else if (selectedRole === 'faculty') redirectPath = '/faculty/dashboard';
    else if (selectedRole === 'student') redirectPath = '/student/dashboard';
    router.push(redirectPath);
  }, [router]);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(ROLE_STORAGE_KEY);
    } catch (error) {
      console.error("Failed to access localStorage:", error);
    }
    setRole(null);
    router.push('/');
  }, [router]);

  return { role, isLoading, login, logout };
}
