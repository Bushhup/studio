
'use server';

import { connectToDB } from '@/lib/mongoose';
import ClassModel, { IClass } from '@/models/class.model';
import UserModel, { IUser } from '@/models/user.model';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';

const createClassSchema = z.object({
  name: z.string().min(3, "Class name must be at least 3 characters."),
  academicYear: z.string().regex(/^\d{4}-\d{4}$/, "Academic year must be in YYYY-YYYY format."),
  inchargeFaculty: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid faculty ID.",
  }),
});

export type CreateClassInput = z.infer<typeof createClassSchema>;

export async function createClass(data: CreateClassInput): Promise<{ success: boolean; message: string }> {
  try {
    const validation = createClassSchema.safeParse(data);
    if (!validation.success) {
      return { success: false, message: validation.error.errors.map(e => e.message).join(', ') };
    }

    await connectToDB();

    const newClass = new ClassModel(data);
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

export interface IClassWithStudentCount extends IClass {
    studentCount: number;
}

export async function getClasses(): Promise<IClassWithStudentCount[]> {
    try {
        await connectToDB();
        
        // Use aggregation to count students for each class
        const classesWithCounts = await ClassModel.aggregate([
            {
                $lookup: {
                    from: 'users', // The collection name for the UserModel
                    localField: '_id',
                    foreignField: 'classId',
                    as: 'students'
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
                    students: 0 // Exclude the students array from the final output
                }
            }
        ]);

        // Manually serialize the objects to ensure they are plain objects
        return classesWithCounts.map(c => ({
            id: c._id.toString(),
            name: c.name,
            academicYear: c.academicYear,
            inchargeFaculty: c.inchargeFaculty.toString(),
            studentCount: c.studentCount,
        })) as IClassWithStudentCount[];

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
            .sort({ name: 'asc' }) // Sort by name in ascending order
            .select('id name')
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
