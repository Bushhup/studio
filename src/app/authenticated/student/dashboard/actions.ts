
'use server';

import { connectToDB } from '@/lib/mongoose';
import mongoose from 'mongoose';
import AttendanceModel from '@/models/attendance.model';
import EventModel from '@/models/event.model';
import UserModel from '@/models/user.model';
import MarkModel from '@/models/mark.model';
import StudyMaterialModel from '@/models/studyMaterial.model';
import { getMyMarks } from '../my-marks/actions';
import type { Role } from '@/types';

type StudentDashboardData = {
    attendancePercentage: number;
    recentMarkText: string;
    upcomingEventsCount: number;
};

export async function getStudentDashboardData(studentId: string, userRole: Role): Promise<StudentDashboardData> {
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
        return { attendancePercentage: 0, recentMarkText: 'N/A', upcomingEventsCount: 0 };
    }

    try {
        await connectToDB();
        const studentObjectId = new mongoose.Types.ObjectId(studentId);

        // --- Calculate Attendance ---
        const attendanceRecords = await AttendanceModel.find({ studentId: studentObjectId });
        const totalClasses = attendanceRecords.length;
        const attendedClasses = attendanceRecords.filter(rec => rec.isPresent).length;
        const attendancePercentage = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;

        // --- Get Recent Mark ---
        const marks = await getMyMarks(studentId); // This action sorts by date descending
        let recentMarkText = "N/A";
        if (marks.length > 0) {
            const mostRecentMark = marks[0];
            recentMarkText = `${mostRecentMark.marksObtained} / ${mostRecentMark.maxMarks}`;
        }
        
        // --- Get Upcoming Events Count ---
        const user = await UserModel.findById(studentObjectId).select('classId').lean();
        const userClassId = user?.classId;
        
        const eventQuery: any = { date: { $gte: new Date() } };
        const orConditions: any[] = [
            // Global events (no target classes OR empty array)
            { classIds: { $exists: false } },
            { classIds: { $size: 0 } },
        ];
        if (userClassId) {
             orConditions.push({ classIds: userClassId });
        }
        eventQuery.$or = orConditions;
        
        const upcomingEventsCount = await EventModel.countDocuments(eventQuery);


        return {
            attendancePercentage,
            recentMarkText,
            upcomingEventsCount,
        };

    } catch (error) {
        console.error('Error fetching student dashboard data:', error);
        return { attendancePercentage: 0, recentMarkText: 'N/A', upcomingEventsCount: 0 };
    }
}


export type Notification = {
    id: string;
    message: string;
    date: Date;
    type: 'mark' | 'event' | 'material';
};

export async function getRecentNotifications(studentId: string): Promise<Notification[]> {
    if (!mongoose.Types.ObjectId.isValid(studentId)) return [];

    try {
        await connectToDB();
        const studentObjectId = new mongoose.Types.ObjectId(studentId);
        const user = await UserModel.findById(studentObjectId).select('classId').lean();

        // 1. Get most recent mark
        const lastMarkPromise = MarkModel.findOne({ studentId: studentObjectId })
            .sort({ date: -1 })
            .populate('subjectId', 'name')
            .lean();

        // 2. Get nearest upcoming event
        const eventQuery: any = { date: { $gte: new Date() } };
        if (user?.classId) {
            eventQuery.$or = [
                { classIds: { $size: 0 } },
                { classIds: { $exists: false } },
                { classIds: user.classId }
            ];
        } else {
             eventQuery.$or = [
                { classIds: { $size: 0 } },
                { classIds: { $exists: false } },
            ];
        }
        const nextEventPromise = EventModel.findOne(eventQuery).sort({ date: 'asc' }).lean();

        // 3. Get most recent study material
        const lastMaterialPromise = StudyMaterialModel.findOne({}).sort({ uploadDate: -1 }).lean();
        
        const [lastMark, nextEvent, lastMaterial] = await Promise.all([lastMarkPromise, nextEventPromise, lastMaterialPromise]);

        const notifications: Notification[] = [];

        if (lastMark) {
            notifications.push({
                id: `mark-${lastMark._id.toString()}`,
                message: `Marks for '${(lastMark.subjectId as any).name}' have been published.`,
                date: lastMark.date,
                type: 'mark',
            });
        }
        if (nextEvent) {
             notifications.push({
                id: `event-${nextEvent._id.toString()}`,
                message: `Upcoming event: '${nextEvent.title}' is scheduled.`,
                date: nextEvent.date,
                type: 'event',
            });
        }
        if (lastMaterial) {
             notifications.push({
                id: `material-${lastMaterial._id.toString()}`,
                message: `New material added for '${lastMaterial.subject}': ${lastMaterial.title}.`,
                date: lastMaterial.uploadDate,
                type: 'material',
            });
        }
        
        return notifications.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 3);

    } catch (error) {
        console.error('Error fetching student notifications:', error);
        return [];
    }
}
