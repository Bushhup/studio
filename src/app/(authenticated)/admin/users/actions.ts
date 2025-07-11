
'use server';

import { connectToDB } from '@/lib/mongoose';
import UserModel, { IUser } from '@/models/user.model';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';

// Zod schema for input validation
const addUserSchema = z.object({
  name: z.string().min(2, "Username must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  role: z.enum(['student', 'faculty']),
  classId: z.string().optional(),
}).refine(data => {
    if (data.role === 'student' && !data.classId) {
        return false;
    }
    return true;
}, {
    message: "A class must be selected for students.",
    path: ["classId"],
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

    const existingUserByEmail = await UserModel.findOne({ email: data.email });
    if (existingUserByEmail) {
      return { success: false, message: 'A user with this email already exists.' };
    }
    
    const existingUserByName = await UserModel.findOne({ name: data.name });
    if (existingUserByName) {
      return { success: false, message: 'A user with this username already exists.' };
    }

    const newUser = new UserModel(data);
    await newUser.save();
    
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

export async function getUsers(): Promise<IUser[]> {
    try {
        await connectToDB();
        const users = await UserModel.find({ role: { $ne: 'admin' } }).populate('classId', 'name academicYear').lean();
        
        const plainUsers = users.map(user => {
            const plainUser: any = {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                password: user.password,
                className: 'N/A'
            };

            if (user.classId && typeof user.classId === 'object') {
                plainUser.classId = user.classId._id.toString();
                plainUser.className = (user.classId as any).name || 'N/A';
            } else if (user.classId) {
                 plainUser.classId = user.classId.toString();
            }

            return plainUser;
        });

        return plainUsers as IUser[];
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
}


export async function deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
    try {
        await connectToDB();

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return { success: false, message: "Invalid user ID." };
        }

        const result = await UserModel.findByIdAndDelete(userId);

        if (!result) {
            return { success: false, message: "User not found." };
        }

        revalidatePath('/admin/users');
        return { success: true, message: `User deleted successfully.` };
    } catch (error) {
        console.error('Error deleting user:', error);
        if (error instanceof Error) {
            return { success: false, message: error.message };
        }
        return { success: false, message: 'An unknown error occurred while deleting the user.' };
    }
}


export async function getUsersByRole(role: 'student' | 'faculty'): Promise<Pick<IUser, 'id' | 'name'>[]> {
    try {
        await connectToDB();
        const users = await UserModel.find({ role }).select('id name').lean();
        return users.map(user => ({
            id: user._id.toString(),
            name: user.name,
        }));
    } catch (error) {
        console.error(`Error fetching ${role}s:`, error);
        return [];
    }
}
