
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getSubjectsForFaculty, getStudentsForClass, saveOrUpdateMarks, getMarksForAssessment, type MarkInput } from './actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, Users, Save, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

type SubjectInfo = {
  id: string;
  name: string;
  classId: string;
  className: string;
};

type StudentInfo = {
  id: string;
  name: string;
  rollNo?: string;
};

type MarksRecord = Record<string, { marksObtained: number | null, maxMarks: number | null }>;


export default function FacultyMarksPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const facultyId = session?.user?.id;

  const [subjects, setSubjects] = useState<SubjectInfo[]>([]);
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [assessmentName, setAssessmentName] = useState('');
  
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFetchingMarks, setIsFetchingMarks] = useState(false);
  
  const [marks, setMarks] = useState<MarksRecord>({});

  useEffect(() => {
    if (facultyId) {
      setIsLoadingSubjects(true);
      getSubjectsForFaculty(facultyId)
        .then(setSubjects)
        .finally(() => setIsLoadingSubjects(false));
    }
  }, [facultyId]);

  const handleSubjectChange = async (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setStudents([]);
    setMarks({});
    setAssessmentName('');
    if (!subjectId) return;

    const subject = subjects.find(s => s.id === subjectId);
    if (subject) {
      setIsLoadingStudents(true);
      try {
        const fetchedStudents = await getStudentsForClass(subject.classId);
        setStudents(fetchedStudents);
        // Initialize empty marks for all students
        const initialMarks = fetchedStudents.reduce((acc, student) => {
          acc[student.id] = { marksObtained: null, maxMarks: 100 };
          return acc;
        }, {} as MarksRecord);
        setMarks(initialMarks);
      } catch (error) {
        toast({ title: 'Error', description: 'Could not fetch students.', variant: 'destructive' });
      } finally {
        setIsLoadingStudents(false);
      }
    }
  };
  
  const handleFetchMarks = async () => {
    if (!selectedSubjectId || !assessmentName) {
        toast({ title: 'Missing Info', description: 'Please select a subject and enter an assessment name.', variant: 'destructive' });
        return;
    }
    const subject = subjects.find(s => s.id === selectedSubjectId);
    if (!subject) return;

    setIsFetchingMarks(true);
    try {
        const existingMarks = await getMarksForAssessment(subject.id, subject.classId, assessmentName);
        
        const newMarks: MarksRecord = {};
        const defaultMaxMarks = existingMarks.length > 0 ? existingMarks[0].maxMarks : 100;
        
        students.forEach(student => {
            const foundMark = existingMarks.find(m => m.studentId === student.id);
            if (foundMark) {
                newMarks[student.id] = {
                    marksObtained: foundMark.marksObtained,
                    maxMarks: foundMark.maxMarks,
                };
            } else {
                newMarks[student.id] = { marksObtained: null, maxMarks: defaultMaxMarks };
            }
        });
        setMarks(newMarks);

        if(existingMarks.length > 0) {
            toast({ title: "Marks Loaded", description: `Loaded marks for ${assessmentName}.`});
        } else {
            toast({ title: "No Existing Marks", description: `No marks found for ${assessmentName}. You can enter new marks.`, variant: 'default'});
        }

    } catch (error) {
        toast({ title: 'Error', description: 'Could not fetch existing marks.', variant: 'destructive' });
    } finally {
        setIsFetchingMarks(false);
    }
  };

  const handleMarksChange = (studentId: string, value: string) => {
    setMarks(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        marksObtained: value === '' ? null : Number(value)
      }
    }));
  }

  const handleMaxMarksChange = (studentId: string, value: string) => {
    setMarks(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        maxMarks: value === '' ? null : Number(value)
      }
    }));
  }
  
  const handleSaveMarks = async () => {
    if (!selectedSubjectId || !assessmentName) {
      toast({ title: 'Missing Info', description: 'Please select a subject and enter an assessment name.', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    const subject = subjects.find(s => s.id === selectedSubjectId);
    if (!subject) return;

    const marksToSave: MarkInput[] = Object.entries(marks).map(([studentId, mark]) => ({
      studentId,
      marksObtained: mark.marksObtained,
      maxMarks: mark.maxMarks,
    }));

    const result = await saveOrUpdateMarks(subject.id, subject.classId, assessmentName, marksToSave);

    if (result.success) {
      toast({ title: 'Marks Saved', description: result.message });
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
    setIsSaving(false);
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center gap-3">
        <ClipboardList className="h-10 w-10 text-primary" />
        <div>
          <h1 className="font-headline text-4xl font-bold tracking-tight text-primary">Marks Management</h1>
          <p className="text-muted-foreground">Enter, update, and view student marks.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Marks Entry / View</CardTitle>
          <CardDescription>Select a subject, then enter an assessment name to view or enter marks.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
             <Select onValueChange={handleSubjectChange} disabled={isLoadingSubjects}>
              <SelectTrigger className="w-full sm:w-[300px]">
                <SelectValue placeholder={isLoadingSubjects ? "Loading subjects..." : "Select subject..."} />
              </SelectTrigger>
              <SelectContent>
                {subjects.length > 0 ? (
                  subjects.map(subject => (
                    <SelectItem key={subject.id} value={subject.id}>{subject.name} ({subject.className})</SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-muted-foreground">No subjects assigned to you.</div>
                )}
              </SelectContent>
            </Select>
            <div className="flex w-full sm:w-auto sm:flex-grow gap-2">
                <Input 
                  className="flex-grow" 
                  placeholder="Enter assessment name (e.g., Unit Test 1)" 
                  disabled={!selectedSubjectId} 
                  value={assessmentName}
                  onChange={(e) => setAssessmentName(e.target.value)}
                />
                <Button onClick={handleFetchMarks} disabled={!assessmentName || isFetchingMarks}>
                    {isFetchingMarks ? <svg
                        viewBox="0 0 24 24"
                        className="mr-2 h-4 w-4 animate-pulse"
                        fill="none"
                        stroke="currentColor"
                      ><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg> : <Search className="mr-2 h-4 w-4" />}
                    View Marks
                </Button>
            </div>
          </div>

          {isLoadingStudents ? (
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
          ) : selectedSubjectId && students.length > 0 ? (
            <div className="space-y-4">
              <Card>
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl"><Users className="h-5 w-5"/> Student List for {assessmentName || 'New Assessment'}</CardTitle>
                 </CardHeader>
                 <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Roll No.</TableHead>
                                <TableHead>Student Name</TableHead>
                                <TableHead className="w-[150px]">Marks</TableHead>
                                <TableHead className="w-[150px]">Max Marks</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.map((student) => (
                                <TableRow key={student.id}>
                                    <TableCell>{student.rollNo || 'N/A'}</TableCell>
                                    <TableCell>{student.name}</TableCell>
                                    <TableCell>
                                      <Input 
                                        type="number" 
                                        placeholder="Enter marks"
                                        value={marks[student.id]?.marksObtained ?? ''}
                                        onChange={(e) => handleMarksChange(student.id, e.target.value)}
                                      />
                                    </TableCell>
                                    <TableCell>
                                       <Input 
                                        type="number"
                                        value={marks[student.id]?.maxMarks ?? 100}
                                        onChange={(e) => handleMaxMarksChange(student.id, e.target.value)}
                                      />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                 </CardContent>
              </Card>
               <div className="flex justify-end">
                <Button onClick={handleSaveMarks} disabled={isSaving}>
                  {isSaving ? <svg
                    viewBox="0 0 24 24"
                    className="mr-2 h-4 w-4 animate-pulse"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                      <path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg> : <Save className="mr-2 h-4 w-4" />}
                  Save Marks
                </Button>
              </div>
            </div>
          ) : selectedSubjectId && students.length === 0 ? (
             <p className="text-center text-muted-foreground py-10">No students found in this class.</p>
          ) : (
             <p className="text-center text-muted-foreground py-10">Please select a subject to begin marks entry.</p>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
