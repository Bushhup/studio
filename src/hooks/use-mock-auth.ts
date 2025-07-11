
// src/hooks/use-mock-auth.ts
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Role } from '@/types';
import { login as loginAction, type LoginResult } from '@/app/actions';

const ROLE_STORAGE_KEY = 'MCA Dept-user-role';

interface AuthHook {
  role: Role | null;
  isLoading: boolean;
  login: (selectedRole: Role, email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
}

export function useMockAuth(): AuthHook {
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
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (selectedRole: Role, email: string, password: string): Promise<LoginResult> => {
    setIsLoading(true);
    const result = await loginAction({ role: selectedRole, email, password });
    
    if (result.success) {
      try {
        localStorage.setItem(ROLE_STORAGE_KEY, selectedRole);
      } catch (error) {
        console.error("Failed to access localStorage:", error);
        setIsLoading(false);
        return { success: false, message: "Could not save session. Please enable cookies/localStorage." };
      }
      setRole(selectedRole);
      
      let redirectPath = '/home';
      if (selectedRole === 'admin') redirectPath = '/admin/dashboard';
      else if (selectedRole === 'faculty') redirectPath = '/faculty/dashboard';
      else if (selectedRole === 'student') redirectPath = '/student/dashboard';
      router.push(redirectPath);
    }
    
    setIsLoading(false);
    return result;
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
