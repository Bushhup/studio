
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from '@/components/ui/textarea';
import { FileText, Save, Users, Edit, Calendar as CalendarIcon } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import mongoose from 'mongoose';
import { getStudentBio, saveStudentBio, getStudentsForBioData } from './actions';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const studentBioSchema = z.object({
  studentId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val)),
  mobileNumber: z.string().min(10, "Mobile number must be at least 10 digits."),
  email: z.string().email("Invalid email address."),
  dob: z.date({ required_error: "Date of birth is required." }),
  fatherName: z.string().min(2, "Father's name is required."),
  fatherOccupation: z.string().min(2, "Father's occupation is required."),
  fatherMobileNumber: z.string().min(10, "Father's mobile number must be at least 10 digits."),
  gender: z.enum(['male', 'female', 'other'], { required_error: "Gender is required." }),
  address: z.string().min(10, "Address is required."),
  religion: z.string().min(2, "Religion is required."),
  community: z.enum(['BC(MUSLIM)', 'OC', 'BC', 'MBC', 'SC', 'SCC', 'ST'], { required_error: "Community is required." }),
  caste: z.string().min(2, "Caste is required."),
  quota: z.enum(['management', 'government'], { required_error: "Quota is required." }),
  aadharNumber: z.string().regex(/^\d{4} \d{4} \d{4}$/, "Aadhar number must be in the format XXXX XXXX XXXX."),
});

type StudentBioInput = z.infer<typeof studentBioSchema>;

const formatAadhar = (value: string) => {
    const cleaned = value.replace(/\D/g, '').substring(0, 12);
    let result = '';
    for (let i = 0; i < cleaned.length; i++) {
        if (i > 0 && i % 4 === 0) {
            result += ' ';
        }
        result += cleaned[i];
    }
    return result;
};

function BioDataForm({ student, onFormSubmit, setIsOpen }: { student: { id: string; email: string }; onFormSubmit: () => void, setIsOpen: (open: boolean) => void; }) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);

    const form = useForm<StudentBioInput>({
        resolver: zodResolver(studentBioSchema),
        defaultValues: {
            studentId: student.id,
            mobileNumber: '',
            email: student.email,
            fatherName: '',
            fatherOccupation: '',
            fatherMobileNumber: '',
            address: '',
            religion: '',
            caste: '',
            aadharNumber: '',
        }
    });

    useEffect(() => {
        if (student.id) {
            setIsLoading(true);
            getStudentBio(student.id).then(bioData => {
                if (bioData) {
                    form.reset({
                        ...bioData,
                        studentId: bioData.studentId.toString(),
                        aadharNumber: formatAadhar(bioData.aadharNumber),
                        dob: new Date(bioData.dob),
                    });
                }
            }).catch(() => {
                toast({ title: 'Error', description: 'Failed to fetch existing bio-data.', variant: 'destructive' });
            }).finally(() => {
                setIsLoading(false);
            });
        }
    }, [student.id, form, toast]);

    const onSubmit = async (data: StudentBioInput) => {
        const result = await saveStudentBio({ ...data, studentId: student.id });

        if (result.success) {
            toast({ title: 'Success', description: result.message });
            onFormSubmit();
            setIsOpen(false);
        } else {
            toast({ title: 'Error', description: result.message, variant: 'destructive' });
        }
    };
    
     if (isLoading) {
       return (
         <div className="flex items-center justify-center bg-background p-4 h-96">
           <svg viewBox="0 0 24 24" className="h-10 w-10 animate-pulse theme-gradient-stroke" fill="none" stroke="url(#theme-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
         </div>
       )
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
                <h3 className="text-md font-semibold border-b pb-2">Student Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="student@example.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="mobileNumber" render={({ field }) => (<FormItem><FormLabel>Mobile Number</FormLabel><FormControl><Input placeholder="10-digit number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                     <FormField control={form.control} name="dob" render={({ field }) => (
                        <FormItem className="flex flex-col"><FormLabel>Date of Birth</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} captionLayout="dropdown-buttons" fromYear={1990} toYear={new Date().getFullYear()} initialFocus />
                                </PopoverContent>
                            </Popover>
                        <FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="gender" render={({ field }) => (<FormItem><FormLabel>Gender</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger></FormControl><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                </div>
                <FormField control={form.control} name="aadharNumber" render={({ field }) => (<FormItem><FormLabel>Aadhar Number</FormLabel><FormControl><Input placeholder="XXXX XXXX XXXX" {...field} onChange={(e) => field.onChange(formatAadhar(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel>Full Address</FormLabel><FormControl><Textarea placeholder="Complete address" {...field} /></FormControl><FormMessage /></FormItem>)} />

                <h3 className="text-md font-semibold border-b pt-3 pb-2">Family & Community</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="fatherName" render={({ field }) => (<FormItem><FormLabel>Father's Name</FormLabel><FormControl><Input placeholder="Full name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="fatherOccupation" render={({ field }) => (<FormItem><FormLabel>Father's Occupation</FormLabel><FormControl><Input placeholder="Job" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="fatherMobileNumber" render={({ field }) => (<FormItem><FormLabel>Father's Mobile</FormLabel><FormControl><Input placeholder="10-digit number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField control={form.control} name="religion" render={({ field }) => (<FormItem><FormLabel>Religion</FormLabel><FormControl><Input placeholder="e.g., Hinduism" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="community" render={({ field }) => (<FormItem><FormLabel>Community</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select community" /></SelectTrigger></FormControl><SelectContent>{['BC(MUSLIM)', 'OC', 'BC', 'MBC', 'SC', 'SCC', 'ST'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="caste" render={({ field }) => (<FormItem><FormLabel>Name of Caste</FormLabel><FormControl><Input placeholder="Caste name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>

                <FormField control={form.control} name="quota" render={({ field }) => (<FormItem className="space-y-2"><FormLabel>Admission Quota</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex items-center space-x-4"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="government" /></FormControl><FormLabel className="font-normal">Government</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="management" /></FormControl><FormLabel className="font-normal">Management</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>)} />
                
                <DialogFooter className="pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4 animate-pulse" fill="none" stroke="currentColor"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg> : <Save className="mr-2 h-4 w-4" />}
                        Save Bio-data
                    </Button>
                </DialogFooter>
            </form>
        </Form>
    );
}


export default function AdminBioDataPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [students, setStudents] = useState<{id: string, name: string, email: string}[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<{id: string, name: string, email: string} | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    
    const fetchStudents = async () => {
        setIsLoading(true);
        try {
            const studentList = await getStudentsForBioData();
            setStudents(studentList as any);
        } catch {
            toast({ title: 'Error', description: 'Failed to fetch student list.', variant: 'destructive'});
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchStudents();
    }, []);
    
    const handleEditClick = (student: {id: string, name: string, email: string}) => {
        setSelectedStudent(student);
        setIsDialogOpen(true);
    }

    return (
        <div className="container mx-auto py-8">
            <div className="mb-8 flex items-center gap-3">
                <FileText className="h-10 w-10 text-primary" />
                <div>
                    <h1 className="font-headline text-4xl font-bold tracking-tight text-primary">Student Bio-data Management</h1>
                    <p className="text-muted-foreground">View, add, or edit student personal information.</p>
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5"/> Student List</CardTitle>
                    <CardDescription>Select a student to view or edit their bio-data.</CardDescription>
                </CardHeader>
                <CardContent>
                     {isLoading ? (
                         <div className="flex justify-center items-center py-10">
                           <svg viewBox="0 0 24 24" className="h-8 w-8 animate-pulse theme-gradient-stroke" fill="none" stroke="url(#theme-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
                        </div>
                      ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student Name</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.map(student => (
                                    <TableRow key={student.id}>
                                        <TableCell className="font-medium">{student.name}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" onClick={() => handleEditClick(student)}>
                                                <Edit className="mr-2 h-4 w-4" /> View / Edit Bio-data
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                      )}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle className="font-headline text-2xl">Bio-data for {selectedStudent?.name}</DialogTitle>
                        <DialogDescription>
                            Please fill out all fields accurately. This information is confidential.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedStudent && (
                        <BioDataForm 
                            student={selectedStudent} 
                            onFormSubmit={fetchStudents} 
                            setIsOpen={setIsDialogOpen}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
