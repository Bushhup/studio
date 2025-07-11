
'use server';

import { connectToDB } from '@/lib/mongoose';
import UserModel, { IUser } from '@/models/user.model';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

// Zod schema for input validation
const addUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  role: z.enum(['student', 'faculty'], {
    required_error: "Role is required.",
  }),
});

export type AddUserInput = z.infer<typeof addUserSchema>;

export async function getUserCounts(): Promise<{ students: number; faculty: number }> {
  try {
    await connectToDB();
    
    const studentCount = await UserModel.countDocuments({ role: 'student' });
    const facultyCount = await UserModel.countDocuments({ role: 'faculty' });

    return {
      students: studentCount,
      faculty: facultyCount,
    };
  } catch (error) {
    console.error('Error fetching user counts:', error);
    // Return 0 if there's an error to prevent the page from crashing
    return { students: 0, faculty: 0 };
  }
}

export async function addUser(data: AddUserInput): Promise<{ success: boolean; message: string }> {
  try {
    const validation = addUserSchema.safeParse(data);
    if (!validation.success) {
      return { success: false, message: validation.error.errors.map(e => e.message).join(', ') };
    }

    await connectToDB();

    const existingUser = await UserModel.findOne({ email: data.email });
    if (existingUser) {
      return { success: false, message: 'A user with this email already exists.' };
    }

    const newUser = new UserModel(data);
    await newUser.save();
    
    // Revalidate the path to refresh the user list if it's being displayed
    revalidatePath('/admin/users');

    return { success: true, message: `User '${data.name}' added successfully as a ${data.role}.` };

  } catch (error) {
    console.error('Error adding user:', error);
    if (error instanceof Error) {
        return { success: false, message: error.message };
    }
    return { success: false, message: 'An unknown error occurred while adding the user.' };
  }
}
