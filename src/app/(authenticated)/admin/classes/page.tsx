
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { IUser } from '@/models/user.model';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { School, PlusCircle, Loader2, Users, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
import { createClass, getClasses, getStudentsByClass, updateClass, deleteClass, type ClassInput, type IClassWithStudentCount } from './actions';
import { getUsersByRole } from '../users/actions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";


const classSchema = z.object({
  name: z.string().min(3, "Class name must be at least 3 characters."),
  academicYear: z.string().regex(/^\d{4}-\d{4}$/, "Academic year must be in YYYY-YYYY format."),
  inchargeFaculty: z.string().min(1, "You must select an in-charge faculty."),
});

function ClassForm({ 
  setIsOpen, 
  facultyList, 
  onFormSubmit, 
  initialData 
}: { 
  setIsOpen: (open: boolean) => void; 
  facultyList: Pick<IUser, 'id' | 'name'>[]; 
  onFormSubmit: () => void;
  initialData?: IClassWithStudentCount;
}) {
  const { toast } = useToast();
  const isEditMode = !!initialData;

  const form = useForm<ClassInput>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: initialData?.name || "",
      academicYear: initialData?.academicYear || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
      inchargeFaculty: initialData?.inchargeFaculty as string || "",
    },
  });

  const { formState: { isSubmitting } } = form;

  const onSubmit = async (data: ClassInput) => {
    const action = isEditMode 
      ? updateClass(initialData!.id, data) 
      : createClass(data);

    const result = await action;

    if (result.success) {
      toast({
        title: "Success!",
        description: result.message,
      });
      onFormSubmit();
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
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isEditMode ? <Edit className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />)}
            {isEditMode ? 'Save Changes' : 'Create Class'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

function ClassesTable({ classes, facultyList, onRowClick, onSelectEdit, onSelectDelete }: { 
    classes: IClassWithStudentCount[], 
    facultyList: Pick<IUser, 'id' | 'name'>[], 
    onRowClick: (classInfo: IClassWithStudentCount) => void,
    onSelectEdit: (classInfo: IClassWithStudentCount) => void,
    onSelectDelete: (classInfo: IClassWithStudentCount) => void,
}) {
  const facultyMap = new Map(facultyList.map(f => [f.id, f.name]));

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Class Name</TableHead>
          <TableHead>Academic Year</TableHead>
          <TableHead>In-charge Faculty</TableHead>
          <TableHead className="text-center">Student Count</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {classes.length > 0 ? classes.map((c) => (
          <TableRow key={c.id} >
            <TableCell className="font-medium cursor-pointer" onClick={() => onRowClick(c)}>{c.name}</TableCell>
            <TableCell className="cursor-pointer" onClick={() => onRowClick(c)}>{c.academicYear}</TableCell>
            <TableCell className="cursor-pointer" onClick={() => onRowClick(c)}>{facultyMap.get(c.inchargeFaculty as string) || 'N/A'}</TableCell>
            <TableCell className="text-center cursor-pointer" onClick={() => onRowClick(c)}>{c.studentCount}</TableCell>
            <TableCell className="text-right">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onSelect={() => onSelectEdit(c)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="text-destructive"
                        onSelect={() => onSelectDelete(c)}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
          </TableRow>
        )) : (
          <TableRow>
            <TableCell colSpan={5} className="h-24 text-center">
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
    const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
    const [isStudentListDialogOpen, setIsStudentListDialogOpen] = useState(false);
    
    const [allFaculty, setAllFaculty] = useState<Pick<IUser, 'id' | 'name'>[]>([]);
    const [classes, setClasses] = useState<IClassWithStudentCount[]>([]);
    
    const [selectedClass, setSelectedClass] = useState<IClassWithStudentCount | null>(null);
    const [classToEdit, setClassToEdit] = useState<IClassWithStudentCount | null>(null);
    const [classToDelete, setClassToDelete] = useState<IClassWithStudentCount | null>(null);

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
            setAllFaculty(fetchedFaculty.map(f => ({ id: f.id.toString(), name: f.name })));
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
    
    const handleOpenEditDialog = (classInfo: IClassWithStudentCount) => {
      setClassToEdit(classInfo);
      setIsFormDialogOpen(true);
    };

    const handleOpenCreateDialog = () => {
      setClassToEdit(null); // Ensure we are in "create" mode
      setIsFormDialogOpen(true);
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
          <DialogContent className="sm:max-w-[425px]">
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
          <CardDescription>A list of all created classes. Click a row to see the student list.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingData ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <ClassesTable 
                classes={classes} 
                facultyList={allFaculty} 
                onRowClick={handleClassRowClick}
                onSelectEdit={handleOpenEditDialog}
                onSelectDelete={setClassToDelete}
            />
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
      
      <AlertDialog open={!!classToDelete} onOpenChange={() => setClassToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the class for{' '}
              <span className="font-semibold">{classToDelete?.name}</span>. 
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
