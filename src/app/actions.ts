
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
export type LoginResult = { success: boolean; message?: string };

export async function login(data: LoginInput): Promise<LoginResult> {
  const validation = loginSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, message: 'Invalid input data.' };
  }
  
  // Special case for the admin user
  if (data.role === 'admin') {
    if (data.username === 'Admin01' && data.password === 'shaosaid05413') {
      return { success: true };
    } else {
      return { success: false, message: 'Invalid admin credentials.' };
    }
  }

  // Database authentication for faculty and students
  try {
    await connectToDB();
    
    // Find user by username and role, and explicitly include the password
    const user = await UserModel.findOne({ name: data.username, role: data.role }).select('+password');

    if (!user) {
      return { success: false, message: 'No user found with this username and role.' };
    }
    
    // In a real app, you MUST hash passwords. Here we are doing a plain text comparison for simplicity.
    if (user.password !== data.password) {
      return { success: false, message: 'Incorrect password.' };
    }

    return { success: true };

  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'An internal server error occurred.' };
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
