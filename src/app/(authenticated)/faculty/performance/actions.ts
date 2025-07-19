
'use server';

import { connectToDB } from '@/lib/mongoose';
import mongoose from 'mongoose';
import MarkModel from '@/models/mark.model'; 

export type MarksDistributionData = {
  range: string;
  count: number;
};

export type StudentPerformanceInfo = {
    name: string;
    reason: string;
    trend: 'up' | 'down' | 'stable';
};

export type PerformanceData = {
    distribution: MarksDistributionData[];
    studentsToWatch: StudentPerformanceInfo[];
    topPerformers: StudentPerformanceInfo[];
    averagePerformers: StudentPerformanceInfo[];
};


export async function getPerformanceDataForClass(classId: string, subjectId: string): Promise<PerformanceData> {
    if (!mongoose.Types.ObjectId.isValid(classId) || !mongoose.Types.ObjectId.isValid(subjectId)) {
        return { distribution: [], studentsToWatch: [], topPerformers: [], averagePerformers: [] };
    }
    
    try {
        await connectToDB();
        const classObjectId = new mongoose.Types.ObjectId(classId);
        const subjectObjectId = new mongoose.Types.ObjectId(subjectId);

        const marks = await MarkModel.find({ classId: classObjectId, subjectId: subjectObjectId })
            .populate('studentId', 'name')
            .lean();

        if (marks.length === 0) {
            return { distribution: [], studentsToWatch: [], topPerformers: [], averagePerformers: [] };
        }

        const distribution: Record<string, number> = {
            '0-39 (Fail)': 0,
            '40-49': 0,
            '50-59': 0,
            '60-69': 0,
            '70-79': 0,
            '80-89': 0,
            '90-100': 0,
        };
        
        const studentMarks: Record<string, { name: string; scores: { assessment: string; percentage: number }[] }> = {};

        marks.forEach(mark => {
            // This is the critical fix: `studentId` is an object after `populate`.
            // We need to handle it as an object to get the ID and name.
            if (mark.studentId && typeof mark.studentId === 'object' && 'name' in mark.studentId && '_id' in mark.studentId) {
                const studentIdStr = (mark.studentId as any)._id.toString();
                const studentName = (mark.studentId as any).name;

                if (mark.marksObtained != null && mark.maxMarks != null && mark.maxMarks > 0) {
                    const percentage = (mark.marksObtained / mark.maxMarks) * 100;

                    // Populate distribution chart data
                    if (percentage < 40) distribution['0-39 (Fail)']++;
                    else if (percentage < 50) distribution['40-49']++;
                    else if (percentage < 60) distribution['50-59']++;
                    else if (percentage < 70) distribution['60-69']++;
                    else if (percentage < 80) distribution['70-79']++;
                    else if (percentage < 90) distribution['80-89']++;
                    else distribution['90-100']++;

                    // Group all scores by student
                    if (!studentMarks[studentIdStr]) {
                        studentMarks[studentIdStr] = { name: studentName, scores: [] };
                    }
                    studentMarks[studentIdStr].scores.push({ assessment: mark.assessmentName, percentage });
                }
            }
        });
        
        const distributionData = Object.entries(distribution).map(([range, count]) => ({
            range,
            count,
        }));
        
        const studentsToWatch: StudentPerformanceInfo[] = [];
        const topPerformers: StudentPerformanceInfo[] = [];
        const averagePerformers: StudentPerformanceInfo[] = [];

        Object.values(studentMarks).forEach(student => {
            student.scores.forEach(score => {
                if (score.percentage < 50) {
                    studentsToWatch.push({
                        name: student.name,
                        reason: `Scored ${score.percentage.toFixed(1)}% in '${score.assessment}'`,
                        trend: 'down',
                    });
                } else if (score.percentage >= 90) {
                    topPerformers.push({
                        name: student.name,
                        reason: `Scored ${score.percentage.toFixed(1)}% in '${score.assessment}'`,
                        trend: 'up',
                    });
                } else {
                    averagePerformers.push({
                        name: student.name,
                        reason: `Scored ${score.percentage.toFixed(1)}% in '${score.assessment}'`,
                        trend: 'stable',
                    });
                }
            });
        });

        // Sort the lists to show most critical/highest first
        const sortedStudentsToWatch = studentsToWatch.sort((a,b) => parseFloat(a.reason.split('%')[0].split(' ').pop()!) - parseFloat(b.reason.split('%')[0].split(' ').pop()!));
        const sortedTopPerformers = topPerformers.sort((a,b) => parseFloat(b.reason.split('%')[0].split(' ').pop()!) - parseFloat(a.reason.split('%')[0].split(' ').pop()!));
        const sortedAveragePerformers = averagePerformers.sort((a,b) => parseFloat(b.reason.split('%')[0].split(' ').pop()!) - parseFloat(a.reason.split('%')[0].split(' ').pop()!));


        return { 
            distribution: distributionData, 
            studentsToWatch: sortedStudentsToWatch,
            topPerformers: sortedTopPerformers,
            averagePerformers: sortedAveragePerformers
        };

    } catch (error) {
        console.error("Error fetching performance data:", error);
        return { distribution: [], studentsToWatch: [], topPerformers: [], averagePerformers: [] };
    }
}
