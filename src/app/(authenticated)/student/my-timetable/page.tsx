
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getStudentTimetable, type StudentTimetable } from './actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, Coffee, BookOpen } from "lucide-react";

const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

export default function StudentTimetablePage() {
  const { data: session } = useSession();
  const studentId = session?.user?.id;
  const { toast } = useToast();

  const [timetable, setTimetable] = useState<StudentTimetable | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDay, setCurrentDay] = useState('');
  
  useEffect(() => {
    // Set current day on client mount
    const day = new Date().toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
    setCurrentDay(daysOfWeek.includes(day) ? day : 'monday');
  }, []);

  useEffect(() => {
    if (studentId) {
      setIsLoading(true);
      getStudentTimetable(studentId)
        .then(setTimetable)
        .catch(() => {
          toast({
            title: 'Error',
            description: 'Could not fetch your timetable data.',
            variant: 'destructive',
          });
        })
        .finally(() => setIsLoading(false));
    }
  }, [studentId, toast]);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center gap-3">
        <Calendar className="h-10 w-10 text-primary" />
        <div>
          <h1 className="font-headline text-4xl font-bold tracking-tight text-primary">My Timetable</h1>
          <p className="text-muted-foreground">Your weekly class schedule.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Class Schedule</CardTitle>
          <CardDescription>Here is your timetable for the week. Today is <span className="capitalize font-bold text-primary">{currentDay}</span>.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-10 h-96">
              <svg
                viewBox="0 0 24 24"
                className="h-8 w-8 animate-pulse theme-gradient-stroke"
                fill="none"
                stroke="url(#theme-gradient)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <defs>
                  <linearGradient id="theme-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor: 'hsl(var(--primary))'}} />
                    <stop offset="100%" style={{stopColor: 'hsl(var(--accent))'}} />
                  </linearGradient>
                </defs>
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
          ) : timetable && Object.keys(timetable).length > 0 ? (
             <div className="overflow-x-auto">
                <Table className="border min-w-full">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-40 border-r text-center">Time / Period</TableHead>
                            {daysOfWeek.map(day => (
                                <TableHead key={day} className={`text-center capitalize ${day === currentDay ? 'bg-primary/10' : ''}`}>{day}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {timetable[daysOfWeek[0]].map((_, periodIndex) => (
                           <TableRow key={periodIndex}>
                             <TableCell className="border-r font-medium text-center">
                                 <div className="flex items-center justify-center gap-2">
                                     {timetable.monday[periodIndex].isBreak ? (
                                        timetable.monday[periodIndex].subjectName === 'Break' ? <Coffee/> : <BookOpen/>
                                     ) : <Clock/>}
                                     <div>
                                         <p className="font-semibold">{timetable.monday[periodIndex].isBreak ? timetable.monday[periodIndex].subjectName : `Period ${timetable.monday[periodIndex].period < 3 ? timetable.monday[periodIndex].period : timetable.monday[periodIndex].period < 6 ? timetable.monday[periodIndex].period - 1 : timetable.monday[periodIndex].period - 2}`}</p>
                                         <p className="text-xs text-muted-foreground">{timetable.monday[periodIndex].time}</p>
                                     </div>
                                 </div>
                             </TableCell>
                             {daysOfWeek.map(day => {
                                const period = timetable[day][periodIndex];
                                return (
                                    <TableCell key={day} className={`text-center p-2 ${day === currentDay ? 'bg-primary/5' : ''}`}>
                                        {period.isBreak ? (
                                            <span className="italic text-muted-foreground">{period.subjectName}</span>
                                        ) : (
                                            <div>
                                                <p className="font-semibold">{period.subjectName}</p>
                                                <p className="text-xs text-muted-foreground">{period.facultyName}</p>
                                            </div>
                                        )}
                                    </TableCell>
                                )
                             })}
                           </TableRow>
                        ))}
                    </TableBody>
                </Table>
             </div>
          ) : (
             <p className="text-center text-muted-foreground py-10 h-96">No timetable found for your class. Please contact your administrator.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    