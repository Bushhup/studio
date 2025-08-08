
'use server';

import { connectToDB } from '@/lib/mongoose';
import AttendanceModel from '@/models/attendance.model';
import mongoose from 'mongoose';
import { revalidatePath } from 'next/cache';

export type SubjectInfo = {
  id: string;
  name: string;
  classId: string;
  className: string;
};

export type StudentInfo = {
  id: string;
  name: string;
  rollNo?: string;
};

export type AttendanceRecord = Record<string, boolean>;

type SaveAttendanceInput = {
    subjectId: string;
    classId: string;
    date: string;
    period: string;
    attendance: {
        studentId: string;
        isPresent: boolean;
    }[];
}

export async function saveAttendance(input: SaveAttendanceInput): Promise<{ success: boolean, message: string }> {
    try {
        await connectToDB();

        const { subjectId, classId, date, period, attendance } = input;
        const attendanceDate = new Date(date);

        const operations = attendance.map(att => ({
            updateOne: {
                filter: {
                    studentId: new mongoose.Types.ObjectId(att.studentId),
                    subjectId: new mongoose.Types.ObjectId(subjectId),
                    date: attendanceDate,
                    period: period,
                },
                update: {
                    $set: {
                        classId: new mongoose.Types.ObjectId(classId),
                        isPresent: att.isPresent,
                    }
                },
                upsert: true,
            }
        }));

        if (operations.length > 0) {
            await AttendanceModel.bulkWrite(operations);
        }

        revalidatePath('/faculty/attendance');
        revalidatePath('/student/dashboard');
        revalidatePath('/student/my-attendance');

        return { success: true, message: 'Attendance recorded successfully.' };

    } catch (error) {
        console.error('Error saving attendance:', error);
        if (error instanceof Error) {
            return { success: false, message: error.message };
        }
        return { success: false, message: 'An unknown error occurred.' };
    }
}
