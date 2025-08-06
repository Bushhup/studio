
'use server';

import { connectToDB } from '@/lib/mongoose';
import StudentBioModel, { IStudentBio } from '@/models/studentBio.model';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import mongoose from 'mongoose';

const studentBioSchema = z.object({
  studentId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val)),
  mobileNumber: z.string().optional(),
  email: z.string().email("Invalid email address.").optional().or(z.literal('')),
  dob: z.date().optional(),
  fatherName: z.string().optional(),
  fatherOccupation: z.string().optional(),
  fatherMobileNumber: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  address: z.string().optional(),
  religion: z.string().optional(),
  community: z.enum(['BC(MUSLIM)', 'OC', 'BC', 'MBC', 'SC', 'SCC', 'ST']).optional(),
  caste: z.string().optional(),
  quota: z.enum(['management', 'government']).optional(),
  aadharNumber: z.string().optional(),
});

export type StudentBioInput = z.infer<typeof studentBioSchema>;

export async function saveStudentBio(data: Partial<StudentBioInput>): Promise<{ success: boolean, message: string }> {
  if (!data.studentId) {
      return { success: false, message: 'Student ID is required.' };
  }
  
  const updateData = { ...data };
  if (updateData.aadharNumber) {
    updateData.aadharNumber = updateData.aadharNumber.replace(/\s/g, '');
  }

  try {
    await connectToDB();

    await StudentBioModel.findOneAndUpdate(
      { studentId: new mongoose.Types.ObjectId(data.studentId) },
      updateData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    revalidatePath('/student/profile');
    revalidatePath(`/admin/bio-data`); 
    revalidatePath(`/faculty/dashboard`); 

    return { success: true, message: "Bio-data saved successfully." };

  } catch (error) {
    console.error('Error saving student bio-data:', error);
    if (error instanceof Error) {
        return { success: false, message: error.message };
    }
    return { success: false, message: 'An unknown error occurred.' };
  }
}

export async function getStudentBio(studentId: string): Promise<IStudentBio | null> {
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
        return null;
    }
    try {
        await connectToDB();
        const bio = await StudentBioModel.findOne({ studentId: new mongoose.Types.ObjectId(studentId) }).lean();
        if (bio) {
          const plainBio = JSON.parse(JSON.stringify(bio));
          return {
            ...plainBio,
            _id: plainBio._id.toString(),
            studentId: plainBio.studentId.toString(),
            dob: plainBio.dob ? new Date(plainBio.dob) : undefined,
          } as IStudentBio;
        }
        return null;
    } catch (error) {
        console.error('Error fetching student bio-data:', error);
        return null;
    }
}
