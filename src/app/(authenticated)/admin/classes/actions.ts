
'use server';

import { connectToDB } from '@/lib/mongoose';
import ClassModel, { IClass } from '@/models/class.model';
import UserModel, { IUser } from '@/models/user.model';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';

const classSchema = z.object({
  name: z.string().min(3, "Class name must be at least 3 characters."),
  academicYear: z.string().regex(/^\d{4}-\d{4}$/, "Academic year must be in YYYY-YYYY format."),
  inchargeFaculty: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid faculty ID.",
  }),
});

export type ClassInput = z.infer<typeof classSchema>;

export async function createClass(data: ClassInput): Promise<{ success: boolean; message: string }> {
  try {
    const validation = classSchema.safeParse(data);
    if (!validation.success) {
      return { success: false, message: validation.error.errors.map(e => e.message).join(', ') };
    }

    await connectToDB();

    const newClass = new ClassModel({
        ...data,
        inchargeFaculty: new mongoose.Types.ObjectId(data.inchargeFaculty)
    });
    await newClass.save();

    revalidatePath('/admin/classes');

    return { success: true, message: `Class '${data.name}' created successfully.` };

  } catch (error) {
    console.error('Error creating class:', error);
    if (error instanceof Error) {
        return { success: false, message: error.message };
    }
    return { success: false, message: 'An unknown error occurred.' };
  }
}

export async function updateClass(classId: string, data: ClassInput): Promise<{ success: boolean; message: string }> {
    try {
        const validation = classSchema.safeParse(data);
        if (!validation.success) {
            return { success: false, message: validation.error.errors.map(e => e.message).join(', ') };
        }

        await connectToDB();

        if (!mongoose.Types.ObjectId.isValid(classId)) {
            return { success: false, message: "Invalid class ID." };
        }

        const classToUpdate = await ClassModel.findById(classId);
        if (!classToUpdate) {
            return { success: false, message: "Class not found." };
        }

        classToUpdate.name = data.name;
        classToUpdate.academicYear = data.academicYear;
        classToUpdate.inchargeFaculty = new mongoose.Types.ObjectId(data.inchargeFaculty);

        await classToUpdate.save();

        revalidatePath('/admin/classes');
        return { success: true, message: "Class updated successfully." };

    } catch (error) {
        console.error('Error updating class:', error);
        if (error instanceof Error) {
            return { success: false, message: error.message };
        }
        return { success: false, message: 'An unknown error occurred while updating the class.' };
    }
}


export async function deleteClass(classId: string): Promise<{ success: boolean; message: string }> {
    try {
        await connectToDB();

        if (!mongoose.Types.ObjectId.isValid(classId)) {
            return { success: false, message: "Invalid class ID." };
        }
        
        // Check if there are any students assigned to this class
        const studentCount = await UserModel.countDocuments({ classId: new mongoose.Types.ObjectId(classId) });
        if (studentCount > 0) {
            return { success: false, message: `Cannot delete class. There are ${studentCount} student(s) assigned to it.` };
        }

        const result = await ClassModel.findByIdAndDelete(classId);

        if (!result) {
            return { success: false, message: "Class not found." };
        }

        revalidatePath('/admin/classes');
        return { success: true, message: "Class deleted successfully." };
    } catch (error) {
        console.error('Error deleting class:', error);
        if (error instanceof Error) {
            return { success: false, message: error.message };
        }
        return { success: false, message: 'An unknown error occurred while deleting the class.' };
    }
}


export interface IClassWithFacultyAndStudentCount extends Omit<IClass, 'inchargeFaculty'> {
    studentCount: number;
    inchargeFaculty: {
        id: string;
        name: string;
    } | null;
}

export async function getClasses(): Promise<IClassWithFacultyAndStudentCount[]> {
    try {
        await connectToDB();
        
        const classesWithDetails = await ClassModel.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: 'classId',
                    as: 'students'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'inchargeFaculty',
                    foreignField: '_id',
                    as: 'facultyIncharge'
                }
            },
            {
                $unwind: {
                    path: '$facultyIncharge',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    studentCount: { 
                        $size: {
                            $filter: {
                                input: "$students",
                                as: "student",
                                cond: { $eq: [ "$$student.role", "student" ] }
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    students: 0,
                    _id: 1,
                    name: 1,
                    academicYear: 1,
                    studentCount: 1,
                    inchargeFaculty: {
                        $ifNull: [{
                            id: '$facultyIncharge._id',
                            name: '$facultyIncharge.name'
                        }, null]
                    }
                }
            }
        ]);
        
        return classesWithDetails.map(c => ({
            id: c._id.toString(),
            name: c.name,
            academicYear: c.academicYear,
            inchargeFaculty: c.inchargeFaculty && c.inchargeFaculty.id
              ? { id: c.inchargeFaculty.id.toString(), name: c.inchargeFaculty.name } 
              : null,
            studentCount: c.studentCount,
        }));

    } catch (error) {
        console.error('Error fetching classes:', error);
        return [];
    }
}

export async function getStudentsByClass(classId: string): Promise<Pick<IUser, 'id' | 'name'>[]> {
    try {
        await connectToDB();
        if (!mongoose.Types.ObjectId.isValid(classId)) {
            return [];
        }

        const students = await UserModel.find({ classId: new mongoose.Types.ObjectId(classId), role: 'student' })
            .sort({ name: 'asc' })
            .select('_id name')
            .lean();
        
        return students.map(student => ({
            id: student._id.toString(),
            name: student.name,
        }));

    } catch (error) {
        console.error(`Error fetching students for class ${classId}:`, error);
        return [];
    }
}
