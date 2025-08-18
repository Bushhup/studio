
'use server';

import { connectToDB } from '@/lib/mongoose';
import TimetableModel from '@/models/timetable.model';
import SubjectModel from '@/models/subject.model';
import mongoose from 'mongoose';

export type TimetablePeriod = {
    period: number;
    time: string;
    subjectName: string | null;
    className: string | null;
    isBreak: boolean;
};

export type FacultyTimetable = {
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


export async function getFacultyTimetable(facultyId: string): Promise<FacultyTimetable | null> {
    if (!mongoose.Types.ObjectId.isValid(facultyId)) {
        return null;
    }
    try {
        await connectToDB();
        const facultyObjectId = new mongoose.Types.ObjectId(facultyId);

        // Find all subjects handled by this faculty
        const facultySubjects = await SubjectModel.find({ facultyId: facultyObjectId }).lean();
        if (facultySubjects.length === 0) {
            return {}; // Return empty schedule if faculty handles no subjects
        }
        const facultySubjectIds = facultySubjects.map(s => s._id.toString());
        const subjectMap = new Map(facultySubjects.map(s => [s._id.toString(), s.name]));

        // Fetch all timetables and populate class names
        const allTimetables = await TimetableModel.find().populate('classId', 'name').lean();
        
        const facultyTimetable: FacultyTimetable = {};
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

        // Initialize timetable structure
        days.forEach(day => {
            facultyTimetable[day] = periodsConfig.map((config, index) => {
                 if (config.isBreak) {
                    return {
                        period: index + 1,
                        time: config.time,
                        subjectName: config.name,
                        className: null,
                        isBreak: true
                    };
                }
                return {
                    period: index + 1,
                    time: config.time,
                    subjectName: 'Free Period',
                    className: null,
                    isBreak: false
                };
            });
        });

        // Fill in the schedule
        for (const tt of allTimetables) {
            const className = (tt.classId as any)?.name || 'Unknown Class';
            
            for (const day of days) {
                const daySchedule = tt.schedule[day];
                if (!Array.isArray(daySchedule)) continue;

                let periodCounter = 0; // To handle only non-break periods
                for(let i=0; i<periodsConfig.length; i++) {
                    if (periodsConfig[i].isBreak) continue;

                    const subjectId = daySchedule[periodCounter]?.toString();
                    if (subjectId && facultySubjectIds.includes(subjectId)) {
                        facultyTimetable[day][i] = {
                            period: i + 1,
                            time: periodsConfig[i].time,
                            subjectName: subjectMap.get(subjectId) || 'Unknown Subject',
                            className: className,
                            isBreak: false
                        };
                    }
                    periodCounter++;
                }
            }
        }
        
        return facultyTimetable;

    } catch (error) {
        console.error("Error fetching faculty timetable:", error);
        return null;
    }
}
