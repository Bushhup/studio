
'use server';

import { connectToDB } from '@/lib/mongoose';
import SubjectModel from '@/models/subject.model';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';

const createSubjectSchema = z.object({
    name: z.string().min(3, "Subject name is required."),
    code: z.string().min(3, "Subject code is required."),
    classId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
        message: "Invalid class ID.",
    }),
});

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;

export async function createSubject(data: CreateSubjectInput): Promise<{ success: boolean; message: string }> {
    try {
        const validation = createSubjectSchema.safeParse(data);
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
