
'use server';

import { connectToDB } from '@/lib/mongoose';
import UserModel from '@/models/user.model';

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
    // Return 0 if there's an error to prevent the page from crashing
    return { students: 0, faculty: 0 };
  }
}
