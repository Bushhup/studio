
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { IUser } from '@/models/user.model';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { School, PlusCircle, Users, MoreHorizontal, Edit, Trash2, CalendarClock, Save, Clock, Coffee, NotebookText, User, Info } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { createClass, getClasses, getStudentsByClass, updateClass, deleteClass, type ClassInput, type IClassWithFacultyAndStudentCount, saveTimetable, getSubjectsByClass, getTimetable, TimetableData, SubjectForTimetable } from './actions';
import { getUsersByRole } from '../users/actions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getStudentBioForProfile } from '../../settings/account/actions';
import { IStudentBio } from '@/models/studentBio.model';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';

// ---------------- Zod schema ----------------
const classSchema = z.object({
  name: z.string().min(3, "Class name must be at least 3 characters."),
  academicYear: z.string().regex(/^\d{4}-\d{4}$/, "Academic year must be in YYYY-YYYY format."),
  inchargeFaculty: z.string().min(1, "You must select an in-charge faculty."),
});

// ---------------- Utility Functions ----------------
const getInitials = (name: string) => {
  if (!name) return '';
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

const formatAadhar = (value?: string) => {
  if (!value) return '';
  const cleaned = value.replace(/\D/g, '').substring(0, 12);
  let result = '';
  for (let i = 0; i < cleaned.length; i++) {
    if (i > 0 && i % 4 === 0) result += ' ';
    result += cleaned[i];
  }
  return result;
};

// ---------------- Student Profile Dialog ----------------
function StudentProfileDialog({ student, isOpen, setIsOpen }: {
  student: Pick<IUser, 'id' | 'name' | 'avatar'> | null,
  isOpen: boolean,
  setIsOpen: (open: boolean) => void,
}) {
  const [bioData, setBioData] = useState<IStudentBio | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && student) {
      setIsLoading(true);
      getStudentBioForProfile(student.id).then(setBioData).finally(() => setIsLoading(false));
    }
  }, [isOpen, student]);

  if (!student) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary">
              <AvatarImage src={student.avatar || `https://placehold.co/100x100.png?text=${getInitials(student.name)}`} alt={student.name} />
              <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="font-headline text-2xl">Student Profile: {student.name}</DialogTitle>
              {bioData?.email && <DialogDescription>{bioData.email}</DialogDescription>}
            </div>
          </div>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] p-1">
          {isLoading ? (
            <div className="flex justify-center items-center h-48 animate-pulse">Loading...</div>
          ) : bioData ? (
            <div className="space-y-4 text-sm p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                <div><Label>Email</Label><p className="text-muted-foreground">{bioData.email || 'N/A'}</p></div>
                <div><Label>Date of Birth</Label><p className="text-muted-foreground">{bioData.dob ? format(new Date(bioData.dob), "PPP") : 'N/A'}</p></div>
                <div><Label>Mobile Number</Label><p className="text-muted-foreground">{bioData.mobileNumber || 'N/A'}</p></div>
                <div><Label>Gender</Label><p className="text-muted-foreground capitalize">{bioData.gender || 'N/A'}</p></div>
                <div className="lg:col-span-2"><Label>Aadhar Number</Label><p className="text-muted-foreground">{formatAadhar(bioData.aadharNumber) || 'N/A'}</p></div>
                <div className="md:col-span-2 lg:col-span-3"><Label>Address</Label><p className="text-muted-foreground">{bioData.address || 'N/A'}</p></div>
                <div><Label>Father's Name</Label><p className="text-muted-foreground">{bioData.fatherName || 'N/A'}</p></div>
                <div><Label>Father's Occupation</Label><p className="text-muted-foreground">{bioData.fatherOccupation || 'N/A'}</p></div>
                <div><Label>Father's Mobile</Label><p className="text-muted-foreground">{bioData.fatherMobileNumber || 'N/A'}</p></div>
                <div><Label>Religion</Label><p className="text-muted-foreground">{bioData.religion || 'N/A'}</p></div>
                <div><Label>Community</Label><p className="text-muted-foreground">{bioData.community || 'N/A'}</p></div>
                <div><Label>Caste</Label><p className="text-muted-foreground">{bioData.caste || 'N/A'}</p></div>
                <div><Label>Admission Quota</Label><p className="text-muted-foreground capitalize">{bioData.quota || 'N/A'}</p></div>
              </div>
            </div>
          ) : (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>No Bio-data Found</AlertTitle>
              <AlertDescription>This student has not yet filled out their bio-data information.</AlertDescription>
            </Alert>
          )}
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------- Class Form ----------------
function ClassForm({ setIsOpen, facultyList, onFormSubmit, initialData }: {
  setIsOpen: (open: boolean) => void;
  facultyList: Pick<IUser, 'id' | 'name'>[];
  onFormSubmit: () => void;
  initialData?: IClassWithFacultyAndStudentCount;
}) {
  const { toast } = useToast();
  const isEditMode = !!initialData;

  const form = useForm<ClassInput>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: initialData?.name || "",
      academicYear: initialData?.academicYear || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
      inchargeFaculty: initialData?.inchargeFaculty?.id || "",
    },
  });

  const { formState: { isSubmitting } } = form;

  const onSubmit = async (data: ClassInput) => {
    const action = isEditMode ? updateClass(initialData!.id, data) : createClass(data);
    const result = await action;
    if (result.success) {
      toast({ title: "Success!", description: result.message });
      onFormSubmit();
      setIsOpen(false);
      form.reset();
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Class Name</FormLabel>
            <FormControl><Input placeholder="e.g., MCA I Year Section A" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )}/>
        <FormField control={form.control} name="academicYear" render={({ field }) => (
          <FormItem>
            <FormLabel>Academic Year</FormLabel>
            <FormControl><Input placeholder="YYYY-YYYY" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )}/>
        <FormField control={form.control} name="inchargeFaculty" render={({ field }) => (
          <FormItem>
            <FormLabel>In-charge Faculty</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a faculty member" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {facultyList.length > 0 ? facultyList.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>) : (
                  <div className="p-4 text-sm text-muted-foreground">No faculty found. Please add faculty users first.</div>
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}/>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting || facultyList.length === 0}>
            {isSubmitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Class'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

// ---------------- Classes Table ----------------
function ClassesTable({ classes, onRowClick, onSelectEdit, onSelectDelete, onSelectTimetable }: {
  classes: IClassWithFacultyAndStudentCount[],
  onRowClick: (classInfo: IClassWithFacultyAndStudentCount) => void,
  onSelectEdit: (classInfo: IClassWithFacultyAndStudentCount) => void,
  onSelectDelete: (classInfo: IClassWithFacultyAndStudentCount) => void,
  onSelectTimetable: (classInfo: IClassWithFacultyAndStudentCount) => void,
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Class Name</TableHead>
          <TableHead>Academic Year</TableHead>
          <TableHead>In-charge Faculty</TableHead>
          <TableHead className="text-center">Student Count</TableHead>
          <TableHead className="text-center">Timetable</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {classes.length > 0 ? classes.map(c => (
          <TableRow key={c.id}>
            <TableCell className="font-medium cursor-pointer" onClick={() => onRowClick(c)}>{c.name}</TableCell>
            <TableCell className="cursor-pointer" onClick={() => onRowClick(c)}>{c.academicYear}</TableCell>
            <TableCell className="cursor-pointer" onClick={() => onRowClick(c)}>{c.inchargeFaculty?.name || 'N/A'}</TableCell>
            <TableCell className="text-center cursor-pointer" onClick={() => onRowClick(c)}>{c.studentCount}</TableCell>
            <TableCell className="text-center">
              <Button variant="outline" size="sm" onClick={() => onSelectTimetable(c)}><CalendarClock className="mr-2 h-4 w-4" /> View</Button>
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onSelect={() => onSelectEdit(c)}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onSelect={() => onSelectDelete(c)}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        )) : (
          <TableRow><TableCell colSpan={6} className="h-24 text-center">No classes found. Create one to get started.</TableCell></TableRow>
        )}
      </TableBody>
    </Table>
  );
}

// ---------------- Student List Dialog ----------------
function StudentListDialog({ isOpen, setIsOpen, classInfo, students, isLoading, onStudentClick }: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  classInfo: IClassWithFacultyAndStudentCount | null;
  students: Pick<IUser, 'id' | 'name' | 'rollNo' | 'avatar'>[];
  isLoading: boolean;
  onStudentClick: (student: Pick<IUser, 'id' | 'name' | 'avatar'>) => void;
}) {
  if (!classInfo) return null;
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center gap-2"><Users className="h-5 w-5" /> Student List - {classInfo.name}</DialogTitle>
          <DialogDescription>A total of {classInfo.studentCount} student(s) are in this class.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">Loading...</div>
          ) : students.length > 0 ? (
            <ScrollArea className="h-72 w-full rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">Roll No.</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map(student => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.rollNo || 'N/A'}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => onStudentClick(student)}><User className="mr-2 h-4 w-4"/> Profile</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          ) : (<p className="text-center text-muted-foreground py-10">No students found in this class.</p>)}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------- Timetable Data ----------------
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const periods = [
  { name: 'Period 1', time: '09:00 - 09:50' },
  { name: 'Period 2', time: '09:50 - 10:40' },
  { name: 'Break', time: '10:40 - 11:00' },
  { name: 'Period 3', time: '11:00 - 11:50' },
  { name: 'Period 4', time: '11:50 - 12:40' },
  { name: 'Lunch', time: '12:40 - 01:30' },
  { name: 'Period 5', time: '01:30 - 02:15' },
  { name: 'Period 6', time: '02:15 - 03:00' },
  { name: 'Period 7', time: '03:00 - 03:45' },
  { name: 'Period 8', time: '03:45 - 04:30' },
];

// ---------------- Timetable Dialog ----------------
function TimetableDialog({ isOpen, setIsOpen, classInfo }: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  classInfo: IClassWithFacultyAndStudentCount | null;
}) {
  const { toast } = useToast();
  const [timetable, setTimetable] = useState<TimetableData>({});
  const [subjects, setSubjects] = useState<SubjectForTimetable[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && classInfo) {
      setIsLoading(true);
      Promise.all([getTimetable(classInfo.id), getSubjectsByClass(classInfo.id)])
        .then(([tt, subs]) => {
          setTimetable(tt || {});
          setSubjects(subs);
        }).catch(() => toast({ title: "Error", description: "Failed to load timetable data.", variant: "destructive" }))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, classInfo, toast]);

  if (!classInfo) return null;

  const handleTimetableChange = (day: string, periodIndex: number, subjectId: string) => {
    setTimetable(prev => {
      const newDaySchedule = [...(prev[day.toLowerCase()] || Array(8).fill(null))];
      newDaySchedule[periodIndex] = subjectId === 'none' ? null : subjectId;
      return { ...prev, [day.toLowerCase()]: newDaySchedule };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    const result = await saveTimetable(classInfo.id, timetable);
    if (result.success) toast({ title: "Success", description: "Timetable saved successfully." });
    else toast({ title: "Error", description: result.message, variant: "destructive" });
    setIsSaving(false);
    setIsOpen(false);
  };

  const getSubjectName = (subjectId: string | null) => {
    if (!subjectId) return 'Free Period';
    return subjects.find(s => s.id === subjectId)?.name || 'Unknown';
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-6xl min-w-[50vw]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Timetable for {classInfo.name}</DialogTitle>
          <DialogDescription>Edit the timetable below</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center py-10">Loading timetable...</div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Day/Period</TableHead>
                  {periods.map((p, idx) => <TableHead key={idx}>{p.name}<br /><span className="text-xs">{p.time}</span></TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {days.map(day => (
                  <TableRow key={day}>
                    <TableCell>{day}</TableCell>
                    {periods.map((_, idx) => {
                      const periodConfig = periods[idx];
                      if (periodConfig.name === 'Break' || periodConfig.name === 'Lunch') {
                        return <TableCell key={idx} className="text-center bg-muted italic text-muted-foreground">{periodConfig.name}</TableCell>
                      }

                      const actualPeriodIndex = idx < 2 ? idx : (idx < 5 ? idx - 1 : idx - 2);

                      return (
                        <TableCell key={idx}>
                          <Select
                            value={timetable[day.toLowerCase()]?.[actualPeriodIndex] || 'none'}
                            onValueChange={(value) => handleTimetableChange(day, actualPeriodIndex, value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select subject" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Free Period</SelectItem>
                              {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Timetable'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------- Main Page Component ----------------
export default function AdminClassesPage() {
    const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
    const [isStudentListDialogOpen, setIsStudentListDialogOpen] = useState(false);
    const [isTimetableDialogOpen, setIsTimetableDialogOpen] = useState(false);
    const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);

    const [allFaculty, setAllFaculty] = useState<Pick<IUser, 'id' | 'name'>[]>([]);
    const [classes, setClasses] = useState<IClassWithFacultyAndStudentCount[]>([]);
    
    const [selectedClassForStudents, setSelectedClassForStudents] = useState<IClassWithFacultyAndStudentCount | null>(null);
    const [selectedClassForTimetable, setSelectedClassForTimetable] = useState<IClassWithFacultyAndStudentCount | null>(null);
    const [classToEdit, setClassToEdit] = useState<IClassWithFacultyAndStudentCount | null>(null);
    const [classToDelete, setClassToDelete] = useState<IClassWithFacultyAndStudentCount | null>(null);

    const [studentsInClass, setStudentsInClass] = useState<Pick<IUser, 'id' | 'name' | 'rollNo' | 'avatar'>[]>([]);
    const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<Pick<IUser, 'id' | 'name' | 'avatar'> | null>(null);
    
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isLoadingStudents, setIsLoadingStudents] = useState(false);
    
    const { toast } = useToast();

    const fetchPageData = async () => {
        setIsLoadingData(true);
        try {
            const [fetchedClasses, fetchedFaculty] = await Promise.all([
                getClasses(),
                getUsersByRole('faculty')
            ]);
            setClasses(fetchedClasses);
            setAllFaculty(fetchedFaculty.map(f => ({ id: f.id, name: f.name })));
        } catch (error) {
            toast({ title: "Error", description: "Could not fetch page data.", variant: "destructive" });
        } finally {
            setIsLoadingData(false);
        }
    };
    
    useEffect(() => {
        fetchPageData();
    }, []);

    const handleClassRowClick = async (classInfo: IClassWithFacultyAndStudentCount) => {
        setSelectedClassForStudents(classInfo);
        setIsStudentListDialogOpen(true);
        setIsLoadingStudents(true);
        try {
            const fetchedStudents = await getStudentsByClass(classInfo.id);
            setStudentsInClass(fetchedStudents);
        } catch (error) {
            toast({ title: "Error", description: "Could not fetch student list.", variant: "destructive" });
        } finally {
            setIsLoadingStudents(false);
        }
    };
    
    const handleOpenEditDialog = (classInfo: IClassWithFacultyAndStudentCount) => {
      setClassToEdit(classInfo);
      setIsFormDialogOpen(true);
    };

    const handleOpenCreateDialog = () => {
      setClassToEdit(null);
      setIsFormDialogOpen(true);
    };

    const handleOpenTimetableDialog = (classInfo: IClassWithFacultyAndStudentCount) => {
        setSelectedClassForTimetable(classInfo);
        setIsTimetableDialogOpen(true);
    };

    const handleDeleteClass = async () => {
        if (!classToDelete) return;
        const result = await deleteClass(classToDelete.id);
        if (result.success) {
            toast({ title: "Success", description: result.message });
            fetchPageData();
        } else {
            toast({ title: "Error", description: result.message, variant: "destructive" });
        }
        setClassToDelete(null);
    };

    const handleStudentClick = (student: Pick<IUser, 'id' | 'name' | 'avatar'>) => {
        setSelectedStudentForProfile(student);
        setIsStudentListDialogOpen(false); // Close student list
        setIsProfileDialogOpen(true); // Open profile dialog
    };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <School className="h-10 w-10 text-primary" />
          <div>
            <h1 className="font-headline text-4xl font-bold tracking-tight text-primary">Class Management</h1>
            <p className="text-muted-foreground">Create, manage, and view classes and their student lists.</p>
          </div>
        </div>
        <Button onClick={handleOpenCreateDialog}>
            <PlusCircle className="mr-2 h-5 w-5" /> Create New Class
        </Button>
      </div>

      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle className="font-headline">{classToEdit ? 'Edit Class' : 'Create New Class'}</DialogTitle>
                <DialogDescription>{classToEdit ? 'Update the details for this class.' : 'Fill in the details for the new class.'}</DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <ClassForm 
                    setIsOpen={setIsFormDialogOpen} 
                    facultyList={allFaculty} 
                    onFormSubmit={fetchPageData}
                    initialData={classToEdit || undefined}
                />
            </div>
          </DialogContent>
        </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Class List</CardTitle>
          <CardDescription>A list of all created classes. Click a row to see the student list or manage the timetable.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingData ? (
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
          ) : (
            <ClassesTable 
                classes={classes} 
                onRowClick={handleClassRowClick}
                onSelectEdit={handleOpenEditDialog}
                onSelectDelete={setClassToDelete}
                onSelectTimetable={handleOpenTimetableDialog}
            />
          )}
        </CardContent>
      </Card>

      <StudentListDialog
        isOpen={isStudentListDialogOpen}
        setIsOpen={setIsStudentListDialogOpen}
        classInfo={selectedClassForStudents}
        students={studentsInClass}
        isLoading={isLoadingStudents}
        onStudentClick={handleStudentClick}
      />

      <StudentProfileDialog 
        student={selectedStudentForProfile}
        isOpen={isProfileDialogOpen}
        setIsOpen={setIsProfileDialogOpen}
      />
      
      <TimetableDialog 
        isOpen={isTimetableDialogOpen}
        setIsOpen={setIsTimetableDialogOpen}
        classInfo={selectedClassForTimetable}
      />
      
      <AlertDialog open={!!classToDelete} onOpenChange={() => setClassToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the class for{' '}
              <span className="font-semibold">{classToDelete?.name}</span> and its associated timetable.
              You can only delete classes with no students assigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setClassToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={handleDeleteClass}
            >
              Yes, delete class
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
