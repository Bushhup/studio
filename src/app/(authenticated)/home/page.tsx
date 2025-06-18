import { EventCard } from '@/components/event-card';
import type { AppEvent } from '@/types';
import { Separator } from '@/components/ui/separator';
import { CalendarClock } from 'lucide-react';

const mockEvents: AppEvent[] = [
  {
    id: '1',
    title: 'Guest Lecture: AI in Modern Software',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    description: 'Join us for an insightful session on the role of Artificial Intelligence in shaping modern software development practices. Led by Dr. Alan Turing.',
    type: 'lecture',
    image: 'https://placehold.co/600x300.png',
    dataAiHint: 'technology lecture'
  },
  {
    id: '2',
    title: 'DeptLink Hackathon 2024',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
    description: 'Annual departmental hackathon. Form teams and build innovative solutions. Exciting prizes to be won!',
    type: 'hackathon',
    image: 'https://placehold.co/600x300.png',
    dataAiHint: 'coding event'
  },
  {
    id: '3',
    title: 'Semester End Examinations Schedule',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks from now
    description: 'The schedule for the upcoming semester end examinations has been published. Please check the department notice board for details.',
    type: 'exam',
    image: 'https://placehold.co/600x300.png',
    dataAiHint: 'examination schedule'
  },
  {
    id: '4',
    title: 'Tech Fest "Innovate"',
    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 1 month from now
    description: 'Get ready for our annual tech fest "Innovate"! Featuring coding competitions, project showcases, and fun events.',
    type: 'fest',
    image: 'https://placehold.co/600x300.png',
    dataAiHint: 'technology festival'
  },
  {
    id: '5',
    title: 'Internship Fair - Summer 2024',
    date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), // 1.5 months from now
    description: 'Top companies are visiting for the Summer Internship Fair. Prepare your resumes and portfolios!',
    type: 'internship_fair',
    image: 'https://placehold.co/600x300.png',
    dataAiHint: 'career fair'
  },
  {
    id: '6',
    title: 'Important Notice: Library Closure',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    description: 'The central library will be closed for maintenance on the specified dates. Please plan accordingly.',
    type: 'notice',
    image: 'https://placehold.co/600x300.png',
    dataAiHint: 'library notice'
  }
];

// Sort events by date
const sortedEvents = mockEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());


export default function HomePage() {
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
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-border rounded-full ml-[calc(0.375rem-1px)]"></div>

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
          <p className="text-sm text-muted-foreground">Check back later for updates.</p>
        </div>
      )}
    </div>
  );
}
