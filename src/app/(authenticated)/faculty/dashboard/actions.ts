
'use server';

import { connectToDB } from '@/lib/mongoose';
import ClassModel from '@/models/class.model';
import SubjectModel from '@/models/subject.model';
import mongoose from 'mongoose';

interface FacultyDashboardStats {
  assignedClassesCount: number;
  handlingSubjectsCount: number;
}

export async function getFacultyDashboardStats(facultyId: string): Promise<FacultyDashboardStats> {
  if (!mongoose.Types.ObjectId.isValid(facultyId)) {
    console.error('Invalid faculty ID provided to getFacultyDashboardStats');
    return { assignedClassesCount: 0, handlingSubjectsCount: 0 };
  }

  try {
    await connectToDB();

    const facultyObjectId = new mongoose.Types.ObjectId(facultyId);

    const assignedClassesCountPromise = ClassModel.countDocuments({ inchargeFaculty: facultyObjectId });
    const handlingSubjectsCountPromise = SubjectModel.countDocuments({ facultyId: facultyObjectId });

    const [assignedClassesCount, handlingSubjectsCount] = await Promise.all([
      assignedClassesCountPromise,
      handlingSubjectsCountPromise,
    ]);

    return {
      assignedClassesCount,
      handlingSubjectsCount,
    };

  } catch (error) {
    console.error('Error fetching faculty dashboard stats:', error);
    return { assignedClassesCount: 0, handlingSubjectsCount: 0 };
  }
}
