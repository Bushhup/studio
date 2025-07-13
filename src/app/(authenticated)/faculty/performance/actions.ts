
'use server';

import { connectToDB } from '@/lib/mongoose';
import mongoose from 'mongoose';
import MarkModel from '@/models/mark.model'; 

export type MarksDistributionData = {
  range: string;
  count: number;
};

export type StudentToWatch = {
    name: string;
    reason: string;
    trend: 'up' | 'down' | 'stable';
};

export type PerformanceData = {
    distribution: MarksDistributionData[];
    studentsToWatch: StudentToWatch[];
};


export async function getPerformanceDataForClass(classId: string, subjectId: string): Promise<PerformanceData> {
    if (!mongoose.Types.ObjectId.isValid(classId) || !mongoose.Types.ObjectId.isValid(subjectId)) {
        return { distribution: [], studentsToWatch: [] };
    }
    
    try {
        await connectToDB();
        const classObjectId = new mongoose.Types.ObjectId(classId);
        const subjectObjectId = new mongoose.Types.ObjectId(subjectId);

        const marks = await MarkModel.find({ classId: classObjectId, subjectId: subjectObjectId })
            .populate('studentId', 'name')
            .lean();

        if (marks.length === 0) {
            return { distribution: [], studentsToWatch: [] };
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
        
        // This will store the lowest score for each student
        const studentLowestScores: Record<string, { name: string; percentage: number; assessmentName: string }> = {};

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

                // Check if this is the student's lowest score so far for this subject
                if (!studentLowestScores[studentId] || percentage < studentLowestScores[studentId].percentage) {
                    studentLowestScores[studentId] = {
                        name: studentName,
                        percentage: percentage,
                        assessmentName: mark.assessmentName
                    };
                }
            }
        });
        
        const distributionData = Object.entries(distribution).map(([range, count]) => ({
            range,
            count,
        }));
        
        // Sort students by their lowest score and take the bottom 3
        const studentsToWatchData = Object.values(studentLowestScores)
            .sort((a, b) => a.percentage - b.percentage)
            .slice(0, 3) // Get the 3 students with the lowest scores
            .map(student => ({
                name: student.name,
                reason: `Score: ${student.percentage.toFixed(1)}% in '${student.assessmentName}'`,
                trend: 'down' as const,
            }));


        return { distribution: distributionData, studentsToWatch: studentsToWatchData };

    } catch (error) {
        console.error("Error fetching performance data:", error);
        return { distribution: [], studentsToWatch: [] };
    }
}
