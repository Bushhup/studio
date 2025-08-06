
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from '@/components/ui/textarea';
import { FileText, Save, Users, Edit, Search } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import mongoose from 'mongoose';
import { getStudentBio, saveStudentBio, getStudentsForBioData, type StudentBioInput } from './actions';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


const studentBioSchema = z.object({
  studentId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val)),
  mobileNumber: z.string().optional(),
  email: z.string().email("Invalid email address.").optional().or(z.literal('')),
  dob_day: z.string().optional(),
  dob_month: z.string().optional(),
  dob_year: z.string().optional(),
  fatherName: z.string().optional(),
  fatherOccupation: z.string().optional(),
  fatherMobileNumber: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  address: z.string().optional(),
  religion: z.string().optional(),
  community: z.enum(['BC(MUSLIM)', 'OC', 'BC', 'MBC', 'SC', 'SCC', 'ST']).optional(),
  caste: z.string().optional(),
  quota: z.enum(['management', 'government']).optional(),
  aadharNumber: z.string().optional(),
}).refine(data => {
    // If one part of DOB is filled, all should be.
    if (data.dob_day || data.dob_month || data.dob_year) {
        return !!data.dob_day && !!data.dob_month && !!data.dob_year;
    }
    return true;
}, {
    message: "All parts of the date of birth must be selected.",
    path: ["dob_day"],
});

const formatAadhar = (value: string) => {
    if (!value) return '';
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

const months = Array.from({length: 12}, (_, i) => ({ value: String(i + 1), label: new Date(0, i).toLocaleString('default', { month: 'long' }) }));
const currentYear = new Date().getFullYear();
const years = Array.from({length: 30}, (_, i) => String(currentYear - 30 + i)).reverse();
const days = Array.from({length: 31}, (_, i) => String(i + 1));

function BioDataForm({ student, onFormSubmit, setIsOpen }: { student: { id: string; email: string }; onFormSubmit: () => void, setIsOpen: (open: boolean) => void; }) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);

    const form = useForm<StudentBioInput>({
        resolver: zodResolver(studentBioSchema),
        defaultValues: {
            studentId: student.id,
            mobileNumber: '',
            email: student.email,
            dob_day: undefined,
            dob_month: undefined,
            dob_year: undefined,
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
                        studentId: bioData.studentId!.toString(),
                        aadharNumber: bioData.aadharNumber ? formatAadhar(bioData.aadharNumber) : '',
                        email: bioData.email || student.email,
                    });
                } else {
                    form.reset({
                        studentId: student.id,
                        email: student.email,
                        mobileNumber: '',
                        fatherName: '',
                        fatherOccupation: '',
                        fatherMobileNumber: '',
                        address: '',
                        religion: '',
                        caste: '',
                        aadharNumber: '',
                        gender: undefined,
                        community: undefined,
                        quota: undefined,
                        dob_day: undefined,
                        dob_month: undefined,
                        dob_year: undefined,
                    });
                }
            }).catch(() => {
                toast({ title: 'Error', description: 'Failed to fetch existing bio-data.', variant: 'destructive' });
            }).finally(() => {
                setIsLoading(false);
            });
        }
    }, [student.id, student.email, form, toast]);

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
                     <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="student@example.com" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="mobileNumber" render={({ field }) => (<FormItem><FormLabel>Mobile Number</FormLabel><FormControl><Input placeholder="10-digit number" {...field} value={field.value ?? ''}/></FormControl><FormMessage /></FormItem>)} />
                     <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <div className="grid grid-cols-3 gap-2">
                             <FormField control={form.control} name="dob_day" render={({ field }) => (<FormItem><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Day" /></SelectTrigger></FormControl><SelectContent>{days.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                             <FormField control={form.control} name="dob_month" render={({ field }) => (<FormItem><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Month" /></SelectTrigger></FormControl><SelectContent>{months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                             <FormField control={form.control} name="dob_year" render={({ field }) => (<FormItem><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger></FormControl><SelectContent>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                        </div>
                         <FormMessage>{form.formState.errors.dob_day?.message}</FormMessage>
                    </FormItem>
                    <FormField control={form.control} name="gender" render={({ field }) => (<FormItem><FormLabel>Gender</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger></FormControl><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                </div>
                <FormField control={form.control} name="aadharNumber" render={({ field }) => (<FormItem><FormLabel>Aadhar Number</FormLabel><FormControl><Input placeholder="XXXX XXXX XXXX" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(formatAadhar(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel>Full Address</FormLabel><FormControl><Textarea placeholder="Complete address" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />

                <h3 className="text-md font-semibold border-b pt-3 pb-2">Family & Community</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="fatherName" render={({ field }) => (<FormItem><FormLabel>Father's Name</FormLabel><FormControl><Input placeholder="Full name" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="fatherOccupation" render={({ field }) => (<FormItem><FormLabel>Father's Occupation</FormLabel><FormControl><Input placeholder="Job" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="fatherMobileNumber" render={({ field }) => (<FormItem><FormLabel>Father's Mobile</FormLabel><FormControl><Input placeholder="10-digit number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField control={form.control} name="religion" render={({ field }) => (<FormItem><FormLabel>Religion</FormLabel><FormControl><Input placeholder="e.g., Hinduism" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="community" render={({ field }) => (<FormItem><FormLabel>Community</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select community" /></SelectTrigger></FormControl><SelectContent>{['BC(MUSLIM)', 'OC', 'BC', 'MBC', 'SC', 'SCC', 'ST'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="caste" render={({ field }) => (<FormItem><FormLabel>Name of Caste</FormLabel><FormControl><Input placeholder="Caste name" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                </div>

                <FormField control={form.control} name="quota" render={({ field }) => (<FormItem className="space-y-2"><FormLabel>Admission Quota</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} value={field.value} className="flex items-center space-x-4"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="government" /></FormControl><FormLabel className="font-normal">Government</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="management" /></FormControl><FormLabel className="font-normal">Management</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>)} />
                
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

const getInitials = (name: string) => {
    if (!name) return '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
};

type StudentForBio = {id: string, name: string, email: string, rollNo?: string};

export default function AdminBioDataPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [students, setStudents] = useState<StudentForBio[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<StudentForBio[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<StudentForBio | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    const fetchStudents = async () => {
        setIsLoading(true);
        try {
            const studentList = await getStudentsForBioData();
            setStudents(studentList);
            setFilteredStudents(studentList);
        } catch {
            toast({ title: 'Error', description: 'Failed to fetch student list.', variant: 'destructive'});
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        const results = students.filter(student =>
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.rollNo?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredStudents(results);
    }, [searchTerm, students]);
    
    const handleEditClick = (student: StudentForBio) => {
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
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5"/> Student List</CardTitle>
                            <CardDescription>Select a student to view or edit their bio-data.</CardDescription>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search by name or roll no..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
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
                                    <TableHead>Roll No.</TableHead>
                                    <TableHead>Student Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredStudents.length > 0 ? filteredStudents.map((student) => (
                                    <TableRow key={student.id}>
                                        <TableCell>{student.rollNo || 'N/A'}</TableCell>
                                        <TableCell className="font-medium flex items-center gap-2">
                                            <Avatar className="h-8 w-8 border">
                                                <AvatarImage src={`https://placehold.co/100x100.png?text=${getInitials(student.name)}`} alt={student.name} data-ai-hint="student avatar" />
                                                <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                                            </Avatar>
                                            {student.name}
                                        </TableCell>
                                        <TableCell>{student.email}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" onClick={() => handleEditClick(student)}>
                                                <Edit className="mr-2 h-4 w-4" /> View / Edit Bio-data
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                     <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                          No students found.
                                        </TableCell>
                                      </TableRow>
                                )}
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
