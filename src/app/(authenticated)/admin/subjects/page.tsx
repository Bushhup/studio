
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { IClass } from '@/models/class.model';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookCopy, PlusCircle, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { createSubject, type CreateSubjectInput } from './actions';
import { getClasses } from '../classes/actions';

const createSubjectSchema = z.object({
  name: z.string().min(3, "Subject name is required."),
  code: z.string().min(3, "Subject code is required."),
  classId: z.string().min(1, "You must select a class."),
});

function CreateSubjectForm({ setIsOpen, classList }: { setIsOpen: (open: boolean) => void; classList: IClass[] }) {
  const { toast } = useToast();
  const form = useForm<CreateSubjectInput>({
    resolver: zodResolver(createSubjectSchema),
    defaultValues: {
      name: "",
      code: "",
      classId: "",
    },
  });

  const { formState: { isSubmitting } } = form;

  const onSubmit = async (data: CreateSubjectInput) => {
    const result = await createSubject(data);
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
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting || classList.length === 0}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
            Add Subject
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

export default function AdminSubjectsPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [classList, setClassList] = useState<IClass[]>([]);

    useEffect(() => {
        if (isDialogOpen) {
            getClasses().then(setClassList);
        }
    }, [isDialogOpen]);

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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-5 w-5" /> Add New Subject
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle className="font-headline">Add New Subject</DialogTitle>
                <DialogDescription>Fill in the details for the new subject.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <CreateSubjectForm setIsOpen={setIsDialogOpen} classList={classList} />
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Subject List & Assignments</CardTitle>
          <CardDescription>A list of all subjects and their assignments.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Subject data table (name, code, assigned class) will be here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
