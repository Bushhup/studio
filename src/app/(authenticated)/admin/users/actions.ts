
'use server';

import { connectToDB } from '@/lib/mongoose';
import UserModel, { IUser } from '@/models/user.model';
import ClassModel from '@/models/class.model';
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
  inchargeOfClasses: z.array(z.string()).optional(), // For faculty
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

const updateUserSchema = z.object({
  name: z.string().min(2, "Username must be at least 2 characters.").optional(),
  email: z.string().email("Invalid email address.").optional(),
  password: z.string().min(6, "Password must be at least 6 characters.").optional().or(z.literal('')),
  classId: z.string().optional(),
  inchargeOfClasses: z.array(z.string()).optional(), // For faculty
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;


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

    // Explicitly create the new user object to ensure all fields are included
    const newUser = new UserModel({
      name: data.name,
      email: data.email,
      password: data.password, // Ensure password is saved
      role: data.role,
      classId: data.role === 'student' ? data.classId : undefined,
    });
    
    await newUser.save();
    
    // If it's a faculty member and classes are assigned, update those classes
    if (data.role === 'faculty' && data.inchargeOfClasses && data.inchargeOfClasses.length > 0) {
      await ClassModel.updateMany(
        { _id: { $in: data.inchargeOfClasses } },
        { $set: { inchargeFaculty: newUser._id } }
      );
    }
    
    revalidatePath('/admin/users');
    revalidatePath('/admin/classes');

    return { success: true, message: `User '${data.name}' added successfully as a ${data.role}.` };

  } catch (error) {
    console.error('Error adding user:', error);
    if (error instanceof Error) {
        return { success: false, message: error.message };
    }
    return { success: false, message: 'An unknown error occurred while adding the user.' };
  }
}

export type ExtendedUser = IUser & {
    className?: string;
    inchargeOfClasses?: { id: string; name: string }[];
    handlingSubjects?: { id: string; name: string; code: string; className: string }[];
};

export async function getUsers(): Promise<ExtendedUser[]> {
    try {
        await connectToDB();
        
        const users = await UserModel.aggregate([
            { $match: { role: { $ne: 'admin' } } },
            { $sort: { name: 1 } },
            {
                $lookup: {
                    from: 'classes',
                    localField: '_id',
                    foreignField: 'inchargeFaculty',
                    as: 'inchargeClasses'
                }
            },
            {
                $lookup: {
                    from: 'subjects',
                    let: { faculty_id: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$facultyId', '$$faculty_id'] } } },
                        {
                            $lookup: {
                                from: 'classes',
                                localField: 'classId',
                                foreignField: '_id',
                                as: 'classDetails'
                            }
                        },
                        { $unwind: { path: '$classDetails', preserveNullAndEmptyArrays: true } },
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                code: 1,
                                className: { $ifNull: ['$classDetails.name', 'N/A'] }
                            }
                        }
                    ],
                    as: 'handlingSubjects'
                }
            },
            {
                $lookup: {
                    from: 'classes',
                    localField: 'classId',
                    foreignField: '_id',
                    as: 'studentClass'
                }
            },
            {
                $unwind: {
                    path: '$studentClass',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    role: 1,
                    classId: 1,
                    className: '$studentClass.name',
                    inchargeOfClasses: '$inchargeClasses',
                    handlingSubjects: '$handlingSubjects',
                }
            }
        ]);
        
        const plainUsers = users.map(user => {
            const plainUser: any = {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                className: user.className || 'N/A'
            };

            if (user.role === 'student' && user.classId) {
                plainUser.classId = user.classId.toString();
            }
            
            if (user.role === 'faculty') {
                plainUser.inchargeOfClasses = user.inchargeOfClasses.map((c: any) => ({
                    id: c._id.toString(),
                    name: c.name
                }));
                plainUser.handlingSubjects = user.handlingSubjects.map((s: any) => ({
                    id: s._id.toString(),
                    name: s.name,
                    code: s.code,
                    className: s.className
                }));
            }

            return plainUser;
        });

        return plainUsers as ExtendedUser[];
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
        
        // If a faculty is deleted, unassign them from being in-charge of any class
        if (result.role === 'faculty') {
            await ClassModel.updateMany(
                { inchargeFaculty: new mongoose.Types.ObjectId(userId) },
                { $unset: { inchargeFaculty: "" } }
            );
        }

        revalidatePath('/admin/users');
        revalidatePath('/admin/classes');
        revalidatePath('/admin/subjects');
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
        const users = await UserModel.find({ role }).select('id name').sort({ name: 1 }).lean();
        return users.map(user => ({
            id: user._id.toString(),
            name: user.name,
        }));
    } catch (error) {
        console.error(`Error fetching ${role}s:`, error);
        return [];
    }
}

export async function updateUser(userId: string, data: UpdateUserInput): Promise<{ success: boolean; message: string }> {
    try {
        const validation = updateUserSchema.safeParse(data);
        if (!validation.success) {
            return { success: false, message: validation.error.errors.map(e => e.message).join(', ') };
        }

        await connectToDB();

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return { success: false, message: "Invalid user ID." };
        }

        const userToUpdate = await UserModel.findById(userId);
        if (!userToUpdate) {
            return { success: false, message: "User not found." };
        }
        
        const updatePayload: Partial<IUser> = {};

        // Check for uniqueness if email or name are being changed
        if (data.email && data.email !== userToUpdate.email) {
            const existingUser = await UserModel.findOne({ email: data.email, _id: { $ne: userId } });
            if (existingUser) return { success: false, message: "Email already in use." };
            updatePayload.email = data.email;
        }

        if (data.name && data.name !== userToUpdate.name) {
             const existingUser = await UserModel.findOne({ name: data.name, _id: { $ne: userId } });
            if (existingUser) return { success: false, message: "Username already in use." };
            updatePayload.name = data.name;
        }

        // Update password only if a new one is provided
        if (data.password) {
            updatePayload.password = data.password;
        }

        // Update classId for students
        if (userToUpdate.role === 'student' && data.classId) {
            updatePayload.classId = new mongoose.Types.ObjectId(data.classId);
        }

        await UserModel.updateOne({ _id: userId }, { $set: updatePayload });

        if (userToUpdate.role === 'faculty') {
            const facultyId = new mongoose.Types.ObjectId(userId);
            
            // Atomically update classes:
            // 1. Unset this faculty from all classes they were previously in charge of
            await ClassModel.updateMany(
                { inchargeFaculty: facultyId },
                { $unset: { inchargeFaculty: "" } }
            );
            
            // 2. Set this faculty to the new set of classes
            if (data.inchargeOfClasses && data.inchargeOfClasses.length > 0) {
                 await ClassModel.updateMany(
                    { _id: { $in: data.inchargeOfClasses.map(id => new mongoose.Types.ObjectId(id)) } },
                    { $set: { inchargeFaculty: facultyId } }
                );
            }
        }

        revalidatePath('/admin/users');
        revalidatePath('/admin/classes');
        revalidatePath('/admin/subjects');
        return { success: true, message: "User updated successfully." };

    } catch (error) {
        console.error('Error updating user:', error);
        if (error instanceof Error) {
            return { success: false, message: error.message };
        }
        return { success: false, message: 'An unknown error occurred while updating the user.' };
    }
}
