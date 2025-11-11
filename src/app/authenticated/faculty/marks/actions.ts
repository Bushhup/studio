
'use server';

import { connectToDB } from '@/lib/mongoose';
import SubjectModel from '@/models/subject.model';
import UserModel from '@/models/user.model';
import MarkModel from '@/models/mark.model';
import mongoose from 'mongoose';
import { revalidatePath } from 'next/cache';
import { ISubject } from '@/models/subject.model';

export async function getSubjectsForFaculty(facultyId: string) {
  if (!mongoose.Types.ObjectId.isValid(facultyId)) {
    return [];
  }
  try {
    await connectToDB();
    const facultyObjectId = new mongoose.Types.ObjectId(facultyId);
    
    const subjects = await SubjectModel.find({ facultyId: facultyObjectId })
      .populate<{ classId: { name: string } | null }>('classId', 'name')
      .lean<ISubject[]>();
    
    return subjects.map(s => {
      const classId = (s.classId as any)?._id;
      return {
        id: s._id.toString(),
        name: s.name,
        classId: classId ? classId.toString() : '',
        className: (s.classId as any)?.name || 'N/A',
      };
    });
  } catch (error) {
    console.error("Error fetching subjects for faculty:", error);
    return [];
  }
}

export async function getStudentsForClass(classId: string) {
   if (!mongoose.Types.ObjectId.isValid(classId)) {
    return [];
  }
  try {
    await connectToDB();
    const classObjectId = new mongoose.Types.ObjectId(classId);

    const students = await UserModel.find({ classId: classObjectId, role: 'student' })
        .select('name rollNo')
        .sort({ rollNo: 1, name: 1 })
        .lean();

    return students.map(student => ({
        id: student._id.toString(),
        name: student.name,
        rollNo: student.rollNo,
    }));

  } catch (error) {
     console.error("Error fetching students for class:", error);
    return [];
  }
}

export type MarkInput = {
  studentId: string;
  marksObtained: number | null;
  maxMarks: number | null;
}

export async function saveOrUpdateMarks(
  subjectId: string, 
  classId: string,
  assessmentName: string, 
  marks: MarkInput[]
): Promise<{success: boolean, message: string}> {
  if (!mongoose.Types.ObjectId.isValid(subjectId) || !mongoose.Types.ObjectId.isValid(classId)) {
    return { success: false, message: 'Invalid subject or class ID.' };
  }
  if (!assessmentName.trim()) {
    return { success: false, message: 'Assessment name is required.' };
  }

  try {
    await connectToDB();
    const subjectObjectId = new mongoose.Types.ObjectId(subjectId);
    const classObjectId = new mongoose.Types.ObjectId(classId);

    const operations = marks
      .filter(mark => mark.marksObtained !== null && mark.maxMarks !== null) // Only process entries with marks
      .map(mark => ({
        updateOne: {
          filter: { 
            studentId: new mongoose.Types.ObjectId(mark.studentId),
            subjectId: subjectObjectId,
            classId: classObjectId,
            assessmentName: assessmentName,
          },
          update: { 
            $set: { 
              marksObtained: mark.marksObtained, 
              maxMarks: mark.maxMarks 
            } 
          },
          upsert: true,
        }
    }));
    
    if (operations.length > 0) {
      await MarkModel.bulkWrite(operations);
    }
    
    revalidatePath('/authenticated/faculty/marks');
    revalidatePath('/authenticated/faculty/performance'); // Revalidate performance page as well
    return { success: true, message: 'Marks have been saved successfully.' };

  } catch (error) {
    console.error("Error saving marks:", error);
    if (error instanceof Error) {
        return { success: false, message: error.message };
    }
    return { success: false, message: 'An unknown error occurred while saving marks.' };
  }
}

export type ExistingMark = {
  studentId: string;
  marksObtained: number;
  maxMarks: number;
}
export async function getMarksForAssessment(
    subjectId: string, 
    classId: string, 
    assessmentName: string
): Promise<ExistingMark[]> {
    if (!mongoose.Types.ObjectId.isValid(subjectId) || !mongoose.Types.ObjectId.isValid(classId) || !assessmentName) {
        return [];
    }
    try {
        await connectToDB();
        const marks = await MarkModel.find({
            subjectId: new mongoose.Types.ObjectId(subjectId),
            classId: new mongoose.Types.ObjectId(classId),
            assessmentName
        }).lean();
        
        return marks.map(mark => ({
            studentId: mark.studentId.toString(),
            marksObtained: mark.marksObtained,
            maxMarks: mark.maxMarks
        }));
    } catch (error) {
        console.error("Error fetching marks for assessment:", error);
        return [];
    }
}

export async function getAssessmentsForSubject(subjectId: string, classId: string): Promise<string[]> {
    if (!mongoose.Types.ObjectId.isValid(subjectId) || !mongoose.Types.ObjectId.isValid(classId)) {
        return [];
    }
    try {
        await connectToDB();
        const assessments = await MarkModel.find({
            subjectId: new mongoose.Types.ObjectId(subjectId),
            classId: new mongoose.Types.ObjectId(classId)
        }).distinct('assessmentName');
        return assessments.sort();
    } catch (error) {
        console.error("Error fetching assessments:", error);
        return [];
    }
}
