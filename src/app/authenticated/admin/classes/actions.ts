
'use server';

import { connectToDB } from '@/lib/mongoose';
import ClassModel, { IClass } from '@/models/class.model';
import UserModel, { IUser } from '@/models/user.model';
import SubjectModel, { ISubject } from '@/models/subject.model';
import TimetableModel, { ITimetable } from '@/models/timetable.model';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';

const classSchema = z.object({
  name: z.string().min(3, "Class name must be at least 3 characters."),
  academicYear: z.string().regex(/^\d{4}-\d{4}$/, "Academic year must be in YYYY-YYYY format."),
  inchargeFaculty: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid faculty ID.",
  }),
});

export type ClassInput = z.infer<typeof classSchema>;

export async function createClass(data: ClassInput): Promise<{ success: boolean; message: string }> {
  try {
    const validation = classSchema.safeParse(data);
    if (!validation.success) {
      return { success: false, message: validation.error.errors.map(e => e.message).join(', ') };
    }

    await connectToDB();

    const facultyExists = await UserModel.findById(data.inchargeFaculty);
    if (!facultyExists) {
        return { success: false, message: "Selected in-charge faculty does not exist." };
    }

    const newClass = new ClassModel({
        ...data,
        inchargeFaculty: new mongoose.Types.ObjectId(data.inchargeFaculty)
    });
    await newClass.save();

    revalidatePath('/authenticated/admin/classes');

    return { success: true, message: `Class '${data.name}' created successfully.` };

  } catch (error) {
    console.error('Error creating class:', error);
    if (error instanceof Error && (error as any).code === 11000) {
        return { success: false, message: "A class with this name already exists." };
    }
    return { success: false, message: 'An unknown error occurred.' };
  }
}

export async function updateClass(classId: string, data: ClassInput): Promise<{ success: boolean; message: string }> {
  try {
      const validation = classSchema.safeParse(data);
      if (!validation.success) {
          return { success: false, message: validation.error.errors.map(e => e.message).join(', ') };
      }

      await connectToDB();

      if (!mongoose.Types.ObjectId.isValid(classId)) {
          return { success: false, message: "Invalid class ID." };
      }

      const facultyExists = await UserModel.findById(data.inchargeFaculty);
      if (!facultyExists) {
          return { success: false, message: "Selected in-charge faculty does not exist." };
      }

      const classToUpdate = await ClassModel.findById(classId);
      if (!classToUpdate) {
          return { success: false, message: "Class not found." };
      }

      classToUpdate.name = data.name;
      classToUpdate.academicYear = data.academicYear;
      classToUpdate.inchargeFaculty = new mongoose.Types.ObjectId(data.inchargeFaculty);

      await classToUpdate.save();

      revalidatePath('/authenticated/admin/classes');
      return { success: true, message: "Class updated successfully." };

  } catch (error) {
      console.error('Error updating class:', error);
      return { success: false, message: 'An unknown error occurred while updating the class.' };
  }
}

export async function deleteClass(classId: string): Promise<{ success: boolean; message: string }> {
  try {
      await connectToDB();

      if (!mongoose.Types.ObjectId.isValid(classId)) {
          return { success: false, message: "Invalid class ID." };
      }

      const studentCount = await UserModel.countDocuments({ classId: new mongoose.Types.ObjectId(classId) });
      if (studentCount > 0) {
          return { success: false, message: `Cannot delete class. There are ${studentCount} student(s) assigned to it.` };
      }

      await TimetableModel.deleteOne({ classId: new mongoose.Types.ObjectId(classId) });
      const result = await ClassModel.findByIdAndDelete(classId);

      if (!result) {
          return { success: false, message: "Class not found." };
      }

      revalidatePath('/authenticated/admin/classes');
      return { success: true, message: "Class deleted successfully." };
  } catch (error) {
      console.error('Error deleting class:', error);
      return { success: false, message: 'An unknown error occurred while deleting the class.' };
  }
}

export interface IClassWithFacultyAndStudentCount {
  id: string;
  name: string;
  academicYear: string;
  studentCount: number;
  inchargeFaculty: { id: string; name: string; } | null;
}


export async function getClasses(): Promise<IClassWithFacultyAndStudentCount[]> {
  try {
    await connectToDB();

    type PopulatedClass = Omit<IClass, 'inchargeFaculty'> & { 
        inchargeFaculty: { _id: mongoose.Types.ObjectId; name: string } | null 
    };

    const classes = await ClassModel.find()
        .populate('inchargeFaculty', 'name')
        .lean<PopulatedClass[]>();

    const classesWithDetails = await Promise.all(
      classes.map(async (c) => {
        const studentCount = await UserModel.countDocuments({ classId: c._id, role: 'student' });
        return {
          id: c._id.toString(),
          name: c.name,
          academicYear: c.academicYear,
          studentCount,
          inchargeFaculty: c.inchargeFaculty ? {
            id: c.inchargeFaculty._id.toString(),
            name: c.inchargeFaculty.name
          } : null
        };
      })
    );

    return classesWithDetails;
  } catch (error) {
    console.error('Error fetching classes:', error);
    return [];
  }
}


export async function getStudentsByClass(classId: string): Promise<Pick<IUser, 'id' | 'name' | 'rollNo' | 'avatar'>[]> {
  try {
      await connectToDB();
      if (!mongoose.Types.ObjectId.isValid(classId)) return [];

      type LeanStudent = {
        _id: mongoose.Types.ObjectId;
        name: string;
        rollNo?: string;
        avatar?: string;
      }
      const students = await UserModel.find({ classId: new mongoose.Types.ObjectId(classId), role: 'student' })
          .sort({ rollNo: 1, name: 1 })
          .select('_id name rollNo avatar')
          .lean<LeanStudent[]>();

      return students.map(s => ({
          id: s._id.toString(),
          name: s.name,
          rollNo: s.rollNo,
          avatar: s.avatar,
      }));

  } catch (error) {
      console.error(`Error fetching students for class ${classId}:`, error);
      return [];
  }
}

export type TimetableData = Record<string, (string | null)[]>;
export type SubjectForTimetable = { id: string; name: string };

export async function getSubjectsByClass(classId: string): Promise<SubjectForTimetable[]> {
  try {
      await connectToDB();
      if (!mongoose.Types.ObjectId.isValid(classId)) return [];

      const subjects = await SubjectModel.find({ classId: new mongoose.Types.ObjectId(classId) })
          .select('_id name')
          .lean<ISubject[]>();

      return subjects.map(s => ({
          id: s._id.toString(),
          name: s.name
      }));

  } catch (error) {
      console.error('Error fetching subjects for class:', error);
      return [];
  }
}

export async function getTimetable(classId: string): Promise<TimetableData | null> {
  try {
      await connectToDB();
      if (!mongoose.Types.ObjectId.isValid(classId)) return null;

      const timetable = await TimetableModel.findOne({ classId: new mongoose.Types.ObjectId(classId) }).lean<ITimetable>();
      if (!timetable) return null;

      const plainSchedule: TimetableData = {};
      for (const day in timetable.schedule) {
          plainSchedule[day] = timetable.schedule[day].map(subjectId => subjectId ? subjectId.toString() : null);
      }
      return plainSchedule;

  } catch (error) {
      console.error('Error fetching timetable:', error);
      return null;
  }
}

export async function saveTimetable(classId: string, schedule: TimetableData): Promise<{ success: boolean; message: string }> {
  try {
      await connectToDB();
      if (!mongoose.Types.ObjectId.isValid(classId)) return { success: false, message: 'Invalid Class ID' };

      const scheduleWithObjectIds: Record<string, (mongoose.Types.ObjectId | null)[]> = {};
      for (const day in schedule) {
        scheduleWithObjectIds[day] = schedule[day].map(id => id ? new mongoose.Types.ObjectId(id) : null);
      }

      await TimetableModel.findOneAndUpdate(
          { classId: new mongoose.Types.ObjectId(classId) },
          { schedule: scheduleWithObjectIds },
          { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      revalidatePath('/authenticated/admin/classes');
      return { success: true, message: 'Timetable saved successfully.' };

  } catch (error) {
      console.error('Error saving timetable:', error);
      return { success: false, message: 'An unknown error occurred.' };
  }
}
