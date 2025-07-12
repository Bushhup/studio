
// src/hooks/use-mock-auth.ts
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Role, User } from '@/types';
import { login as loginAction, type LoginResult, getUserDetails } from '@/app/actions';

const ROLE_STORAGE_KEY = 'MCA Dept-user-role';
const USERNAME_STORAGE_KEY = 'MCA Dept-username';

interface AuthHook {
  role: Role | null;
  user: User | null; // Add user object
  isLoading: boolean;
  login: (selectedRole: Role, username: string, password: string) => Promise<LoginResult>;
  logout: () => void;
}

export function useMockAuth(): AuthHook {
  const [role, setRole] = useState<Role | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  
  const fetchUserDetails = useCallback(async () => {
    try {
      const storedRole = localStorage.getItem(ROLE_STORAGE_KEY) as Role | null;
      const storedUsername = localStorage.getItem(USERNAME_STORAGE_KEY);
      
      if (storedRole && storedUsername) {
        setRole(storedRole);
        const userDetails = await getUserDetails(storedUsername, storedRole);
        if (userDetails) {
            setUser(userDetails);
        }
      }
    } catch (error) {
      console.error("Failed to access localStorage or fetch user details:", error);
      // Clear inconsistent state
      logout();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  const login = useCallback(async (selectedRole: Role, username: string, password: string): Promise<LoginResult> => {
    setIsLoading(true);
    const result = await loginAction({ role: selectedRole, username, password });
    
    if (result.success) {
      try {
        localStorage.setItem(ROLE_STORAGE_KEY, selectedRole);
        localStorage.setItem(USERNAME_STORAGE_KEY, username);
      } catch (error) {
        console.error("Failed to access localStorage:", error);
        setIsLoading(false);
        return { success: false, message: "Could not save session. Please enable cookies/localStorage." };
      }
      
      setRole(selectedRole);
      const userDetails = await getUserDetails(username, selectedRole);
      if(userDetails) setUser(userDetails);
      
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
      localStorage.removeItem(USERNAME_STORAGE_KEY);
    } catch (error) {
      console.error("Failed to access localStorage:", error);
    }
    setRole(null);
    setUser(null);
    router.push('/');
  }, [router]);

  return { role, user, isLoading, login, logout };
}
