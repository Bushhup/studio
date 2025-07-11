import { EventCard } from '@/components/event-card';
import type { AppEvent } from '@/types';
import { Separator } from '@/components/ui/separator';
import { CalendarClock } from 'lucide-react';
import { connectToDB } from '@/lib/mongoose';
import Event from '@/models/event.model';


async function getEvents(): Promise<AppEvent[]> {
  await connectToDB();
  try {
    const events = await Event.find({}).sort({ date: 'asc' }).lean();

    // The data from MongoDB needs to be serialized.
    // Also, MongoDB uses `_id` which we map to `id`.
    return events.map((event: any) => ({
      ...event,
      id: event._id.toString(),
      date: event.date.toISOString(),
      _id: undefined, // remove _id
      __v: undefined, // remove __v
    }));
  } catch (error) {
    console.error('Failed to fetch events:', error);
    return []; // Return an empty array on error
  }
}


export default async function HomePage() {
  const events = await getEvents();
  // The sorting is now done in the database query, but we can keep it here as a fallback.
  const sortedEvents = events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());


  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center gap-3">
        <CalendarClock className="h-10 w-10 text-primary" />
        <div>
          <h1 className="font-headline text-4xl font-bold tracking-tight text-primary">Department Events & Notices</h1>
          <p className="text-muted-foreground">Stay updated with the latest happenings in the department.</p>
        </div>
      </div>
      
      <div className="relative pl-8">
        {/* Vertical timeline bar */}
        {sortedEvents.length > 0 && <div className="absolute left-0 top-0 bottom-0 w-1 bg-border rounded-full ml-[calc(0.375rem-1px)]"></div>}

        {sortedEvents.map((event, index) => (
          <div key={event.id} className="mb-10 flex items-start">
            {/* Timeline Dot */}
            <div className="absolute left-0 z-10 h-3 w-3 rounded-full bg-primary ring-4 ring-background mt-1"></div>
            <div className="ml-4 flex-1"> {/* Indent content to the right of the dot */}
              <EventCard event={event} />
            </div>
          </div>
        ))}
      </div>

      {sortedEvents.length === 0 && (
        <div className="text-center py-10">
          <CalendarClock className="mx-auto h-16 w-16 text-muted-foreground" />
          <p className="mt-4 text-xl font-medium text-muted-foreground">No upcoming events or notices.</p>
          <p className="text-sm text-muted-foreground">Check back later for updates or contact admin if you believe this is an error.</p>
        </div>
      )}
    </div>
  );
}
