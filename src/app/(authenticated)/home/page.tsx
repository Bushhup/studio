import { EventCard } from '@/components/event-card';
import type { AppEvent, EventDocument } from '@/types';
import { Separator } from '@/components/ui/separator';
import { CalendarClock } from 'lucide-react';
import { connectToDatabase } from '@/lib/mongodb';
import type { Collection, WithId } from 'mongodb';

async function getEvents(): Promise<AppEvent[]> {
  try {
    const db = await connectToDatabase();
    const eventsCollection: Collection<EventDocument> = db.collection<EventDocument>('events');
    
    const eventDocuments = await eventsCollection.find({}).sort({ date: 1 }).toArray();
    
    return eventDocuments.map((doc: WithId<EventDocument>) => ({
      id: doc._id.toString(),
      title: doc.title,
      date: doc.date.toISOString(), // Convert BSON Date to ISO string
      description: doc.description,
      type: doc.type,
      image: doc.image,
      dataAiHint: doc.dataAiHint,
    }));
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return []; // Return empty array on error
  }
}


export default async function HomePage() {
  const events = await getEvents();
  // Sort events by date (descending - newest first, or ascending - oldest first as per requirement)
  // MongoDB sort should handle this, but client-side sort can be a fallback or refinement
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
