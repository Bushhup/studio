
'use server';

import { connectToDB } from '@/lib/mongoose';
import SubjectModel from '@/models/subject.model';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';
import { Subject } from '@/types';


const subjectSchema = z.object({
    name: z.string().min(3, "Subject name is required."),
    code: z.string().min(3, "Subject code is required."),
    classId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
        message: "Invalid class ID.",
    }),
    facultyId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
        message: "Invalid faculty ID.",
    }),
});

export type SubjectInput = z.infer<typeof subjectSchema>;

export async function createSubject(data: SubjectInput): Promise<{ success: boolean; message: string }> {
    try {
        const validation = subjectSchema.safeParse(data);
        if (!validation.success) {
            return { success: false, message: validation.error.errors.map(e => e.message).join(', ') };
        }

        await connectToDB();

        const existingSubject = await SubjectModel.findOne({ code: data.code });
        if (existingSubject) {
            return { success: false, message: 'A subject with this code already exists.' };
        }

        const newSubject = new SubjectModel({
            ...data,
            classId: new mongoose.Types.ObjectId(data.classId),
            facultyId: new mongoose.Types.ObjectId(data.facultyId),
        });
        await newSubject.save();

        revalidatePath('/admin/subjects');

        return { success: true, message: `Subject '${data.name}' created successfully.` };

    } catch (error) {
        console.error('Error creating subject:', error);
        if (error instanceof Error) {
            return { success: false, message: error.message };
        }
        return { success: false, message: 'An unknown error occurred.' };
    }
}

export type ExtendedSubject = Subject & { className: string, facultyName: string };

export async function getSubjects(): Promise<ExtendedSubject[]> {
    try {
        await connectToDB();
        
        const subjectsData = await SubjectModel.aggregate([
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
                $lookup: {
                    from: 'users',
                    localField: 'facultyId',
                    foreignField: '_id',
                    as: 'facultyDetails'
                }
            },
            {
                $unwind: {
                    path: '$facultyDetails',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    code: 1,
                    classId: 1,
                    facultyId: 1,
                    className: { $ifNull: ['$classDetails.name', 'N/A'] },
                    facultyName: { $ifNull: ['$facultyDetails.name', 'N/A'] }
                }
            }
        ]);
        
        const results = subjectsData.map(subject => ({
            id: subject._id.toString(),
            name: subject.name,
            code: subject.code,
            classId: subject.classId ? subject.classId.toString() : '',
            facultyId: subject.facultyId ? subject.facultyId.toString() : '',
            className: subject.className,
            facultyName: subject.facultyName,
        }));

        return results;

    } catch (error) {
        console.error('Error fetching subjects with aggregate:', error);
        return [];
    }
}


export async function updateSubject(subjectId: string, data: SubjectInput): Promise<{ success: boolean; message: string }> {
    try {
        const validation = subjectSchema.safeParse(data);
        if (!validation.success) {
            return { success: false, message: validation.error.errors.map(e => e.message).join(', ') };
        }

        await connectToDB();

        if (!mongoose.Types.ObjectId.isValid(subjectId)) {
            return { success: false, message: "Invalid subject ID." };
        }

        const subjectToUpdate = await SubjectModel.findById(subjectId);
        if (!subjectToUpdate) {
            return { success: false, message: "Subject not found." };
        }
        
        if (data.code !== subjectToUpdate.code) {
            const existingSubject = await SubjectModel.findOne({ code: data.code });
            if (existingSubject && existingSubject._id.toString() !== subjectId) {
                return { success: false, message: 'A subject with this code already exists.' };
            }
        }
        
        subjectToUpdate.name = data.name;
        subjectToUpdate.code = data.code;
        subjectToUpdate.classId = new mongoose.Types.ObjectId(data.classId);
        subjectToUpdate.facultyId = new mongoose.Types.ObjectId(data.facultyId);

        await subjectToUpdate.save();

        revalidatePath('/admin/subjects');
        return { success: true, message: "Subject updated successfully." };

    } catch (error) {
        console.error('Error updating subject:', error);
        if (error instanceof Error) {
            return { success: false, message: error.message };
        }
        return { success: false, message: 'An unknown error occurred.' };
    }
}


export async function deleteSubject(subjectId: string): Promise<{ success: boolean; message: string }> {
    try {
        await connectToDB();

        if (!mongoose.Types.ObjectId.isValid(subjectId)) {
            return { success: false, message: "Invalid subject ID." };
        }

        const result = await SubjectModel.findByIdAndDelete(subjectId);

        if (!result) {
            return { success: false, message: "Subject not found." };
        }

        revalidatePath('/admin/subjects');
        return { success: true, message: "Subject deleted successfully." };
    } catch (error) {
        console.error('Error deleting subject:', error);
        if (error instanceof Error) {
            return { success: false, message: error.message };
        }
        return { success: false, message: 'An unknown error occurred.' };
    }
}
