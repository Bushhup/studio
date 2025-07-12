
'use server';

import { connectToDB } from '@/lib/mongoose';
import Event from '@/models/event.model';
import UserModel from '@/models/user.model';
import ClassModel from '@/models/class.model';
import type { AppEvent, Role, User } from '@/types';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import mongoose from 'mongoose';

export async function getEventsForUser(userId: string, userRole: Role): Promise<AppEvent[]> {
  try {
    await connectToDB();

    let user: (User & { classId?: mongoose.Schema.Types.ObjectId }) | null = null;
    if (userId) {
        user = await UserModel.findById(userId).lean();
    }

    const query: any = {};

    if (userRole !== 'admin') {
      const userClassId = user?.classId;
      const userFacultyClasses = userRole === 'faculty' ? await ClassModel.find({ inchargeFaculty: userId }).select('_id').lean() : [];
      const userFacultyClassIds = userFacultyClasses.map(c => c._id);
      
      const orConditions: any[] = [
        { classIds: { $size: 0 } }, // Global events
        { classIds: { $exists: false } } // Or events where classIds is not set
      ];

      if (userClassId) {
        orConditions.push({ classIds: userClassId });
      }
      if (userRole === 'faculty') {
        orConditions.push({ inchargeFacultyId: new mongoose.Types.ObjectId(userId) }); // Events they are in charge of
        if (userFacultyClassIds.length > 0) {
            orConditions.push({ classIds: { $in: userFacultyClassIds } }); // Events for classes they manage
        }
      }
      query.$or = orConditions;
    }

    const events = await Event.find(query)
        .populate({ path: 'inchargeFacultyId', select: 'name' })
        .sort({ date: 'asc' })
        .lean();

    return events.map((event: any) => ({
      id: event._id.toString(),
      title: event.title,
      date: event.date.toISOString(),
      description: event.description,
      type: event.type,
      image: event.image,
      dataAiHint: event.dataAiHint,
      location: event.location,
      inchargeFacultyName: event.inchargeFacultyId ? (event.inchargeFacultyId as any).name : undefined,
    }));
  } catch (error) {
    console.error('Failed to fetch events:', error);
    return [];
  }
}

const eventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date format.' }),
  type: z.enum(['lecture', 'hackathon', 'fest', 'internship_fair', 'exam', 'notice']),
  location: z.string().min(3, 'Location is required.'),
  image: z.string().url().optional().or(z.literal('')),
  classIds: z.array(z.string()).optional(),
  inchargeFacultyId: z.string().optional(),
});

export type AddEventInput = z.infer<typeof eventSchema>;

export async function addEvent(data: AddEventInput): Promise<{ success: boolean; message: string }> {
    const validation = eventSchema.safeParse(data);
    if (!validation.success) {
      return { success: false, message: validation.error.errors.map(e => e.message).join(', ') };
    }

    try {
        await connectToDB();
        
        const isFacultyIdValid = data.inchargeFacultyId && data.inchargeFacultyId !== 'none' && mongoose.Types.ObjectId.isValid(data.inchargeFacultyId);
        
        const newEvent = new Event({
            ...data,
            date: new Date(data.date),
            classIds: data.classIds?.map(id => new mongoose.Types.ObjectId(id)) || [],
            inchargeFacultyId: isFacultyIdValid ? new mongoose.Types.ObjectId(data.inchargeFacultyId) : undefined,
            dataAiHint: `${data.type} ${data.title}` // Auto-generate a hint
        });

        await newEvent.save();

        revalidatePath('/home');

        return { success: true, message: 'Event added successfully.' };
    } catch (error) {
        console.error('Error adding event:', error);
        if (error instanceof Error) {
            return { success: false, message: error.message };
        }
        return { success: false, message: 'An unknown error occurred.' };
    }
}
