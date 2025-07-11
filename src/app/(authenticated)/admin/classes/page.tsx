
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { IUser } from '@/models/user.model';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { School, PlusCircle, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { createClass, type CreateClassInput } from './actions';
import { getUsersByRole } from '../users/actions';


const createClassSchema = z.object({
  name: z.string().min(3, "Class name must be at least 3 characters."),
  academicYear: z.string().regex(/^\d{4}-\d{4}$/, "Academic year must be in YYYY-YYYY format."),
  inchargeFaculty: z.string().min(1, "You must select an in-charge faculty."),
});

function CreateClassForm({ setIsOpen, facultyList }: { setIsOpen: (open: boolean) => void; facultyList: Pick<IUser, 'id' | 'name'>[] }) {
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


export default function AdminClassesPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [facultyList, setFacultyList] = useState<Pick<IUser, 'id' | 'name'>[]>([]);

    useEffect(() => {
        // Fetch faculty list when the component mounts or dialog opens
        if (isDialogOpen) {
            getUsersByRole('faculty').then(setFacultyList);
        }
    }, [isDialogOpen]);

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
                <CreateClassForm setIsOpen={setIsDialogOpen} facultyList={facultyList} />
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
          <p className="text-muted-foreground">Class data table (name, year, in-charge faculty) will be implemented next.</p>
        </CardContent>
      </Card>
    </div>
  );
}
