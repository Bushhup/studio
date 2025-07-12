
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpenText, ClipboardList, ListChecks, MessageSquareText, Users, BookCopy } from "lucide-react";
import { getFacultyDashboardStats } from "./actions";
import { auth } from '@/lib/auth-options'; // Using server-side session
import Link from "next/link";


export default async function FacultyDashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;
  
  let stats = { assignedClassesCount: 0, handlingSubjectsCount: 0 };
  if (userId) {
    stats = await getFacultyDashboardStats(userId);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary">Faculty Dashboard</h1>
          <p className="text-muted-foreground">Manage your classes, students, and academic materials.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Classes In-Charge</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.assignedClassesCount}</div>
            <p className="text-xs text-muted-foreground">Total classes you are in-charge of</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subjects Handled</CardTitle>
            <BookCopy className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.handlingSubjectsCount}</div>
            <p className="text-xs text-muted-foreground">Total subjects you are handling</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Feedback</CardTitle>
            <MessageSquareText className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5 Unread</div>
            <p className="text-xs text-muted-foreground">Summaries available</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">Quick Actions</CardTitle>
          <CardDescription>Access your common tasks quickly.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button asChild variant="outline" className="justify-start text-left">
            <Link href="/faculty/marks"><ClipboardList className="mr-2 h-4 w-4"/> Enter Marks</Link>
          </Button>
          <Button asChild variant="outline" className="justify-start text-left">
            <Link href="/faculty/attendance"><ListChecks className="mr-2 h-4 w-4"/> Mark Attendance</Link>
          </Button>
           <Button asChild variant="outline" className="justify-start text-left">
             <Link href="/materials"><BookOpenText className="mr-2 h-4 w-4"/> Upload Material</Link>
          </Button>
          <Button asChild variant="outline" className="justify-start text-left">
            <Link href="/feedback"><MessageSquareText className="mr-2 h-4 w-4"/> View Feedback</Link>
          </Button>
        </CardContent>
      </Card>
       <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">My Schedule</CardTitle>
            <CardDescription>Your upcoming classes and events.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
                <li className="flex justify-between p-2 rounded-md hover:bg-muted"><span>MCA II (A) - Operating Systems</span> <span>10:00 AM - 11:00 AM</span></li>
                <li className="flex justify-between p-2 rounded-md hover:bg-muted"><span>MCA I - DSA</span> <span>11:00 AM - 12:00 PM</span></li>
                <li className="flex justify-between p-2 rounded-md hover:bg-muted"><span>Department Meeting</span> <span className="text-primary">02:00 PM</span></li>
            </ul>
          </CardContent>
        </Card>
    </div>
  );
}
