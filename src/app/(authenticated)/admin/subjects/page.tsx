
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { IClass } from '@/models/class.model';
import type { IUser } from '@/models/user.model';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookCopy, PlusCircle, Loader2, MoreHorizontal, Edit, Trash2 } from "lucide-react";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';

import { createSubject, getSubjects, updateSubject, deleteSubject, type SubjectInput, type ExtendedSubject } from './actions';
import { getClasses } from '../classes/actions';
import { getUsersByRole } from '../users/actions';


const subjectSchema = z.object({
  name: z.string().min(3, "Subject name is required."),
  code: z.string().min(3, "Subject code is required."),
  classId: z.string().min(1, "You must select a class."),
  facultyId: z.string().min(1, "You must select a faculty handler."),
});

function SubjectForm({ 
  setIsOpen, 
  classList, 
  facultyList,
  onFormSubmit,
  initialData 
}: { 
  setIsOpen: (open: boolean) => void; 
  classList: Pick<IClass, 'id' | 'name' | 'academicYear'>[]; 
  facultyList: Pick<IUser, 'id' | 'name'>[];
  onFormSubmit: () => void;
  initialData?: ExtendedSubject;
}) {
  const { toast } = useToast();
  const isEditMode = !!initialData;

  const form = useForm<SubjectInput>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: initialData?.name || "",
      code: initialData?.code || "",
      classId: initialData?.classId || "",
      facultyId: initialData?.facultyId || "",
    },
  });

  const { formState: { isSubmitting } } = form;

  const onSubmit = async (data: SubjectInput) => {
    const action = isEditMode
      ? updateSubject(initialData!.id, data)
      : createSubject(data);

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
              <FormLabel>Subject Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Advanced Java" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject Code</FormLabel>
              <FormControl>
                <Input placeholder="e.g., CS-501" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="classId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assign to Class</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                   {classList.length > 0 ? (
                    classList.map(cls => (
                      <SelectItem key={cls.id} value={cls.id}>{cls.name} ({cls.academicYear})</SelectItem>
                    ))
                  ) : (
                    <div className="p-4 text-sm text-muted-foreground">No classes found. Please create a class first.</div>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="facultyId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject Handler (Faculty)</FormLabel>
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
          <Button type="submit" disabled={isSubmitting || classList.length === 0 || facultyList.length === 0}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isEditMode ? <Edit className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />)}
            {isEditMode ? 'Save Changes' : 'Add Subject'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

function SubjectsTable({ subjects, onSelectEdit, onSelectDelete }: { 
    subjects: ExtendedSubject[], 
    onSelectEdit: (subject: ExtendedSubject) => void,
    onSelectDelete: (subject: ExtendedSubject) => void,
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Subject Name</TableHead>
          <TableHead>Code</TableHead>
          <TableHead>Assigned Class</TableHead>
          <TableHead>Handling Faculty</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {subjects.length > 0 ? subjects.map((subject) => (
          <TableRow key={subject.id}>
            <TableCell className="font-medium">{subject.name}</TableCell>
            <TableCell>{subject.code}</TableCell>
            <TableCell>{subject.className}</TableCell>
            <TableCell>{subject.facultyName}</TableCell>
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
                    <DropdownMenuItem onSelect={() => onSelectEdit(subject)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="text-destructive"
                        onSelect={() => onSelectDelete(subject)}
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
              No subjects found. Create one to get started.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}


export default function AdminSubjectsPage() {
    const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const [subjects, setSubjects] = useState<ExtendedSubject[]>([]);
    const [classList, setClassList] = useState<Pick<IClass, 'id' | 'name' | 'academicYear'>[]>([]);
    const [facultyList, setFacultyList] = useState<Pick<IUser, 'id' | 'name'>[]>([]);
    
    const [subjectToEdit, setSubjectToEdit] = useState<ExtendedSubject | null>(null);
    const [subjectToDelete, setSubjectToDelete] = useState<ExtendedSubject | null>(null);

    const { toast } = useToast();

    const fetchPageData = async () => {
        setIsLoadingData(true);
        try {
            const [fetchedSubjects, fetchedClasses, fetchedFaculty] = await Promise.all([
                getSubjects(),
                getClasses(),
                getUsersByRole('faculty')
            ]);
            setSubjects(fetchedSubjects);
            setClassList(fetchedClasses.map(c => ({ id: c.id, name: c.name, academicYear: c.academicYear })));
            setFacultyList(fetchedFaculty.map(f => ({ id: f.id.toString(), name: f.name })));
        } catch (error) {
            toast({ title: "Error", description: "Could not fetch page data.", variant: "destructive" });
        } finally {
            setIsLoadingData(false);
        }
    };
    
    useEffect(() => {
        fetchPageData();
    }, []);

    const handleOpenEditDialog = (subject: ExtendedSubject) => {
      setSubjectToEdit(subject);
      setIsFormDialogOpen(true);
    };

    const handleOpenCreateDialog = () => {
      setSubjectToEdit(null);
      setIsFormDialogOpen(true);
    };

    const handleDeleteSubject = async () => {
        if (!subjectToDelete) return;
        const result = await deleteSubject(subjectToDelete.id);
        if (result.success) {
            toast({ title: "Success", description: result.message });
            fetchPageData();
        } else {
            toast({ title: "Error", description: result.message, variant: "destructive" });
        }
        setSubjectToDelete(null);
    };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <BookCopy className="h-10 w-10 text-primary" />
          <div>
            <h1 className="font-headline text-4xl font-bold tracking-tight text-primary">Subject Management</h1>
            <p className="text-muted-foreground">Assign subjects to classes and faculty.</p>
          </div>
        </div>
        <Button onClick={handleOpenCreateDialog}>
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Subject
        </Button>
      </div>

       <Dialog open={isFormDialogOpen} onOpenChange={(isOpen) => {
          if (!isOpen) setSubjectToEdit(null); // Reset edit state on close
          setIsFormDialogOpen(isOpen);
       }}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle className="font-headline">{subjectToEdit ? 'Edit Subject' : 'Add New Subject'}</DialogTitle>
                <DialogDescription>{subjectToEdit ? 'Update the details for this subject.' : 'Fill in the details for the new subject.'}</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <SubjectForm 
                setIsOpen={setIsFormDialogOpen} 
                classList={classList} 
                facultyList={facultyList}
                onFormSubmit={fetchPageData}
                initialData={subjectToEdit || undefined}
              />
            </div>
          </DialogContent>
        </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Subject List & Assignments</CardTitle>
          <CardDescription>A list of all subjects and their assignments.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingData ? (
             <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <SubjectsTable 
              subjects={subjects} 
              onSelectEdit={handleOpenEditDialog}
              onSelectDelete={setSubjectToDelete}
            />
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!subjectToDelete} onOpenChange={() => setSubjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the subject{' '}
              <span className="font-semibold">{subjectToDelete?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSubjectToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={handleDeleteSubject}
            >
              Yes, delete subject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
