
'use server';

import { connectToDB } from '@/lib/mongoose';
import UserModel, { IUser } from '@/models/user.model';
import ClassModel from '@/models/class.model';
import SubjectModel from '@/models/subject.model';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';

// Zod schema for input validation
const addUserSchema = z.object({
  name: z.string().min(2, "Username must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  role: z.enum(['student', 'faculty']),
  rollNo: z.string().optional(),
  classId: z.string().optional(),
  inchargeOfClasses: z.array(z.string()).optional(), // For faculty
  handlingSubjects: z.array(z.string()).optional(), // For faculty
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
  rollNo: z.string().optional(),
  classId: z.string().optional(),
  inchargeOfClasses: z.array(z.string()).optional(), // For faculty
  handlingSubjects: z.array(z.string()).optional(), // For faculty
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

    const newUser = new UserModel({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      rollNo: data.role === 'student' ? data.rollNo : undefined,
      classId: data.role === 'student' && data.classId ? new mongoose.Types.ObjectId(data.classId) : undefined,
    });
    
    await newUser.save();
    
    if (data.role === 'faculty') {
        if (data.inchargeOfClasses && data.inchargeOfClasses.length > 0) {
            await ClassModel.updateMany(
                { _id: { $in: data.inchargeOfClasses.map(id => new mongoose.Types.ObjectId(id)) } },
                { $set: { inchargeFaculty: newUser._id } }
            );
        }
        if (data.handlingSubjects && data.handlingSubjects.length > 0) {
            await SubjectModel.updateMany(
                { _id: { $in: data.handlingSubjects.map(id => new mongoose.Types.ObjectId(id)) } },
                { $set: { facultyId: newUser._id } }
            )
        }
    }
    
    revalidatePath('/admin/users');
    revalidatePath('/admin/classes');
    revalidatePath('/admin/subjects');

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
            { $match: { role: { $in: ['student', 'faculty'] } } },
            { $sort: { rollNo: 1, name: 1 } },
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
                    as: 'classDetails'
                }
            },
            {
                $unwind: {
                    path: '$classDetails',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    password: 1,
                    role: 1,
                    rollNo: 1,
                    classId: 1,
                    className: '$classDetails.name',
                    inchargeOfClasses: {
                        $map: {
                            input: "$inchargeClasses",
                            as: "c",
                            in: { id: "$$c._id", name: "$$c.name" }
                        }
                    },
                    handlingSubjects: {
                         $map: {
                            input: "$handlingSubjects",
                            as: "s",
                            in: { id: "$$s._id", name: "$$s.name", code: "$$s.code", className: "$$s.className" }
                        }
                    },
                }
            }
        ]);
        
        const plainUsers = users.map(user => ({
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            password: user.password,
            role: user.role,
            rollNo: user.rollNo,
            className: user.className || 'N/A',
            classId: user.classId?.toString(),
            inchargeOfClasses: (user.inchargeOfClasses || []).map(c => ({...c, id: c.id.toString()})),
            handlingSubjects: (user.handlingSubjects || []).map(s => ({...s, id: s.id.toString()}))
        }));

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
        
        if (result.role === 'faculty') {
            const facultyObjectId = new mongoose.Types.ObjectId(userId);
            await ClassModel.updateMany(
                { inchargeFaculty: facultyObjectId },
                { $unset: { inchargeFaculty: "" } }
            );
            await SubjectModel.updateMany(
                { facultyId: facultyObjectId },
                { $unset: { facultyId: "" } }
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


export async function getUsersByRole(role: 'student' | 'faculty'): Promise<Pick<IUser, 'id' | 'name'| 'rollNo'>[]> {
    try {
        await connectToDB();
        const users = await UserModel.find({ role }).select('_id name rollNo').sort({ rollNo: 1, name: 1 }).lean();
        return users.map(user => ({
            id: user._id.toString(),
            name: user.name,
            rollNo: user.rollNo,
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
        
        if (data.email && data.email !== userToUpdate.email) {
            const existingUser = await UserModel.findOne({ email: data.email, _id: { $ne: userId } });
            if (existingUser) return { success: false, message: "Email already in use." };
            userToUpdate.email = data.email;
        }

        if (data.name && data.name !== userToUpdate.name) {
             const existingUser = await UserModel.findOne({ name: data.name, _id: { $ne: userId } });
            if (existingUser) return { success: false, message: "Username already in use." };
            userToUpdate.name = data.name;
        }

        if (data.password) {
            userToUpdate.password = data.password;
        }
        
        if (userToUpdate.role === 'student') {
            userToUpdate.rollNo = data.rollNo;
            if (data.classId) {
                userToUpdate.classId = new mongoose.Types.ObjectId(data.classId);
            }
        }
        
        await userToUpdate.save();
        
        if (userToUpdate.role === 'faculty') {
            const facultyId = new mongoose.Types.ObjectId(userId);
            
            await ClassModel.updateMany(
                { inchargeFaculty: facultyId },
                { $unset: { inchargeFaculty: "" } }
            );
            
            if (data.inchargeOfClasses && data.inchargeOfClasses.length > 0) {
                 await ClassModel.updateMany(
                    { _id: { $in: data.inchargeOfClasses.map(id => new mongoose.Types.ObjectId(id)) } },
                    { $set: { inchargeFaculty: facultyId } }
                );
            }

             await SubjectModel.updateMany(
                { facultyId: facultyId },
                { $unset: { facultyId: "" } }
            );

            if (data.handlingSubjects && data.handlingSubjects.length > 0) {
                 await SubjectModel.updateMany(
                    { _id: { $in: data.handlingSubjects.map(id => new mongoose.Types.ObjectId(id)) } },
                    { $set: { facultyId: facultyId } }
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
