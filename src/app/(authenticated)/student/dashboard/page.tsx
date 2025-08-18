
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, BarChart3, ShieldCheck, BookOpenText, Briefcase, MessageSquareText, CalendarDays } from "lucide-react";
import Link from "next/link";
import { useSession } from 'next-auth/react';
import { getStudentDashboardData } from "./actions";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

type DashboardData = {
    attendancePercentage: number;
    recentMarkText: string;
    upcomingEventsCount: number;
};

export default function StudentDashboardPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name || 'Student';
  const studentId = session?.user?.id;
  const userRole = session?.user?.role;
  const { toast } = useToast();

  const [dashboardData, setDashboardData] = useState<DashboardData>({
    attendancePercentage: 0,
    recentMarkText: "N/A",
    upcomingEventsCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
        if (studentId && userRole) {
            setIsLoading(true);
            try {
                const data = await getStudentDashboardData(studentId, userRole);
                setDashboardData(data);
            } catch (error) {
                toast({ title: "Error", description: "Failed to load dashboard data.", variant: "destructive"});
            } finally {
                setIsLoading(false);
            }
        }
    }
    fetchData();
  }, [studentId, userRole, toast]);
  
  const renderCardContent = (content: string | number, isLoading: boolean) => {
    if (isLoading) {
      return (
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
      )
    }
    return <div className="text-2xl font-bold">{content}</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary">Student Dashboard</h1>
          <p className="text-muted-foreground">Welcome, {userName}! Access your academic info and resources.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/student/my-attendance">
            <Card className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Attendance</CardTitle>
                <ShieldCheck className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                {renderCardContent(`${dashboardData.attendancePercentage.toFixed(1)}%`, isLoading)}
                <p className="text-xs text-muted-foreground">Based on all classes marked</p>
              </CardContent>
            </Card>
        </Link>

        <Link href="/student/my-marks">
            <Card className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Marks</CardTitle>
                <GraduationCap className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                {renderCardContent(dashboardData.recentMarkText, isLoading)}
                <p className="text-xs text-muted-foreground">Latest assessment score</p>
              </CardContent>
            </Card>
        </Link>
        
        <Link href="/home">
            <Card className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
                <CalendarDays className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {renderCardContent(dashboardData.upcomingEventsCount, isLoading)}
                <p className="text-xs text-muted-foreground">Notices & events for you</p>
              </CardContent>
            </Card>
        </Link>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">Quick Links</CardTitle>
          <CardDescription>Navigate to important sections easily.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button asChild variant="outline" className="justify-start text-left">
            <Link href="/student/my-marks"><GraduationCap className="mr-2 h-4 w-4"/> My Marks</Link>
          </Button>
          <Button asChild variant="outline" className="justify-start text-left">
            <Link href="/student/my-attendance"><ShieldCheck className="mr-2 h-4 w-4"/> My Attendance</Link>
          </Button>
          <Button asChild variant="outline" className="justify-start text-left">
            <Link href="/materials"><BookOpenText className="mr-2 h-4 w-4"/> Study Materials</Link>
          </Button>
          <Button asChild variant="outline" className="justify-start text-left">
            <Link href="/placements"><Briefcase className="mr-2 h-4 w-4"/> Placements</Link>
          </Button>
          <Button asChild variant="outline" className="justify-start text-left">
            <Link href="/feedback"><MessageSquareText className="mr-2 h-4 w-4"/> Submit Feedback</Link>
          </Button>
           <Button asChild variant="outline" className="justify-start text-left">
            <Link href="/student/my-performance"><BarChart3 className="mr-2 h-4 w-4"/> Performance</Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Recent Notifications</CardTitle>
            <CardDescription>Important updates and announcements.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
                <li className="flex justify-between p-2 rounded-md hover:bg-muted"><span>Marks for Unit Test 1 are published.</span> <span className="text-primary whitespace-nowrap">2 hours ago</span></li>
                <li className="flex justify-between p-2 rounded-md hover:bg-muted"><span>Reminder: AI Guest Lecture tomorrow.</span> <span className="text-primary whitespace-nowrap">1 day ago</span></li>
                <li className="flex justify-between p-2 rounded-md hover:bg-muted"><span>New study material for DSA uploaded.</span> <span className="text-primary whitespace-nowrap">3 days ago</span></li>
            </ul>
          </CardContent>
        </Card>
    </div>
  );
}
