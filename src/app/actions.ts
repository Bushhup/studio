
'use server';

import { connectToDB } from '@/lib/mongoose';
import UserModel from '@/models/user.model';
import { z } from 'zod';
import type { User, Role } from '@/types';

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
  role: z.enum(['admin', 'student', 'faculty']),
});

export type LoginInput = z.infer<typeof loginSchema>;

// This function will now return the user object on success or null on failure.
export async function login(data: LoginInput): Promise<User | null> {
  const validation = loginSchema.safeParse(data);
  if (!validation.success) {
    console.error('Login validation failed:', validation.error);
    return null;
  }
  
  if (data.role === 'admin') {
    if (data.username === 'Admin01' && data.password === 'shaosaid05413') {
       return {
            id: 'admin_user_placeholder',
            name: 'Admin User',
            email: 'admin@mca-dept.edu',
            role: 'admin'
        };
    }
    return null;
  }

  try {
    await connectToDB();
    
    // Fetch the user and their password
    const user = await UserModel.findOne({ name: data.username, role: data.role }).select('+password').lean();

    if (!user || user.password !== data.password) {
      return null;
    }

    // Return the full user object matching the User type
    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role as Role,
        classId: user.classId ? user.classId.toString() : undefined,
    };

  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}


export async function getUserDetails(username: string, role: Role): Promise<User | null> {
    if (role === 'admin' && username === 'Admin01') {
        return {
            id: 'admin_user_placeholder',
            name: 'Admin User',
            email: 'admin@mca-dept.edu',
            role: 'admin'
        };
    }
    
    try {
        await connectToDB();
        const user = await UserModel.findOne({ name: username, role: role }).lean();

        if (!user) {
            return null;
        }

        return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role as Role,
            classId: user.classId ? user.classId.toString() : undefined,
        };

    } catch (error) {
        console.error('Failed to fetch user details:', error);
        return null;
    }
}
