
'use server';

import { connectToDB } from '@/lib/mongoose';
import ClassModel from '@/models/class.model';
import FeedbackModel, { IFeedback } from '@/models/feedback.model';
import SubjectModel, { ISubject } from '@/models/subject.model';
import TimetableModel, { ITimetable } from '@/models/timetable.model';
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
            .populate<{ classId: { name: string } }>('classId', 'name')
            .select('name code')
            .sort({ name: 1 })
            .lean();
        return subjects.map(s => ({
            id: s._id.toString(),
            name: s.name,
            code: s.code,
            className: s.classId?.name || 'N/A',
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
        .populate<{ subjectId: { name: string } }>('subjectId', 'name')
        .select('feedbackText submittedDate')
        .sort({ submittedDate: -1 })
        .limit(20) // Limit to recent 20
        .lean<IFeedback[]>();
        
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

export type FacultyScheduleItem = {
    day: string;
    periodIndex: number;
    time: string;
    className: string;
    subjectName: string;
};

export type FacultySchedule = Record<string, FacultyScheduleItem[]>;

const periods = [
    { name: 'Period 1', time: '09:00 - 09:50' }, { name: 'Period 2', time: '09:50 - 10:40' },
    { name: 'Break', time: '10:40 - 11:00' },
    { name: 'Period 3', time: '11:00 - 11:50' }, { name: 'Period 4', time: '11:50 - 12:40' },
    { name: 'Lunch', time: '12:40 - 01:30' },
    { name: 'Period 5', time: '01:30 - 02:15' }, { name: 'Period 6', time: '02:15 - 03:00' },
    { name: 'Period 7', time: '03:00 - 03:45' }, { name: 'Period 8', time: '03:45 - 04:30' },
];

export async function getFacultySchedule(facultyId: string): Promise<FacultySchedule> {
    if (!mongoose.Types.ObjectId.isValid(facultyId)) return {};
    try {
        await connectToDB();
        const facultyObjectId = new mongoose.Types.ObjectId(facultyId);

        const facultySubjects = await SubjectModel.find({ facultyId: facultyObjectId }).lean<ISubject[]>();
        const facultySubjectIds = facultySubjects.map(s => s._id.toString());
        const subjectMap = new Map(facultySubjects.map(s => [s._id.toString(), s.name]));

        const allTimetables = await TimetableModel.find().populate<{ classId: { name: string } }>('classId', 'name').lean<ITimetable[]>();

        const schedule: FacultySchedule = {};

        for (const tt of allTimetables) {
            const className = tt.classId?.name || 'Unknown Class';
            
            for (const [day, daySchedule] of Object.entries(tt.schedule)) {
                if (!Array.isArray(daySchedule)) continue;

                if (!schedule[day]) {
                    schedule[day] = [];
                }

                daySchedule.forEach((subjectId, periodIndex) => {
                    const subIdString = subjectId?.toString();
                    if (subIdString && facultySubjectIds.includes(subIdString)) {
                        let periodInfoIndex = periodIndex;
                        if (periodIndex >= 2) periodInfoIndex++; // Adjust for break
                        if (periodIndex >= 4) periodInfoIndex++; // Adjust for lunch

                        schedule[day].push({
                            day,
                            periodIndex: periodIndex,
                            time: periods[periodInfoIndex]?.time || 'N/A',
                            className: className,
                            subjectName: subjectMap.get(subIdString) || 'Unknown Subject',
                        });
                    }
                });
            }
        }
        
        // Sort periods within each day
        for (const day in schedule) {
            schedule[day].sort((a, b) => a.periodIndex - b.periodIndex);
        }

        return schedule;
    } catch (error) {
        console.error('Error fetching faculty schedule:', error);
        return {};
    }
}

    