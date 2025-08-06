
'use server';

import { connectToDB } from '@/lib/mongoose';
import StudentBioModel, { IStudentBio } from '@/models/studentBio.model';
import UserModel from '@/models/user.model';
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

// We are adjusting the input type to accept a string for the date from the form
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

    revalidatePath('/admin/bio-data');
    revalidatePath(`/settings/account`); // Revalidate student's profile page
    revalidatePath(`/faculty/dashboard`); // Revalidate faculty dashboard view

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
          return {
            ...bio,
            _id: bio._id.toString(),
            studentId: bio.studentId.toString(),
          } as IStudentBio;
        }
        return null;
    } catch (error) {
        console.error('Error fetching student bio-data:', error);
        return null;
    }
}

export async function getStudentsForBioData(): Promise<{id: string, name: string, email: string}[]> {
    try {
        await connectToDB();
        const students = await UserModel.find({ role: 'student' }).select('_id name email').sort({ name: 1 }).lean();
        return students.map(s => ({
            id: s._id.toString(),
            name: s.name,
            email: s.email,
        }));
    } catch (error) {
        console.error('Error fetching students for bio-data:', error);
        return [];
    }
}
