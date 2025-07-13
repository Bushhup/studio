
'use server';

import { connectToDB } from '@/lib/mongoose';
import ClassModel from '@/models/class.model';
import FeedbackModel from '@/models/feedback.model';
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

export async function getUnreadFeedbackCount(facultyId: string): Promise<number> {
    if (!mongoose.Types.ObjectId.isValid(facultyId)) {
        console.error('Invalid faculty ID provided to getUnreadFeedbackCount');
        return 0;
    }

    try {
        await connectToDB();
        const facultyObjectId = new mongoose.Types.ObjectId(facultyId);

        // This assumes feedback can be linked directly to a faculty member.
        // The logic might need to be more complex, e.g., finding subjects handled by the faculty
        // and then finding feedback for those subjects.
        const count = await FeedbackModel.countDocuments({ 
            facultyId: facultyObjectId,
            isRead: { $ne: true } // Assuming an `isRead` field exists
        });

        return count;
    } catch (error) {
        console.error('Error fetching unread feedback count:', error);
        return 0;
    }
}
