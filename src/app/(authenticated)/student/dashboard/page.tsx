
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, BarChart3, ShieldCheck, BookOpenText, Briefcase, MessageSquareText, CalendarDays } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/auth-options";

export default async function StudentDashboardPage() {
  const session = await auth();
  const userName = session?.user?.name || 'Student';

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary">Student Dashboard</h1>
          <p className="text-muted-foreground">Welcome, {userName}! Access your academic info and resources.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Attendance</CardTitle>
            <ShieldCheck className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">Last updated today</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Marks (Avg)</CardTitle>
            <GraduationCap className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78.5 / 100</div>
            <p className="text-xs text-muted-foreground">Unit Test 1</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <CalendarDays className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Guest lecture next week</p>
          </CardContent>
        </Card>
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
