import { EventCard } from '@/components/event-card';
import type { AppEvent } from '@/types';
import { Separator } from '@/components/ui/separator';
import { CalendarClock } from 'lucide-react';

// Mock data for events, as MongoDB is being removed
const mockEvents: AppEvent[] = [
  {
    id: '1',
    title: 'Guest Lecture: AI in Modern Applications',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    description: 'Join us for an insightful guest lecture by Dr. Evalyn Quantum on the role of AI in today\'s technology landscape. Limited seats available.',
    type: 'lecture',
    image: 'https://placehold.co/600x400.png',
    dataAiHint: 'lecture presentation',
  },
  {
    id: '2',
    title: 'Department Fest "TechUtopia 2024"',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
    description: 'Annual department festival with coding competitions, project showcases, and fun events. Don\'t miss out!',
    type: 'fest',
    image: 'https://placehold.co/600x400.png',
    dataAiHint: 'technology festival',
  },
  {
    id: '3',
    title: 'Internship Fair - Summer Batch',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks from now
    description: 'Connect with leading tech companies for exciting internship opportunities for the upcoming summer batch. Pre-registration required.',
    type: 'internship_fair',
    image: 'https://placehold.co/600x400.png',
    dataAiHint: 'job fair',
  },
  {
    id: '4',
    title: 'Mid-Term Exam Schedule Released',
    date: new Date().toISOString(),
    description: 'The schedule for the upcoming mid-term examinations has been released. Please check the notice board or department website for details.',
    type: 'notice',
  },
];


async function getEvents(): Promise<AppEvent[]> {
  // Simulate fetching data
  // In a real scenario without a DB, this might come from a static JSON file or an external non-DB API
  return Promise.resolve(mockEvents);
}


export default async function HomePage() {
  const events = await getEvents();
  // Sort events by date (ascending - oldest first)
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
