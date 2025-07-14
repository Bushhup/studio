
'use server';

import { connectToDB } from '@/lib/mongoose';
import mongoose from 'mongoose';
import MarkModel from '@/models/mark.model';

export type SubjectPerformance = {
  subjectName: string;
  percentage: number;
};

export type PerformanceStats = {
  averageScore: number;
  bestSubject: string | null;
  subjectForImprovement: string | null;
  subjectWisePerformance: SubjectPerformance[];
};

export async function getStudentPerformance(studentId: string): Promise<PerformanceStats> {
  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    return { averageScore: 0, bestSubject: null, subjectForImprovement: null, subjectWisePerformance: [] };
  }

  try {
    await connectToDB();
    const studentObjectId = new mongoose.Types.ObjectId(studentId);

    const marksData = await MarkModel.aggregate([
      { $match: { studentId: studentObjectId } },
      {
        $lookup: {
          from: 'subjects',
          localField: 'subjectId',
          foreignField: '_id',
          as: 'subjectDetails'
        }
      },
      { $unwind: '$subjectDetails' },
      {
        $group: {
          _id: '$subjectId',
          subjectName: { $first: '$subjectDetails.name' },
          totalMarks: { $sum: '$marksObtained' },
          totalMaxMarks: { $sum: '$maxMarks' }
        }
      },
      {
        $project: {
          _id: 0,
          subjectName: 1,
          percentage: {
            $cond: [{ $eq: ['$totalMaxMarks', 0] }, 0, { $multiply: [{ $divide: ['$totalMarks', '$totalMaxMarks'] }, 100] }]
          }
        }
      }
    ]);

    if (marksData.length === 0) {
        return { averageScore: 0, bestSubject: null, subjectForImprovement: null, subjectWisePerformance: [] };
    }

    const totalPercentage = marksData.reduce((acc, curr) => acc + curr.percentage, 0);
    const averageScore = totalPercentage / marksData.length;

    let bestSubject: string | null = null;
    let subjectForImprovement: string | null = null;
    let maxPercentage = -1;
    let minPercentage = 101;

    marksData.forEach(subject => {
      if (subject.percentage > maxPercentage) {
        maxPercentage = subject.percentage;
        bestSubject = subject.subjectName;
      }
      if (subject.percentage < minPercentage) {
        minPercentage = subject.percentage;
        subjectForImprovement = subject.subjectName;
      }
    });
    
    // In case there's only one subject, it can't be both best and worst.
    if (marksData.length === 1) {
        subjectForImprovement = null;
    }


    return {
      averageScore: parseFloat(averageScore.toFixed(2)),
      bestSubject,
      subjectForImprovement,
      subjectWisePerformance: marksData.map(d => ({...d, percentage: parseFloat(d.percentage.toFixed(2))})),
    };

  } catch (error) {
    console.error('Error fetching student performance:', error);
    return { averageScore: 0, bestSubject: null, subjectForImprovement: null, subjectWisePerformance: [] };
  }
}
