
'use server';

import { connectToDB } from '@/lib/mongoose';
import UserModel from '@/models/user.model';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
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

  try {
    await connectToDB();
    
    const user = await UserModel.findOne({ email: data.email, role: data.role });

    if (!user) {
      return { success: false, message: 'No user found with this email and role.' };
    }
    
    // In a real app, you MUST hash passwords. Here we are doing a plain text comparison for simplicity.
    if (user.password !== data.password) {
      return { success: false, message: 'Incorrect password.' };
    }

    // You would typically set a session cookie or JWT here.
    // For this app's purpose, we are handling state on the client.
    return { success: true };

  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'An internal server error occurred.' };
  }
}
