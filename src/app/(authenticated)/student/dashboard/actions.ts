
'use server';

import { connectToDB } from '@/lib/mongoose';
import mongoose from 'mongoose';
import AttendanceModel from '@/models/attendance.model';
import EventModel from '@/models/event.model';
import UserModel from '@/models/user.model';
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
        const marks = await getMyMarks(studentId);
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
