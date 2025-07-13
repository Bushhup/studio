
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingDown, TrendingUp, Users } from "lucide-react";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { Badge } from "@/components/ui/badge";

const chartData = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

const studentsToWatch = [
    { name: "Charlie Davis", reason: "Low Attendance (65%)", trend: <TrendingDown className="h-4 w-4 text-destructive" /> },
    { name: "Eve Williams", reason: "Failing in DBMS", trend: <TrendingDown className="h-4 w-4 text-destructive" />},
    { name: "Frank Miller", reason: "Improved significantly", trend: <TrendingUp className="h-4 w-4 text-green-500" />}
]

export default function FacultyPerformancePage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center gap-3">
        <BarChart3 className="h-10 w-10 text-primary" />
        <div>
          <h1 className="font-headline text-4xl font-bold tracking-tight text-primary">Class Performance Overview</h1>
          <p className="text-muted-foreground">View performance metrics for your classes.</p>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Marks Distribution (Unit Test 1)</CardTitle>
            <CardDescription>Average score: 78. Class: MCA-I</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5"/> Students to Watch</CardTitle>
            <CardDescription>Students who might need extra attention or praise.</CardDescription>
          </CardHeader>
          <CardContent>
             <ul className="space-y-4">
                {studentsToWatch.map((student, index) => (
                    <li key={index} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                        <div className="flex items-center gap-3">
                             {student.trend}
                             <div>
                                <p className="font-medium">{student.name}</p>
                                <p className="text-sm text-muted-foreground">{student.reason}</p>
                             </div>
                        </div>
                        <Badge variant={student.reason.startsWith('Low') || student.reason.startsWith('Failing') ? 'destructive' : 'secondary'}>
                          {student.reason.startsWith('Low') || student.reason.startsWith('Failing') ? 'Action needed' : 'Positive'}
                        </Badge>
                    </li>
                ))}
             </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
