
'use client';

import { useState, useEffect } from 'react';
import { EventCard } from '@/components/event-card';
import type { AppEvent } from '@/types';
import { CalendarClock, List, LayoutGrid, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getEvents } from './actions';


function EventListView({ events }: { events: AppEvent[] }) {
  return (
    <Card>
      <CardContent className="p-6">
        <ul className="space-y-4">
          {events.map(event => (
            <li key={event.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 rounded-md hover:bg-muted">
              <span className="font-medium">{event.title}</span>
              <span className="text-sm text-muted-foreground mt-1 sm:mt-0">
                {new Date(event.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}


export default function HomePage() {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline');

  useEffect(() => {
    async function fetchEvents() {
      setIsLoading(true);
      try {
        const fetchedEvents = await getEvents();
        const sortedEvents = fetchedEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setEvents(sortedEvents);
      } catch (error) {
          console.error('Failed to fetch events:', error);
          // Optionally, set an error state to show a message to the user
      } finally {
        setIsLoading(false);
      }
    }
    fetchEvents();
  }, []);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <CalendarClock className="h-10 w-10 text-primary" />
          <div>
            <h1 className="font-headline text-4xl font-bold tracking-tight text-primary">Department Events & Notices</h1>
            <p className="text-muted-foreground">Stay updated with the latest happenings in the department.</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => setViewMode(viewMode === 'timeline' ? 'list' : 'timeline')}>
          {viewMode === 'timeline' ? <List className="mr-2 h-4 w-4" /> : <LayoutGrid className="mr-2 h-4 w-4" />}
          {viewMode === 'timeline' ? 'List View' : 'Timeline View'}
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : events.length === 0 ? (
         <div className="text-center py-10">
          <CalendarClock className="mx-auto h-16 w-16 text-muted-foreground" />
          <p className="mt-4 text-xl font-medium text-muted-foreground">No upcoming events or notices.</p>
          <p className="text-sm text-muted-foreground">Check back later for updates or contact admin if you believe this is an error.</p>
        </div>
      ) : viewMode === 'timeline' ? (
        <div className="relative pl-8">
            {/* Vertical timeline bar */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-border rounded-full ml-[calc(0.375rem-1px)]"></div>

            {events.map((event) => (
            <div key={event.id} className="mb-10 flex items-start">
                {/* Timeline Dot */}
                <div className="absolute left-0 z-10 h-3 w-3 rounded-full bg-primary ring-4 ring-background mt-1"></div>
                <div className="ml-4 flex-1"> {/* Indent content to the right of the dot */}
                <EventCard event={event} />
                </div>
            </div>
            ))}
        </div>
      ) : (
         <EventListView events={events} />
      )}
    </div>
  );
}
