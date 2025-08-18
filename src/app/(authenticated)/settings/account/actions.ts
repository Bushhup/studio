
'use server';

import { connectToDB } from '@/lib/mongoose';
import UserModel from '@/models/user.model';
import StudentBioModel from '@/models/studentBio.model';
import type { IStudentBio } from '@/models/studentBio.model';
import { z } from 'zod';
import mongoose from 'mongoose';
import { revalidatePath } from 'next/cache';

// Schema for updating profile information
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
});

// Schema for changing password
const passwordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(6, "New password must be at least 6 characters."),
});

export async function updateProfile(userId: string, data: { name: string }): Promise<{ success: boolean, message: string }> {
  const validation = profileSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, message: validation.error.errors.map(e => e.message).join(', ') };
  }

  try {
    await connectToDB();

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return { success: false, message: "Invalid user ID." };
    }

    const userToUpdate = await UserModel.findById(userId);
    if (!userToUpdate) {
      return { success: false, message: "User not found." };
    }

    // Check if name is being changed to one that already exists
    if (data.name !== userToUpdate.name) {
      const existingUser = await UserModel.findOne({ name: data.name });
      if (existingUser) return { success: false, message: "Username already in use." };
      userToUpdate.name = data.name;
    }

    await userToUpdate.save();
    revalidatePath('/settings/account');
    return { success: true, message: "Profile updated successfully." };

  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, message: "An unknown server error occurred." };
  }
}

export async function changePassword(userId: string, data: { currentPassword, newPassword }): Promise<{ success: boolean, message: string }> {
  const validation = passwordSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, message: validation.error.errors.map(e => e.message).join(', ') };
  }
  
  try {
    await connectToDB();

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return { success: false, message: "Invalid user ID." };
    }
    
    // For admin, we might have different logic since they are not in the DB
    if (userId === 'admin_user_placeholder') { // Replace with actual check if needed
        return { success: false, message: "Admin password cannot be changed from this interface."}
    }
    
    const userToUpdate = await UserModel.findById(userId).select('+password');
    if (!userToUpdate) {
      return { success: false, message: "User not found." };
    }
    
    // In a real app, hash and compare passwords. Here, it's plain text.
    if (userToUpdate.password !== data.currentPassword) {
      return { success: false, message: "Incorrect current password." };
    }
    
    userToUpdate.password = data.newPassword;
    await userToUpdate.save();

    return { success: true, message: "Password changed successfully." };

  } catch (error) {
    console.error('Error changing password:', error);
    return { success: false, message: "An unknown server error occurred." };
  }
}

export async function getStudentBioForProfile(studentId: string): Promise<IStudentBio | null> {
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
        return null;
    }
    try {
        await connectToDB();
        const studentObjectId = new mongoose.Types.ObjectId(studentId);

        // Fetch both user and bio data
        const userPromise = UserModel.findById(studentObjectId).lean();
        const bioPromise = StudentBioModel.findOne({ studentId: studentObjectId }).lean();
        
        const [user, bio] = await Promise.all([userPromise, bioPromise]);

        // If bio doesn't exist, we can still return some basic info from the user model
        if (!bio) {
             if (user) {
                return {
                    _id: user._id.toString(),
                    studentId: user._id.toString(),
                    email: user.email,
                } as IStudentBio;
             }
             return null;
        }

        const plainBio = JSON.parse(JSON.stringify(bio));

        return {
            ...plainBio,
            _id: plainBio._id.toString(),
            studentId: plainBio.studentId.toString(),
            dob: plainBio.dob ? new Date(plainBio.dob) : undefined,
            // Ensure email from user model is prioritized if bio email is empty
            email: plainBio.email || user?.email,
        } as IStudentBio;

    } catch (error) {
        console.error('Error fetching student bio-data for profile:', error);
        return null;
    }
}

export async function updateAvatar(userId: string, dataUrl: string): Promise<{ success: boolean; message: string; avatar?: string }> {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return { success: false, message: "Invalid user ID." };
  }
  if (!dataUrl.startsWith('data:image/')) {
    return { success: false, message: "Invalid image data." };
  }

  try {
    await connectToDB();

    const result = await UserModel.findByIdAndUpdate(userId, { avatar: dataUrl }, { new: true });
    if (!result) {
      return { success: false, message: "User not found." };
    }
    
    revalidatePath('/settings/account');

    return { success: true, message: "Avatar updated successfully.", avatar: result.avatar };
  } catch (error) {
    console.error('Error updating avatar:', error);
    return { success: false, message: "An unknown server error occurred." };
  }
}
