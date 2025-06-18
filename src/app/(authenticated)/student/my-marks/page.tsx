import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Filter } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const mockMarks = [
  { subject: "Advanced Algorithms", test: "Unit Test 1", marks: "85/100", grade: "A" },
  { subject: "Operating Systems", test: "Unit Test 1", marks: "72/100", grade: "B+" },
  { subject: "DBMS", test: "Assignment 1", marks: "92/100", grade: "A+" },
  { subject: "Advanced Algorithms", test: "Mid Term", marks: "78/100", grade: "B+" },
];


export default function StudentMarksPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center gap-3">
        <GraduationCap className="h-10 w-10 text-primary" />
        <div>
          <h1 className="font-headline text-4xl font-bold tracking-tight text-primary">My Marks</h1>
          <p className="text-muted-foreground">View your subject-wise and exam-wise marks.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Marks Overview</CardTitle>
          <CardDescription>Filter by semester or subject (filters will be added here).</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
            <TableCaption>A list of your recent marks.</TableCaption>
            <TableHeader>
                <TableRow>
                <TableHead className="w-[250px]">Subject</TableHead>
                <TableHead>Test/Assignment</TableHead>
                <TableHead>Marks Obtained</TableHead>
                <TableHead className="text-right">Grade</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {mockMarks.map((mark, index) => (
                <TableRow key={index}>
                    <TableCell className="font-medium">{mark.subject}</TableCell>
                    <TableCell>{mark.test}</TableCell>
                    <TableCell>{mark.marks}</TableCell>
                    <TableCell className="text-right">{mark.grade}</TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}