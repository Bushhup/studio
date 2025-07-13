
'use server';

import { connectToDB } from '@/lib/mongoose';
import AttendanceModel from '@/models/attendance.model';
import mongoose from 'mongoose';

export type SubjectAttendance = {
    subjectId: string;
    subjectName: string;
    attended: number;
    total: number;
    percentage: number;
};

export async function getStudentAttendance(studentId: string): Promise<SubjectAttendance[]> {
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
        return [];
    }

    try {
        await connectToDB();
        const studentObjectId = new mongoose.Types.ObjectId(studentId);

        const attendanceData = await AttendanceModel.aggregate([
            {
                $match: { studentId: studentObjectId }
            },
            {
                $lookup: {
                    from: 'subjects', // The collection name for the Subject model
                    localField: 'subjectId',
                    foreignField: '_id',
                    as: 'subjectDetails'
                }
            },
            {
                $unwind: '$subjectDetails'
            },
            {
                $group: {
                    _id: '$subjectId',
                    subjectName: { $first: '$subjectDetails.name' },
                    total: { $sum: 1 },
                    attended: {
                        $sum: {
                            $cond: [{ $eq: ['$isPresent', true] }, 1, 0]
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    subjectId: '$_id',
                    subjectName: 1,
                    total: 1,
                    attended: 1,
                    percentage: {
                        $cond: [{ $eq: ['$total', 0] }, 0, { $multiply: [{ $divide: ['$attended', '$total'] }, 100] }]
                    }
                }
            },
            {
                $sort: { subjectName: 1 }
            }
        ]);

        return attendanceData.map(data => ({
            ...data,
            subjectId: data.subjectId.toString(),
            percentage: parseFloat(data.percentage.toFixed(2)),
        }));

    } catch (error) {
        console.error('Error fetching student attendance:', error);
        return [];
    }
}
