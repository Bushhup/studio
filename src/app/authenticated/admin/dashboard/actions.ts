
'use server';

import { connectToDB } from '@/lib/mongoose';
import Event from '@/models/event.model';
import type { AppEvent } from '@/types';

export async function getUpcomingEvents(): Promise<Pick<AppEvent, 'id' | 'title' | 'date'>[]> {
    try {
        await connectToDB();

        const events = await Event.find({ date: { $gte: new Date() } })
            .sort({ date: 'asc' })
            .select('title date')
            .lean();

        return events.map((event: any) => ({
            id: event._id.toString(),
            title: event.title,
            date: event.date.toISOString(),
        }));
    } catch (error) {
        console.error('Failed to fetch upcoming events:', error);
        return [];
    }
}
