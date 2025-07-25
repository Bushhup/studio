
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getStudentAttendance, type SubjectAttendance } from './actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, CalendarDays, GraduationCap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from '@/hooks/use-toast';

export default function StudentAttendancePage() {
  const { data: session } = useSession();
  const studentId = session?.user?.id;
  const { toast } = useToast();
  
  const [attendance, setAttendance] = useState<SubjectAttendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (studentId) {
      setIsLoading(true);
      getStudentAttendance(studentId)
        .then(setAttendance)
        .catch(() => {
          toast({
            title: 'Error',
            description: 'Could not fetch your attendance data.',
            variant: 'destructive',
          });
        })
        .finally(() => setIsLoading(false));
    }
  }, [studentId, toast]);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center gap-3">
        <ShieldCheck className="h-10 w-10 text-primary" />
        <div>
          <h1 className="font-headline text-4xl font-bold tracking-tight text-primary">My Attendance</h1>
          <p className="text-muted-foreground">View your attendance history and summary.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Attendance Summary</CardTitle>
          <CardDescription>Your attendance percentage for each subject.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
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
          ) : attendance.length > 0 ? (
            attendance.map((att, index) => (
              <div key={index}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{att.subjectName}</span>
                  <span className={`text-sm font-semibold ${att.percentage < 75 ? 'text-destructive' : 'text-primary'}`}>
                    {att.percentage.toFixed(1)}% ({att.attended}/{att.total})
                  </span>
                </div>
                <Progress value={att.percentage} aria-label={`${att.subjectName} attendance ${att.percentage.toFixed(1)}%`} />
              </div>
            ))
          ) : (
             <p className="text-center text-muted-foreground py-10">No attendance records found.</p>
          )}
        </CardContent>
      </Card>
      <Card className="mt-8">
        <CardHeader>
            <CardTitle>Daily Attendance Log (Coming Soon)</CardTitle>
            <CardDescription>Detailed day-wise attendance records.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex items-center justify-center h-24 text-muted-foreground">
                <CalendarDays className="mr-2 h-5 w-5" />
                <p>This section will show a calendar or list view of your daily attendance status.</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
