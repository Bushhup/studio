
'use server';

import { connectToDB } from '@/lib/mongoose';
import SubjectModel from '@/models/subject.model';
import UserModel from '@/models/user.model';
import mongoose from 'mongoose';

export async function getSubjectsForFaculty(facultyId: string) {
  if (!mongoose.Types.ObjectId.isValid(facultyId)) {
    return [];
  }
  try {
    await connectToDB();
    const facultyObjectId = new mongoose.Types.ObjectId(facultyId);
    
    const subjects = await SubjectModel.find({ facultyId: facultyObjectId })
      .populate('classId', 'name')
      .lean();
    
    return subjects.map(s => ({
      id: s._id.toString(),
      name: s.name,
      classId: (s.classId as any)._id.toString(),
      className: (s.classId as any).name,
    }));
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
        .select('name')
        .sort({ name: 1 })
        .lean();

    return students.map(student => ({
        id: student._id.toString(),
        name: student.name,
    }));

  } catch (error) {
     console.error("Error fetching students for class:", error);
    return [];
  }
}
