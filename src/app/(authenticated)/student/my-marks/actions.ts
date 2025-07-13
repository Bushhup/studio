
'use server';

import { connectToDB } from '@/lib/mongoose';
import MarkModel, { IMark } from '@/models/mark.model';
import SubjectModel from '@/models/subject.model';
import mongoose from 'mongoose';

export type StudentMark = {
  id: string;
  subjectName: string;
  assessmentName: string;
  marksObtained: number;
  maxMarks: number;
  grade: string;
  date: string;
};

function calculateGrade(marksObtained: number, maxMarks: number): string {
    if (maxMarks === 0) return 'N/A';
    const percentage = (marksObtained / maxMarks) * 100;

    if (percentage >= 91) return 'O';
    if (percentage >= 81) return 'A+';
    if (percentage >= 71) return 'A';
    if (percentage >= 61) return 'B+';
    if (percentage >= 51) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage < 50) return 'U';
    return 'U';
}

export async function getMyMarks(studentId: string): Promise<StudentMark[]> {
  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    return [];
  }

  try {
    await connectToDB();
    const studentObjectId = new mongoose.Types.ObjectId(studentId);
    
    const marks = await MarkModel.find({ studentId: studentObjectId })
      .populate('subjectId', 'name')
      .sort({ date: -1 }) // Sort by most recent first
      .lean();

    return marks.map(mark => ({
      id: mark._id.toString(),
      subjectName: (mark.subjectId as any)?.name || 'Unknown Subject',
      assessmentName: mark.assessmentName,
      marksObtained: mark.marksObtained,
      maxMarks: mark.maxMarks,
      grade: calculateGrade(mark.marksObtained, mark.maxMarks),
      date: mark.date.toISOString(),
    }));

  } catch (error) {
    console.error('Error fetching marks for student:', error);
    return [];
  }
}
