import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, CalendarDays } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const mockAttendance = [
    { subject: "Advanced Algorithms", attended: 25, total: 30 },
    { subject: "Operating Systems", attended: 28, total: 30 },
    { subject: "DBMS", attended: 22, total: 25 },
];

export default function StudentAttendancePage() {
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
          {mockAttendance.map((att, index) => {
            const percentage = (att.attended / att.total) * 100;
            return (
              <div key={index}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{att.subject}</span>
                  <span className={`text-sm font-semibold ${percentage < 75 ? 'text-destructive' : 'text-primary'}`}>
                    {percentage.toFixed(1)}% ({att.attended}/{att.total})
                  </span>
                </div>
                <Progress value={percentage} aria-label={`${att.subject} attendance ${percentage.toFixed(1)}%`} />
              </div>
            );
          })}
        </CardContent>
      </Card>
      <Card className="mt-8">
        <CardHeader>
            <CardTitle>Daily Attendance Log (Coming Soon)</CardTitle>
            <CardDescription>Detailed day-wise attendance records.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">This section will show a calendar or list view of your daily attendance status for each subject.</p>
        </CardContent>
      </Card>
    </div>
  );
}