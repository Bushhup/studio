
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

        // No need to fetch user if we have userId and role, except for student's classId
        let userClassId: mongoose.Types.ObjectId | null = null;
        if (userRole === 'student') {
            const user = await UserModel.findById(userId).select('classId').lean();
            if (user && user.classId) {
                userClassId = user.classId;
            }
        }
        
        const query: any = {};

        if (userRole !== 'admin') {
            const orConditions: any[] = [
                // Global events (no classes assigned)
                { classIds: { $exists: false } },
                { classIds: { $size: 0 } },
            ];

            if (userRole === 'student' && userClassId) {
                orConditions.push({ classIds: userClassId });
            }

            if (userRole === 'faculty') {
                const facultyObjectId = new mongoose.Types.ObjectId(userId);
                // Events where faculty is personally in-charge
                orConditions.push({ inchargeFacultyId: facultyObjectId });
                
                // Find classes where this faculty is the in-charge
                const facultyClasses = await ClassModel.find({ inchargeFaculty: facultyObjectId }).select('_id').lean();
                const facultyClassIds = facultyClasses.map(c => c._id);
                
                if (facultyClassIds.length > 0) {
                    orConditions.push({ classIds: { $in: facultyClassIds } });
                }
            }
            
            query.$or = orConditions;
        }

        const events = await Event.find(query)
            .populate({ path: 'inchargeFacultyId', select: 'name', model: 'User' })
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
  image: z.string().optional().or(z.literal('')),
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
