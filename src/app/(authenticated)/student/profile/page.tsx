
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
import { FileText, Save, Calendar as CalendarIcon, User } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { getStudentBio, saveStudentBio } from './actions';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';

const studentBioSchema = z.object({
  mobileNumber: z.string().optional(),
  email: z.string().email("Invalid email address.").optional().or(z.literal('')),
  dob: z.date().optional(),
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
});

type StudentBioInput = z.infer<typeof studentBioSchema>;

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

export default function StudentProfilePage() {
    const { data: session } = useSession();
    const student = session?.user;
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);

    const form = useForm<StudentBioInput>({
        resolver: zodResolver(studentBioSchema),
        defaultValues: {
            mobileNumber: '',
            email: student?.email || '',
            dob: undefined,
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
        if (student?.id) {
            setIsLoading(true);
            getStudentBio(student.id).then(bioData => {
                if (bioData) {
                    form.reset({
                        ...bioData,
                        aadharNumber: bioData.aadharNumber ? formatAadhar(bioData.aadharNumber) : '',
                        dob: bioData.dob ? new Date(bioData.dob) : undefined,
                        email: bioData.email || student.email,
                    });
                } else {
                    form.reset({
                        email: student.email,
                        mobileNumber: '',
                        fatherName: '',
                        fatherOccupation: '',
                        fatherMobileNumber: '',
                        address: '',
                        religion: '',
                        caste: '',
                        aadharNumber: '',
                        dob: undefined,
                        gender: undefined,
                        community: undefined,
                        quota: undefined
                    });
                }
            }).catch(() => {
                toast({ title: 'Error', description: 'Failed to fetch existing bio-data.', variant: 'destructive' });
            }).finally(() => {
                setIsLoading(false);
            });
        }
    }, [student?.id, student?.email, form, toast]);

    const onSubmit = async (data: StudentBioInput) => {
        if (!student?.id) {
            toast({ title: 'Error', description: 'Could not identify student.', variant: 'destructive' });
            return;
        }
        const result = await saveStudentBio({ ...data, studentId: student.id });

        if (result.success) {
            toast({ title: 'Success', description: result.message });
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
        <div className="container mx-auto py-8">
            <div className="mb-8 flex items-center gap-3">
                <User className="h-10 w-10 text-primary" />
                <div>
                    <h1 className="font-headline text-4xl font-bold tracking-tight text-primary">My Profile</h1>
                    <p className="text-muted-foreground">Keep your personal information up-to-date.</p>
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Bio-data Form</CardTitle>
                    <CardDescription>This information is used for official college records. Please ensure it is accurate.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <h3 className="text-lg font-semibold border-b pb-2">Student Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="student@example.com" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="mobileNumber" render={({ field }) => (<FormItem><FormLabel>Mobile Number</FormLabel><FormControl><Input placeholder="10-digit number" {...field} value={field.value ?? ''}/></FormControl><FormMessage /></FormItem>)} />
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
                                <FormField control={form.control} name="gender" render={({ field }) => (<FormItem><FormLabel>Gender</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger></FormControl><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                            </div>
                            <FormField control={form.control} name="aadharNumber" render={({ field }) => (<FormItem><FormLabel>Aadhar Number</FormLabel><FormControl><Input placeholder="XXXX XXXX XXXX" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(formatAadhar(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel>Full Address</FormLabel><FormControl><Textarea placeholder="Complete address" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />

                            <h3 className="text-lg font-semibold border-b pt-4 pb-2">Family & Community</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="fatherName" render={({ field }) => (<FormItem><FormLabel>Father's Name</FormLabel><FormControl><Input placeholder="Full name" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="fatherOccupation" render={({ field }) => (<FormItem><FormLabel>Father's Occupation</FormLabel><FormControl><Input placeholder="Job" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="fatherMobileNumber" render={({ field }) => (<FormItem><FormLabel>Father's Mobile</FormLabel><FormControl><Input placeholder="10-digit number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField control={form.control} name="religion" render={({ field }) => (<FormItem><FormLabel>Religion</FormLabel><FormControl><Input placeholder="e.g., Hinduism" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="community" render={({ field }) => (<FormItem><FormLabel>Community</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select community" /></SelectTrigger></FormControl><SelectContent>{['BC(MUSLIM)', 'OC', 'BC', 'MBC', 'SC', 'SCC', 'ST'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="caste" render={({ field }) => (<FormItem><FormLabel>Name of Caste</FormLabel><FormControl><Input placeholder="Caste name" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                            </div>

                            <FormField control={form.control} name="quota" render={({ field }) => (<FormItem className="space-y-3"><FormLabel>Admission Quota</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} value={field.value} className="flex items-center space-x-4"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="government" /></FormControl><FormLabel className="font-normal">Government</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="management" /></FormControl><FormLabel className="font-normal">Management</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>)} />
                            
                             <div className="flex justify-end pt-4">
                                <Button type="submit" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting ? <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4 animate-pulse" fill="none" stroke="currentColor"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg> : <Save className="mr-2 h-4 w-4" />}
                                    Save Bio-data
                                </Button>
                             </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
