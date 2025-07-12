
'use server';

import { connectToDB } from '@/lib/mongoose';
import Event from '@/models/event.model';
import type { AppEvent } from '@/types';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export async function getEvents(): Promise<AppEvent[]> {
  try {
    await connectToDB();
    const events = await Event.find({}).sort({ date: 'asc' }).lean();

    // lean() returns plain JS objects, so we just need to format the _id and date
    return events.map((event: any) => ({
      id: event._id.toString(),
      title: event.title,
      date: event.date.toISOString(),
      description: event.description,
      type: event.type,
      image: event.image,
      dataAiHint: event.dataAiHint,
      location: event.location,
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
});

export type AddEventInput = z.infer<typeof eventSchema>;

export async function addEvent(data: AddEventInput): Promise<{ success: boolean; message: string }> {
    const validation = eventSchema.safeParse(data);
    if (!validation.success) {
      return { success: false, message: validation.error.errors.map(e => e.message).join(', ') };
    }

    try {
        await connectToDB();
        
        const newEvent = new Event({
            ...data,
            date: new Date(data.date),
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
