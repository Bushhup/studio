
'use server';

import { connectToDB } from '@/lib/mongoose';
import StudentBioModel, { IStudentBio } from '@/models/studentBio.model';
import UserModel from '@/models/user.model';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import mongoose from 'mongoose';

const studentBioSchema = z.object({
  studentId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val)),
  mobileNumber: z.string().min(10, "Mobile number must be at least 10 digits."),
  fatherName: z.string().min(2, "Father's name is required."),
  fatherOccupation: z.string().min(2, "Father's occupation is required."),
  fatherMobileNumber: z.string().min(10, "Father's mobile number must be at least 10 digits."),
  gender: z.enum(['male', 'female', 'other'], { required_error: "Gender is required." }),
  address: z.string().min(10, "Address is required."),
  religion: z.string().min(2, "Religion is required."),
  community: z.enum(['BC(MUSLIM)', 'OC', 'BC', 'MBC', 'SC', 'SCC', 'ST'], { required_error: "Community is required." }),
  caste: z.string().min(2, "Caste is required."),
  quota: z.enum(['management', 'government'], { required_error: "Quota is required." }),
  aadharNumber: z.string().regex(/^\d{4} \d{4} \d{4}$/, "Aadhar number must be in the format XXXX XXXX XXXX."),
});

export type StudentBioInput = z.infer<typeof studentBioSchema>;

export async function saveStudentBio(data: StudentBioInput): Promise<{ success: boolean, message: string }> {
  const validation = studentBioSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, message: validation.error.errors.map(e => e.message).join(', ') };
  }

  try {
    await connectToDB();

    await StudentBioModel.findOneAndUpdate(
      { studentId: new mongoose.Types.ObjectId(data.studentId) },
      { ...data, aadharNumber: data.aadharNumber.replace(/\s/g, '') },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    revalidatePath('/admin/bio-data');
    revalidatePath(`/settings/account`); // Revalidate student's profile page

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

export async function getStudentsForBioData(): Promise<{id: string, name: string}[]> {
    try {
        await connectToDB();
        const students = await UserModel.find({ role: 'student' }).select('_id name').sort({ name: 1 }).lean();
        return students.map(s => ({
            id: s._id.toString(),
            name: s.name,
        }));
    } catch (error) {
        console.error('Error fetching students for bio-data:', error);
        return [];
    }
}
