
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
};


export async function getPerformanceDataForClass(classId: string, subjectId: string): Promise<PerformanceData> {
    if (!mongoose.Types.ObjectId.isValid(classId) || !mongoose.Types.ObjectId.isValid(subjectId)) {
        return { distribution: [], studentsToWatch: [], topPerformers: [] };
    }
    
    try {
        await connectToDB();
        const classObjectId = new mongoose.Types.ObjectId(classId);
        const subjectObjectId = new mongoose.Types.ObjectId(subjectId);

        const marks = await MarkModel.find({ classId: classObjectId, subjectId: subjectObjectId })
            .populate('studentId', 'name')
            .lean();

        if (marks.length === 0) {
            return { distribution: [], studentsToWatch: [], topPerformers: [] };
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
            if (mark.studentId && (mark.studentId as any).name && mark.marksObtained != null && mark.maxMarks != null && mark.maxMarks > 0) {
                const percentage = (mark.marksObtained / mark.maxMarks) * 100;
                const studentId = (mark.studentId as any)._id.toString();
                const studentName = (mark.studentId as any).name;

                // Populate distribution chart data
                if (percentage < 40) distribution['0-39 (Fail)']++;
                else if (percentage < 50) distribution['40-49']++;
                else if (percentage < 60) distribution['50-59']++;
                else if (percentage < 70) distribution['60-69']++;
                else if (percentage < 80) distribution['70-79']++;
                else if (percentage < 90) distribution['80-89']++;
                else distribution['90-100']++;

                // Group all scores by student
                if (!studentMarks[studentId]) {
                    studentMarks[studentId] = { name: studentName, scores: [] };
                }
                studentMarks[studentId].scores.push({ assessment: mark.assessmentName, percentage });
            }
        });
        
        const distributionData = Object.entries(distribution).map(([range, count]) => ({
            range,
            count,
        }));
        
        const studentsToWatch: StudentPerformanceInfo[] = [];
        const topPerformers: StudentPerformanceInfo[] = [];

        Object.values(studentMarks).forEach(student => {
            // Check for low scores
            const lowScore = student.scores.find(s => s.percentage < 50);
            if (lowScore) {
                studentsToWatch.push({
                    name: student.name,
                    reason: `Scored ${lowScore.percentage.toFixed(1)}% in '${lowScore.assessment}'`,
                    trend: 'down',
                });
            }

            // Check for high scores
            const highScore = student.scores.find(s => s.percentage > 90);
             if (highScore) {
                topPerformers.push({
                    name: student.name,
                    reason: `Scored ${highScore.percentage.toFixed(1)}% in '${highScore.assessment}'`,
                    trend: 'up',
                });
            }
        });

        // Sort the lists, but do not limit them
        const sortedStudentsToWatch = studentsToWatch.sort((a,b) => parseFloat(a.reason.split('%')[0].split(' ').pop()!) - parseFloat(b.reason.split('%')[0].split(' ').pop()!));
        const sortedTopPerformers = topPerformers.sort((a,b) => parseFloat(b.reason.split('%')[0].split(' ').pop()!) - parseFloat(a.reason.split('%')[0].split(' ').pop()!));


        return { 
            distribution: distributionData, 
            studentsToWatch: sortedStudentsToWatch,
            topPerformers: sortedTopPerformers
        };

    } catch (error) {
        console.error("Error fetching performance data:", error);
        return { distribution: [], studentsToWatch: [], topPerformers: [] };
    }
}
