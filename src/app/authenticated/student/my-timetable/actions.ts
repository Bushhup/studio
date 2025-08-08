
'use server';

import { connectToDB } from '@/lib/mongoose';
import TimetableModel from '@/models/timetable.model';
import UserModel from '@/models/user.model';
import SubjectModel from '@/models/subject.model';
import mongoose from 'mongoose';

export type TimetablePeriod = {
    period: number;
    time: string;
    subjectName: string | null;
    facultyName: string | null;
    isBreak: boolean;
};

export type StudentTimetable = {
    [day: string]: TimetablePeriod[];
};

const periodsConfig = [
    { name: 'Period 1', time: '09:00 - 09:50', isBreak: false },
    { name: 'Period 2', time: '09:50 - 10:40', isBreak: false },
    { name: 'Break', time: '10:40 - 11:00', isBreak: true },
    { name: 'Period 3', time: '11:00 - 11:50', isBreak: false },
    { name: 'Period 4', time: '11:50 - 12:40', isBreak: false },
    { name: 'Lunch', time: '12:40 - 01:30', isBreak: true },
    { name: 'Period 5', time: '01:30 - 02:15', isBreak: false },
    { name: 'Period 6', time: '02:15 - 03:00', isBreak: false },
    { name: 'Period 7', time: '03:00 - 03:45', isBreak: false },
    { name: 'Period 8', time: '03:45 - 04:30', isBreak: false },
];


export async function getStudentTimetable(studentId: string): Promise<StudentTimetable | null> {
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
        return null;
    }
    try {
        await connectToDB();

        const student = await UserModel.findById(studentId).select('classId').lean();
        if (!student || !student.classId) {
            return null;
        }

        const timetable = await TimetableModel.findOne({ classId: student.classId }).lean();
        if (!timetable) {
            return null;
        }

        // Get all unique subject IDs from the schedule to fetch their details in one go
        const subjectIds = new Set<string>();
        Object.values(timetable.schedule).forEach(daySchedule => {
            daySchedule.forEach(subjectId => {
                if (subjectId) subjectIds.add(subjectId.toString());
            });
        });

        const subjects = await SubjectModel.find({ _id: { $in: Array.from(subjectIds) } })
            .populate('facultyId', 'name')
            .lean();
        
        const subjectMap = new Map(subjects.map(s => [s._id.toString(), {
            name: s.name,
            facultyName: (s.facultyId as any)?.name || 'N/A'
        }]));
        
        const studentTimetable: StudentTimetable = {};

        for (const day of ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']) {
            studentTimetable[day] = [];
            let periodIndex = 0;
            for (let i = 0; i < periodsConfig.length; i++) {
                const config = periodsConfig[i];
                if (config.isBreak) {
                     studentTimetable[day].push({
                        period: i + 1,
                        time: config.time,
                        subjectName: config.name,
                        facultyName: null,
                        isBreak: true
                    });
                } else {
                    const subjectId = timetable.schedule[day]?.[periodIndex]?.toString();
                    const subjectDetails = subjectId ? subjectMap.get(subjectId) : null;
                    
                    studentTimetable[day].push({
                        period: i + 1,
                        time: config.time,
                        subjectName: subjectDetails?.name || 'Free Period',
                        facultyName: subjectDetails?.facultyName || null,
                        isBreak: false
                    });
                    periodIndex++;
                }
            }
        }
        
        return studentTimetable;

    } catch (error) {
        console.error("Error fetching student timetable:", error);
        return null;
    }
}
