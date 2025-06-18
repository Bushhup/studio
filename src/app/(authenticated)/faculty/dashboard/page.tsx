import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpenText, ClipboardList, ListChecks, MessageSquareText, Users } from "lucide-react";

export default function FacultyDashboardPage() {
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
            <CardTitle className="text-sm font-medium">Assigned Classes</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">MCA I, MCA II (A), MCA II (B)</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Marks Entry</CardTitle>
            <ClipboardList className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2 Subjects</div>
            <p className="text-xs text-muted-foreground">Unit Test 1 for OS & Algo</p>
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
          <Button variant="outline" className="justify-start text-left"><ClipboardList className="mr-2 h-4 w-4"/> Enter Marks</Button>
          <Button variant="outline" className="justify-start text-left"><ListChecks className="mr-2 h-4 w-4"/> Mark Attendance</Button>
          <Button variant="outline" className="justify-start text-left"><BookOpenText className="mr-2 h-4 w-4"/> Upload Material</Button>
          <Button variant="outline" className="justify-start text-left"><MessageSquareText className="mr-2 h-4 w-4"/> View Feedback</Button>
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
