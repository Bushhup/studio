
'use server';

import { connectToDB } from '@/lib/mongoose';
import SubjectModel, { ISubject } from '@/models/subject.model';
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

        const newSubject = new SubjectModel(data);
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
        // Use .lean() to get plain JavaScript objects from the query
        const subjects = await SubjectModel.find({})
            .populate('classId', 'name')
            .populate('facultyId', 'name')
            .lean();

        // The .lean() method returns plain objects, so we cast the populated fields
        // to a type that reflects their potential structure or null if not found.
        return subjects.map(subject => {
            const classIdObj = subject.classId as { _id: mongoose.Types.ObjectId; name: string } | null;
            const facultyIdObj = subject.facultyId as { _id: mongoose.Types.ObjectId; name: string } | null;

            return {
                id: subject._id.toString(),
                name: subject.name,
                code: subject.code,
                // Safely access properties, providing fallbacks if the populated document is null
                classId: classIdObj?._id.toString() || '',
                facultyId: facultyIdObj?._id.toString() || '',
                className: classIdObj?.name || 'N/A',
                facultyName: facultyIdObj?.name || 'N/A',
            };
        });
    } catch (error) {
        console.error('Error fetching subjects:', error);
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
