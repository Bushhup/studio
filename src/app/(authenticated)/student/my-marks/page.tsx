
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getMyMarks, type StudentMark } from './actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from '@/hooks/use-toast';

export default function StudentMarksPage() {
  const { data: session } = useSession();
  const studentId = session?.user?.id;
  const { toast } = useToast();

  const [marks, setMarks] = useState<StudentMark[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (studentId) {
      setIsLoading(true);
      getMyMarks(studentId)
        .then(setMarks)
        .catch(() => {
          toast({
            title: "Error",
            description: "Could not fetch your marks.",
            variant: "destructive",
          });
        })
        .finally(() => setIsLoading(false));
    }
  }, [studentId, toast]);

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
          <CardDescription>A list of your performance across all assessments.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
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
                {marks.length > 0 ? (
                  marks.map((mark) => (
                    <TableRow key={mark.id}>
                      <TableCell className="font-medium">{mark.subjectName}</TableCell>
                      <TableCell>{mark.assessmentName}</TableCell>
                      <TableCell>{mark.marksObtained} / {mark.maxMarks}</TableCell>
                      <TableCell className="text-right font-semibold">{mark.grade}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No marks have been entered for you yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
