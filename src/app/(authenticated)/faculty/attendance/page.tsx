import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListChecks, CalendarPlus } from "lucide-react";

export default function FacultyAttendancePage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center gap-3">
        <ListChecks className="h-10 w-10 text-primary" />
        <div>
          <h1 className="font-headline text-4xl font-bold tracking-tight text-primary">Attendance Tracking</h1>
          <p className="text-muted-foreground">Mark daily subject-wise attendance.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Mark Attendance</CardTitle>
          <CardDescription> Select class, subject, and date to mark attendance.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Form for selecting class/subject/date and student list for marking attendance will be here.</p>
          <Button className="mt-4">
            <CalendarPlus className="mr-2 h-4 w-4" /> Mark Today's Attendance
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}