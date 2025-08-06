
'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSession } from 'next-auth/react';
import { getStudentBio, saveStudentBio } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from '@/components/ui/textarea';
import { FileText, Save } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import mongoose from 'mongoose';

// Schema is defined here in the client component
const studentBioSchema = z.object({
  studentId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val)),
  mobileNumber: z.string().min(10, "Mobile number must be at least 10 digits."),
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

export default function StudentBioDataPage() {
    const { data: session } = useSession();
    const studentId = session?.user?.id;
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);

    const form = useForm<StudentBioInput>({
        resolver: zodResolver(studentBioSchema),
        defaultValues: {
            mobileNumber: '',
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
        if (studentId) {
            setIsLoading(true);
            getStudentBio(studentId).then(bioData => {
                if (bioData) {
                    form.reset({
                        ...bioData,
                        studentId: bioData.studentId.toString(),
                        aadharNumber: formatAadhar(bioData.aadharNumber)
                    });
                } else {
                    // Set studentId even if no bio data is found yet
                    form.setValue('studentId', studentId);
                }
                setIsLoading(false);
            }).catch(() => {
                toast({ title: 'Error', description: 'Failed to fetch existing bio-data.', variant: 'destructive' });
                setIsLoading(false);
            });
        }
    }, [studentId, form, toast]);

    const onSubmit = async (data: StudentBioInput) => {
        if (!studentId) return;
        
        const result = await saveStudentBio({ ...data, studentId });

        if (result.success) {
            toast({ title: 'Success', description: result.message });
        } else {
            toast({ title: 'Error', description: result.message, variant: 'destructive' });
        }
    };

    if (isLoading) {
       return (
         <div className="flex min-h-screen items-center justify-center bg-background p-4">
           <svg
             viewBox="0 0 24 24"
             className="h-16 w-16 animate-pulse theme-gradient-stroke"
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
       )
    }

    return (
        <div className="container mx-auto py-8">
            <div className="mb-8 flex items-center gap-3">
                <FileText className="h-10 w-10 text-primary" />
                <div>
                    <h1 className="font-headline text-4xl font-bold tracking-tight text-primary">My Bio-data</h1>
                    <p className="text-muted-foreground">Keep your personal information up-to-date.</p>
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Personal Information Form</CardTitle>
                    <CardDescription>Please fill out all fields accurately. This information is confidential.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <h3 className="text-lg font-semibold border-b pb-2">Student Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField control={form.control} name="mobileNumber" render={({ field }) => (
                                    <FormItem><FormLabel>Mobile Number</FormLabel><FormControl><Input placeholder="Your 10-digit number" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="gender" render={({ field }) => (
                                    <FormItem><FormLabel>Gender</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="male">Male</SelectItem>
                                                <SelectItem value="female">Female</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    <FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="aadharNumber" render={({ field }) => (
                                    <FormItem><FormLabel>Aadhar Number</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder="XXXX XXXX XXXX" 
                                                {...field}
                                                onChange={(e) => field.onChange(formatAadhar(e.target.value))}
                                            />
                                        </FormControl>
                                    <FormMessage /></FormItem>
                                )} />
                            </div>
                            <FormField control={form.control} name="address" render={({ field }) => (
                                <FormItem><FormLabel>Full Address</FormLabel><FormControl><Textarea placeholder="Your complete address" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            
                            <h3 className="text-lg font-semibold border-b pt-4 pb-2">Family & Community</h3>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField control={form.control} name="fatherName" render={({ field }) => (
                                    <FormItem><FormLabel>Father's Name</FormLabel><FormControl><Input placeholder="Father's full name" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="fatherOccupation" render={({ field }) => (
                                    <FormItem><FormLabel>Father's Occupation</FormLabel><FormControl><Input placeholder="Father's job" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="fatherMobileNumber" render={({ field }) => (
                                    <FormItem><FormLabel>Father's Mobile</FormLabel><FormControl><Input placeholder="Father's 10-digit number" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField control={form.control} name="religion" render={({ field }) => (
                                    <FormItem><FormLabel>Religion</FormLabel><FormControl><Input placeholder="e.g., Hinduism, Islam, Christianity" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="community" render={({ field }) => (
                                    <FormItem><FormLabel>Community</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select community" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {['BC(MUSLIM)', 'OC', 'BC', 'MBC', 'SC', 'SCC', 'ST'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    <FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="caste" render={({ field }) => (
                                    <FormItem><FormLabel>Name of Caste</FormLabel><FormControl><Input placeholder="Enter your caste name" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                            
                             <FormField control={form.control} name="quota" render={({ field }) => (
                                <FormItem className="space-y-3"><FormLabel>Admission Quota</FormLabel>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex items-center space-x-4">
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl><RadioGroupItem value="government" /></FormControl>
                                            <FormLabel className="font-normal">Government</FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl><RadioGroupItem value="management" /></FormControl>
                                            <FormLabel className="font-normal">Management</FormLabel>
                                        </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage /></FormItem>
                            )} />

                            <div className="flex justify-end pt-4">
                                <Button type="submit" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting ? <svg
                                        viewBox="0 0 24 24"
                                        className="mr-2 h-4 w-4 animate-pulse"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    ><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg> : <Save className="mr-2 h-4 w-4" />}
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
