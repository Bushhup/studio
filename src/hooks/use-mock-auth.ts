
// This file is no longer in use and can be deleted.
// Authentication is now handled by NextAuth.js.
// Keeping it to prevent breaking imports until they are all removed.
"use client";

import type { Role, User } from '@/types';

type LoginResult = { success: boolean; message?: string };

interface AuthHook {
  role: Role | null;
  user: User | null;
  isLoading: boolean;
  login: (selectedRole: Role, username: string, password: string) => Promise<LoginResult>;
  logout: () => void;
}

// This is a deprecated hook. It returns a non-functional shell
// to avoid crashing the app while transitioning to NextAuth.
export function useMockAuth(): AuthHook {
    return {
        role: null,
        user: null,
        isLoading: true,
        login: async () => ({ success: false, message: "Deprecated. Use NextAuth."}),
        logout: () => {},
    };
}
