
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getSubjectsForFaculty, getStudentsForClass } from '../marks/actions'; // Re-using from marks actions
import { saveAttendance } from './actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListChecks, Users, Save, Calendar as CalendarIcon, Clock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { AttendanceRecord, StudentInfo, SubjectInfo } from './actions';


export default function FacultyAttendancePage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const facultyId = session?.user?.id;

  const [subjects, setSubjects] = useState<SubjectInfo[]>([]);
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [period, setPeriod] = useState('');
  
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [attendance, setAttendance] = useState<AttendanceRecord>({});

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
    setAttendance({}); // Reset attendance on subject change
    if (!subjectId) return;

    const subject = subjects.find(s => s.id === subjectId);
    if (subject) {
      setIsLoadingStudents(true);
      try {
        const fetchedStudents = await getStudentsForClass(subject.classId);
        setStudents(fetchedStudents);
        // Initialize all students as present
        const initialAttendance = fetchedStudents.reduce((acc, student) => {
          acc[student.id] = true;
          return acc;
        }, {} as AttendanceRecord);
        setAttendance(initialAttendance);
      } catch (error) {
        toast({ title: 'Error', description: 'Could not fetch students.', variant: 'destructive' });
      } finally {
        setIsLoadingStudents(false);
      }
    }
  };
  
  const handleSaveAttendance = async () => {
    if (!selectedSubjectId || !date || !period) {
        toast({ title: 'Missing Info', description: 'Please select subject, date, and period.', variant: 'destructive'});
        return;
    }

    const subject = subjects.find(s => s.id === selectedSubjectId);
    if (!subject) return;

    setIsSaving(true);
    
    const attendanceData = Object.entries(attendance).map(([studentId, isPresent]) => ({
      studentId,
      isPresent,
    }));

    const result = await saveAttendance({
        subjectId: selectedSubjectId,
        classId: subject.classId,
        date: date.toISOString(),
        period,
        attendance: attendanceData
    });

    if (result.success) {
      toast({ title: 'Attendance Saved', description: result.message });
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
    setIsSaving(false);
  }
  
  const handleToggleAllPresent = (isChecked: boolean) => {
    const newAttendance: AttendanceRecord = {};
    students.forEach(student => {
      newAttendance[student.id] = isChecked;
    });
    setAttendance(newAttendance);
  };
  
  const handleToggleStudent = (studentId: string, isChecked: boolean) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: isChecked
    }));
  };

  const areAllPresent = students.length > 0 && students.every(s => attendance[s.id]);
  const periods = Array.from({ length: 8 }, (_, i) => String(i + 1));

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
          <CardDescription>Select subject, date, and period to mark attendance.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
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
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full sm:w-[240px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Select onValueChange={setPeriod} value={period}>
              <SelectTrigger className="w-full sm:w-[180px]">
                 <Clock className="mr-2 h-4 w-4"/>
                <SelectValue placeholder="Select Period" />
              </SelectTrigger>
              <SelectContent>
                {periods.map(p => (
                   <SelectItem key={p} value={p}>Period {p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center gap-2 text-xl"><Users className="h-5 w-5"/> Student List</CardTitle>
                       <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="all-present" 
                            checked={areAllPresent} 
                            onCheckedChange={(checked) => handleToggleAllPresent(!!checked)}
                          />
                          <Label htmlFor="all-present" className="text-sm font-medium">Mark all as present</Label>
                        </div>
                    </div>
                 </CardHeader>
                 <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Roll No.</TableHead>
                                <TableHead>Student Name</TableHead>
                                <TableHead className="w-[100px] text-center">Present</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.map((student) => (
                                <TableRow key={student.id}>
                                    <TableCell>{student.rollNo || 'N/A'}</TableCell>
                                    <TableCell>{student.name}</TableCell>
                                    <TableCell className="text-center">
                                      <Checkbox 
                                        checked={attendance[student.id] ?? false}
                                        onCheckedChange={(checked) => handleToggleStudent(student.id, !!checked)}
                                        aria-label={`Mark ${student.name} as present`} 
                                      />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                 </CardContent>
              </Card>
               <div className="flex justify-end">
                <Button onClick={handleSaveAttendance} disabled={isSaving || !period}>
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
                  Save Attendance
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-10">Please select a subject to begin.</p>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
