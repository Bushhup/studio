
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { IUser } from '@/models/user.model';
import type { IClass } from '@/models/class.model';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { School, PlusCircle, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { createClass, getClasses, type CreateClassInput } from './actions';
import { getUsersByRole } from '../users/actions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


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

function ClassesTable({ classes, facultyList }: { classes: IClass[], facultyList: Pick<IUser, 'id' | 'name'>[] }) {
  const facultyMap = new Map(facultyList.map(f => [f.id, f.name]));

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Class Name</TableHead>
          <TableHead>Academic Year</TableHead>
          <TableHead>In-charge Faculty</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {classes.length > 0 ? classes.map((c) => (
          <TableRow key={c.id}>
            <TableCell className="font-medium">{c.name}</TableCell>
            <TableCell>{c.academicYear}</TableCell>
            <TableCell>{facultyMap.get(c.inchargeFaculty as string) || 'N/A'}</TableCell>
          </TableRow>
        )) : (
          <TableRow>
            <TableCell colSpan={3} className="h-24 text-center">
              No classes found. Create one to get started.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}


export default function AdminClassesPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [allFaculty, setAllFaculty] = useState<Pick<IUser, 'id' | 'name'>[]>([]);
    const [classes, setClasses] = useState<IClass[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchPageData = async () => {
        setIsLoading(true);
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
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchPageData();
    }, []);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <School className="h-10 w-10 text-primary" />
          <div>
            <h1 className="font-headline text-4xl font-bold tracking-tight text-primary">Class Management</h1>
            <p className="text-muted-foreground">Create and manage classes (e.g., MCA I Year).</p>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                <CreateClassForm setIsOpen={setIsDialogOpen} facultyList={allFaculty} onClassAdded={fetchPageData} />
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Class List</CardTitle>
          <CardDescription>A list of all created classes.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <ClassesTable classes={classes} facultyList={allFaculty} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
