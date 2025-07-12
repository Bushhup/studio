
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { IUser } from '@/models/user.model';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { School, PlusCircle, Loader2, Users } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { createClass, getClasses, getStudentsByClass, type CreateClassInput, type IClassWithStudentCount } from './actions';
import { getUsersByRole } from '../users/actions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from '@/components/ui/scroll-area';

const createClassSchema = z.object({
  name: z.string().min(3, "Class name must be at least 3 characters."),
  academicYear: z.string().regex(/^\d{4}-\d{4}$/, "Academic year must be in YYYY-YYYY format."),
  inchargeFaculty: z.string().min(1, "You must select an in-charge faculty."),
});

function CreateClassForm({ setIsOpen, facultyList, onClassAdded }: { setIsOpen: (open: boolean) => void; facultyList: Pick<IUser, 'id' | 'name'>[]; onClassAdded: () => void; }) {
  const { toast } = useToast();
  const form = useForm<CreateClassInput>({
    resolver: zodResolver(createClassSchema),
    defaultValues: {
      name: "",
      academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
      inchargeFaculty: "",
    },
  });

  const { formState: { isSubmitting } } = form;

  const onSubmit = async (data: CreateClassInput) => {
    const result = await createClass(data);
    if (result.success) {
      toast({
        title: "Success!",
        description: result.message,
      });
      onClassAdded();
      setIsOpen(false);
      form.reset();
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Class Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., MCA I Year Section A" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="academicYear"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Academic Year</FormLabel>
              <FormControl>
                <Input placeholder="YYYY-YYYY" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="inchargeFaculty"
          render={({ field }) => (
            <FormItem>
              <FormLabel>In-charge Faculty</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a faculty member" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {facultyList.length > 0 ? (
                    facultyList.map(faculty => (
                      <SelectItem key={faculty.id} value={faculty.id}>{faculty.name}</SelectItem>
                    ))
                  ) : (
                    <div className="p-4 text-sm text-muted-foreground">No faculty found. Please add faculty users first.</div>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting || facultyList.length === 0}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
            Create Class
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

function ClassesTable({ classes, facultyList, onRowClick }: { classes: IClassWithStudentCount[], facultyList: Pick<IUser, 'id' | 'name'>[], onRowClick: (classInfo: IClassWithStudentCount) => void }) {
  const facultyMap = new Map(facultyList.map(f => [f.id, f.name]));

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Class Name</TableHead>
          <TableHead>Academic Year</TableHead>
          <TableHead>In-charge Faculty</TableHead>
          <TableHead className="text-center">Student Count</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {classes.length > 0 ? classes.map((c) => (
          <TableRow key={c.id} onClick={() => onRowClick(c)} className="cursor-pointer">
            <TableCell className="font-medium">{c.name}</TableCell>
            <TableCell>{c.academicYear}</TableCell>
            <TableCell>{facultyMap.get(c.inchargeFaculty as string) || 'N/A'}</TableCell>
            <TableCell className="text-center">{c.studentCount}</TableCell>
          </TableRow>
        )) : (
          <TableRow>
            <TableCell colSpan={4} className="h-24 text-center">
              No classes found. Create one to get started.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

function StudentListDialog({
  isOpen,
  setIsOpen,
  classInfo,
  students,
  isLoading
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  classInfo: IClassWithStudentCount | null;
  students: Pick<IUser, 'id' | 'name'>[];
  isLoading: boolean;
}) {
  if (!classInfo) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center gap-2">
            <Users className="h-5 w-5" /> Student List - {classInfo.name}
          </DialogTitle>
          <DialogDescription>
            A total of {classInfo.studentCount} student(s) are in this class.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : students.length > 0 ? (
            <ScrollArea className="h-72 w-full rounded-md border p-4">
              <ul className="space-y-2">
                {students.map((student, index) => (
                  <li key={student.id} className="text-sm">
                    {index + 1}. {student.name}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          ) : (
            <p className="text-center text-muted-foreground py-10">No students found in this class.</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


export default function AdminClassesPage() {
    const [isAddClassDialogOpen, setIsAddClassDialogOpen] = useState(false);
    const [isStudentListDialogOpen, setIsStudentListDialogOpen] = useState(false);
    
    const [allFaculty, setAllFaculty] = useState<Pick<IUser, 'id' | 'name'>[]>([]);
    const [classes, setClasses] = useState<IClassWithStudentCount[]>([]);
    const [selectedClass, setSelectedClass] = useState<IClassWithStudentCount | null>(null);
    const [studentsInClass, setStudentsInClass] = useState<Pick<IUser, 'id' | 'name'>[]>([]);
    
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
            setAllFaculty(fetchedFaculty);
        } catch (error) {
            toast({ title: "Error", description: "Could not fetch page data.", variant: "destructive" });
        } finally {
            setIsLoadingData(false);
        }
    };
    
    useEffect(() => {
        fetchPageData();
    }, []);

    const handleClassRowClick = async (classInfo: IClassWithStudentCount) => {
        setSelectedClass(classInfo);
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
        <Dialog open={isAddClassDialogOpen} onOpenChange={setIsAddClassDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-5 w-5" /> Create New Class
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle className="font-headline">Create New Class</DialogTitle>
                <DialogDescription>Fill in the details for the new class.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <CreateClassForm setIsOpen={setIsAddClassDialogOpen} facultyList={allFaculty} onClassAdded={fetchPageData} />
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Class List</CardTitle>
          <CardDescription>A list of all created classes. Click a row to see the student list.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingData ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <ClassesTable classes={classes} facultyList={allFaculty} onRowClick={handleClassRowClick} />
          )}
        </CardContent>
      </Card>
      <StudentListDialog
        isOpen={isStudentListDialogOpen}
        setIsOpen={setIsStudentListDialogOpen}
        classInfo={selectedClass}
        students={studentsInClass}
        isLoading={isLoadingStudents}
      />
    </div>
  );
}
