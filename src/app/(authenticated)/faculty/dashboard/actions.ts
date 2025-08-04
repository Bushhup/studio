
'use server';

import { connectToDB } from '@/lib/mongoose';
import ClassModel from '@/models/class.model';
import FeedbackModel from '@/models/feedback.model';
import SubjectModel from '@/models/subject.model';
import mongoose from 'mongoose';

interface FacultyDashboardStats {
  assignedClassesCount: number;
  handlingSubjectsCount: number;
  unreadFeedbackCount: number;
}

export async function getFacultyDashboardStats(facultyId: string): Promise<FacultyDashboardStats> {
  if (!mongoose.Types.ObjectId.isValid(facultyId)) {
    console.error('Invalid faculty ID provided to getFacultyDashboardStats');
    return { assignedClassesCount: 0, handlingSubjectsCount: 0, unreadFeedbackCount: 0 };
  }

  try {
    await connectToDB();

    const facultyObjectId = new mongoose.Types.ObjectId(facultyId);

    const assignedClassesCountPromise = ClassModel.countDocuments({ inchargeFaculty: facultyObjectId });
    const handlingSubjectsCountPromise = SubjectModel.countDocuments({ facultyId: facultyObjectId });
    const unreadFeedbackCountPromise = FeedbackModel.countDocuments({ 
        facultyId: facultyObjectId,
        isRead: { $ne: true } 
    });

    const [assignedClassesCount, handlingSubjectsCount, unreadFeedbackCount] = await Promise.all([
      assignedClassesCountPromise,
      handlingSubjectsCountPromise,
      unreadFeedbackCountPromise,
    ]);

    return {
      assignedClassesCount,
      handlingSubjectsCount,
      unreadFeedbackCount
    };

  } catch (error) {
    console.error('Error fetching faculty dashboard stats:', error);
    return { assignedClassesCount: 0, handlingSubjectsCount: 0, unreadFeedbackCount: 0 };
  }
}

export type ClassInfo = { id: string; name: string; academicYear: string };
export async function getClassesInCharge(facultyId: string): Promise<ClassInfo[]> {
    if (!mongoose.Types.ObjectId.isValid(facultyId)) return [];
    try {
        await connectToDB();
        const classes = await ClassModel.find({ inchargeFaculty: new mongoose.Types.ObjectId(facultyId) })
            .select('name academicYear')
            .sort({ name: 1 })
            .lean();
        return classes.map(c => ({ id: c._id.toString(), name: c.name, academicYear: c.academicYear }));
    } catch (error) {
        console.error('Error fetching classes in charge:', error);
        return [];
    }
}

export type SubjectInfo = { id: string; name: string; code: string; className: string };
export async function getSubjectsHandled(facultyId: string): Promise<SubjectInfo[]> {
    if (!mongoose.Types.ObjectId.isValid(facultyId)) return [];
    try {
        await connectToDB();
        const subjects = await SubjectModel.find({ facultyId: new mongoose.Types.ObjectId(facultyId) })
            .populate('classId', 'name')
            .select('name code')
            .sort({ name: 1 })
            .lean();
        return subjects.map(s => ({
            id: s._id.toString(),
            name: s.name,
            code: s.code,
            className: (s.classId as any)?.name || 'N/A',
        }));
    } catch (error) {
        console.error('Error fetching subjects handled:', error);
        return [];
    }
}

export type FeedbackInfo = { id: string; text: string; date: string; subjectName: string; };
export async function getRecentFeedback(facultyId: string): Promise<FeedbackInfo[]> {
    if (!mongoose.Types.ObjectId.isValid(facultyId)) return [];
    try {
        await connectToDB();
        const feedback = await FeedbackModel.find({ 
            facultyId: new mongoose.Types.ObjectId(facultyId),
            isRead: { $ne: true }
        })
        .populate('subjectId', 'name')
        .select('feedbackText submittedDate')
        .sort({ submittedDate: -1 })
        .limit(20) // Limit to recent 20
        .lean();
        
        return feedback.map(f => ({
            id: f._id.toString(),
            text: f.feedbackText,
            date: f.submittedDate.toISOString(),
            subjectName: (f.subjectId as any)?.name || 'N/A',
        }));
    } catch (error) {
        console.error('Error fetching recent feedback:', error);
        return [];
    }
}
