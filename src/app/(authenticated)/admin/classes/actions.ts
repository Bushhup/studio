
'use server';

import { connectToDB } from '@/lib/mongoose';
import ClassModel, { IClass } from '@/models/class.model';
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

export async function getClasses(): Promise<IClass[]> {
    try {
        await connectToDB();
        const classes = await ClassModel.find({}).lean();
        return classes.map(c => ({...c, id: c._id.toString() }));
    } catch (error) {
        console.error('Error fetching classes:', error);
        return [];
    }
}
