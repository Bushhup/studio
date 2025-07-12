
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EventCard } from '@/components/event-card';
import type { AppEvent, IClass, IUser } from '@/types';
import { CalendarClock, List, LayoutGrid, Loader2, Plus, Calendar as CalendarIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { getEventsForUser, addEvent, AddEventInput } from './actions';
import { getClasses } from '../admin/classes/actions';
import { getUsersByRole } from '../admin/users/actions';
import { useMockAuth } from '@/hooks/use-mock-auth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';


function EventListView({ events }: { events: AppEvent[] }) {
  return (
    <Card>
      <CardContent className="p-6">
        <ul className="space-y-4">
          {events.map(event => (
            <li key={event.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 rounded-md hover:bg-muted">
              <div>
                <p className="font-medium">{event.title}</p>
                <p className="text-sm text-muted-foreground">{event.location}</p>
              </div>
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

const eventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  date: z.date({ required_error: "A date is required." }),
  type: z.enum(['lecture', 'hackathon', 'fest', 'internship_fair', 'exam', 'notice']),
  location: z.string().min(3, 'Location is required.'),
  image: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  classIds: z.array(z.string()).optional(),
  inchargeFacultyId: z.string().optional(),
});

function AddEventForm({ 
    setIsOpen, 
    onEventAdded,
    classes,
    faculty
}: { 
    setIsOpen: (open: boolean) => void, 
    onEventAdded: () => void,
    classes: Pick<IClass, 'id' | 'name'>[],
    faculty: Pick<IUser, 'id' | 'name'>[]
}) {
    const { toast } = useToast();
    const form = useForm<z.infer<typeof eventSchema>>({
        resolver: zodResolver(eventSchema),
        defaultValues: {
            title: "",
            description: "",
            location: "",
            image: "",
            classIds: [],
        }
    });
    
    async function onSubmit(values: z.infer<typeof eventSchema>) {
        const result = await addEvent({
            ...values,
            date: values.date.toISOString(),
        });

        if (result.success) {
            toast({ title: "Success", description: result.message });
            onEventAdded();
            setIsOpen(false);
        } else {
            toast({ title: "Error", description: result.message, variant: "destructive" });
        }
    }
    
    const selectedClasses = form.watch('classIds') || [];
    const classMap = new Map(classes.map(c => [c.id, c.name]));

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
                <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem><FormLabel>Event Title</FormLabel><FormControl><Input placeholder="e.g., AI Workshop" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Describe the event..." {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="location" render={({ field }) => (
                    <FormItem><FormLabel>Location</FormLabel><FormControl><Input placeholder="e.g., Seminar Hall" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <FormField control={form.control} name="type" render={({ field }) => (
                        <FormItem><FormLabel>Event Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select a type" /></SelectTrigger></FormControl>
                            <SelectContent>
                                {['lecture', 'hackathon', 'fest', 'internship_fair', 'exam', 'notice'].map(type => (
                                    <SelectItem key={type} value={type} className="capitalize">{type.replace('_', ' ')}</SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        <FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="date" render={({ field }) => (
                        <FormItem className="flex flex-col"><FormLabel>Event Date & Time</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                </PopoverContent>
                            </Popover>
                        <FormMessage /></FormItem>
                    )} />
                </div>
                
                 <FormField control={form.control} name="classIds" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Assign to Classes (Optional)</FormLabel>
                         <FormControl>
                            <Popover>
                                <PopoverTrigger asChild>
                                     <Button variant="outline" className="w-full justify-start text-left font-normal">
                                        <div className="truncate">
                                            {selectedClasses.length > 0 ? selectedClasses.map(id => classMap.get(id)).join(', ') : "Select classes..."}
                                        </div>
                                     </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search classes..." />
                                        <CommandList>
                                            <CommandEmpty>No results found.</CommandEmpty>
                                            <CommandGroup>
                                                {classes.map((cls) => {
                                                    const isSelected = selectedClasses.includes(cls.id);
                                                    return (
                                                        <CommandItem
                                                            key={cls.id}
                                                            onSelect={() => {
                                                                const newSelection = isSelected 
                                                                    ? selectedClasses.filter(id => id !== cls.id)
                                                                    : [...selectedClasses, cls.id];
                                                                field.onChange(newSelection);
                                                            }}
                                                        >
                                                            <div className={cn("mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary", isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible")}>
                                                                <Check className="h-4 w-4" />
                                                            </div>
                                                            <span>{cls.name}</span>
                                                        </CommandItem>
                                                    )
                                                })}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                         </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                <FormField control={form.control} name="inchargeFacultyId" render={({ field }) => (
                    <FormItem><FormLabel>In-charge Faculty (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select faculty" /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {faculty.map(f => (
                                <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    <FormMessage /></FormItem>
                )} />

                 <FormField control={form.control} name="image" render={({ field }) => (
                    <FormItem><FormLabel>Image URL (Optional)</FormLabel><FormControl><Input placeholder="https://placehold.co/600x400.png" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Add Event
                    </Button>
                </DialogFooter>
            </form>
        </Form>
    );
}

// Needed for multi-select popover
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check } from "lucide-react";


export default function HomePage() {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline');
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const { role, user } = useMockAuth();

  const [allClasses, setAllClasses] = useState<Pick<IClass, 'id' | 'name'>[]>([]);
  const [allFaculty, setAllFaculty] = useState<Pick<IUser, 'id' | 'name'>[]>([]);

  const fetchPageData = async () => {
    if (!user || !role) return;
    setIsLoading(true);
    try {
      const fetchedEvents = await getEventsForUser(user.id, role);
      const sortedEvents = fetchedEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setEvents(sortedEvents);
    } catch (error) {
        console.error('Failed to fetch events:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPageData();
  }, [user, role]);

  useEffect(() => {
    if (isAddEventOpen && role === 'admin') {
      Promise.all([
        getClasses(),
        getUsersByRole('faculty'),
      ]).then(([classes, faculty]) => {
        setAllClasses(classes.map(c => ({ id: c.id, name: c.name })));
        setAllFaculty(faculty);
      });
    }
  }, [isAddEventOpen, role]);

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
      
      {role === 'admin' && (
         <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
            <DialogTrigger asChild>
                <Button className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-lg" size="icon">
                    <Plus className="h-8 w-8" />
                    <span className="sr-only">Add New Event</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                    <DialogTitle className="font-headline">Add New Event</DialogTitle>
                    <DialogDescription>Fill in the details for the new event or notice.</DialogDescription>
                </DialogHeader>
                <AddEventForm 
                    setIsOpen={setIsAddEventOpen} 
                    onEventAdded={fetchPageData}
                    classes={allClasses}
                    faculty={allFaculty}
                />
            </DialogContent>
         </Dialog>
      )}

    </div>
  );
}
