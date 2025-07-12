
'use server';

import { connectToDB } from '@/lib/mongoose';
import Event from '@/models/event.model';
import type { AppEvent } from '@/types';

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
    }));
  } catch (error) {
    console.error('Failed to fetch events:', error);
    return [];
  }
}
