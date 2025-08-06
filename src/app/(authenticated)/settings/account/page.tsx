
'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCog, KeyRound, BellRing, Camera, FileText, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { updateProfile, changePassword, getStudentBioForProfile } from './actions';
import { useSession } from 'next-auth/react';
import type { IStudentBio } from '@/models/studentBio.model';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { format } from 'date-fns';

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string().min(6, "New password must be at least 6 characters."),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "New passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

function BioDataDisplay({ bioData }: { bioData: IStudentBio }) {
    return (
        <div className="space-y-4 text-sm">
            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Read-Only Information</AlertTitle>
                <AlertDescription>
                    Your bio-data is displayed below. To make any corrections, please contact your class in-charge or the department office.
                </AlertDescription>
            </Alert>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                <div><Label>Email</Label><p className="text-muted-foreground">{bioData.email}</p></div>
                <div><Label>Date of Birth</Label><p className="text-muted-foreground">{format(new Date(bioData.dob), "PPP")}</p></div>
                <div><Label>Mobile Number</Label><p className="text-muted-foreground">{bioData.mobileNumber}</p></div>
                <div><Label>Gender</Label><p className="text-muted-foreground capitalize">{bioData.gender}</p></div>
                <div className="lg:col-span-2"><Label>Aadhar Number</Label><p className="text-muted-foreground">{bioData.aadharNumber}</p></div>
                <div className="md:col-span-2 lg:col-span-3"><Label>Address</Label><p className="text-muted-foreground">{bioData.address}</p></div>
                <div><Label>Father's Name</Label><p className="text-muted-foreground">{bioData.fatherName}</p></div>
                <div><Label>Father's Occupation</Label><p className="text-muted-foreground">{bioData.fatherOccupation}</p></div>
                <div><Label>Father's Mobile</Label><p className="text-muted-foreground">{bioData.fatherMobileNumber}</p></div>
                <div><Label>Religion</Label><p className="text-muted-foreground">{bioData.religion}</p></div>
                <div><Label>Community</Label><p className="text-muted-foreground">{bioData.community}</p></div>
                <div><Label>Caste</Label><p className="text-muted-foreground">{bioData.caste}</p></div>
                <div><Label>Admission Quota</Label><p className="text-muted-foreground capitalize">{bioData.quota}</p></div>
            </div>
        </div>
    );
}

export default function AccountSettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const user = session?.user;
  
  const { toast } = useToast();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [bioData, setBioData] = useState<IStudentBio | null>(null);
  const [isLoadingBio, setIsLoadingBio] = useState(true);

  useEffect(() => {
    if (user?.role === 'student' && user?.id) {
        setIsLoadingBio(true);
        getStudentBioForProfile(user.id)
            .then(setBioData)
            .catch(() => toast({ title: "Error", description: "Could not fetch your bio-data.", variant: "destructive" }))
            .finally(() => setIsLoadingBio(false));
    } else {
        setIsLoadingBio(false);
    }
  }, [user?.id, user?.role, toast]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const userName = user?.name || 'User';
  const userEmail = user?.email || 'user@example.com';
  
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: userName },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
        toast({ title: "Avatar Updated (Mock)", description: "Profile picture changes are not saved in this demo." });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const onProfileSubmit = async (data: ProfileFormValues) => {
      if (!user?.id) return;
      
      const result = await updateProfile(user.id, data);
      
      if (result.success) {
        toast({ title: "Profile Updated", description: result.message });
        await updateSession({ name: data.name });
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
      }
  };

  const onPasswordSubmit = async (data: PasswordFormValues) => {
     if (!user?.id) return;

     const result = await changePassword(user.id, { currentPassword: data.currentPassword, newPassword: data.newPassword });
     
     if (result.success) {
        toast({ title: "Password Changed", description: result.message });
        passwordForm.reset();
     } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
     }
  };


  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center gap-3">
        <UserCog className="h-10 w-10 text-primary" />
        <div>
          <h1 className="font-headline text-4xl font-bold tracking-tight text-primary">Account Settings</h1>
          <p className="text-muted-foreground">Manage your profile, password, and notification preferences.</p>
        </div>
      </div>
      
      <div className="grid gap-8 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserCog className="h-5 w-5"/> Profile Information</CardTitle>
            <CardDescription>Update your personal details and profile picture.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
                <div className="relative">
                    <Avatar className="h-24 w-24 border-4 border-primary/50">
                        <AvatarImage src={avatarPreview || `https://placehold.co/100x100.png?text=${getInitials(userName)}`} alt={userName} data-ai-hint="user avatar" />
                        <AvatarFallback>{getInitials(userName)}</AvatarFallback>
                    </Avatar>
                    <Button
                        variant="outline"
                        size="icon"
                        className="absolute bottom-0 right-0 rounded-full h-8 w-8"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Camera className="h-4 w-4" />
                        <span className="sr-only">Change profile picture</span>
                    </Button>
                    <Input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleAvatarChange}
                    />
                </div>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4 flex-grow">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" {...profileForm.register("name")} />
                             {profileForm.formState.errors.name && <p className="text-sm text-destructive mt-1">{profileForm.formState.errors.name.message}</p>}
                        </div>
                        <div>
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" type="email" value={userEmail} disabled />
                        </div>
                    </div>
                    <Button type="submit" disabled={profileForm.formState.isSubmitting}>
                      {profileForm.formState.isSubmitting && <svg
                        viewBox="0 0 24 24"
                        className="mr-2 h-4 w-4 animate-pulse"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                        <path d="M6 12v5c3 3 9 3 12 0v-5" />
                    </svg>}
                      Save Profile Changes
                    </Button>
                 </form>
            </div>
          </CardContent>
        </Card>

        {user?.role === 'student' && (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5"/> My Bio-data</CardTitle>
                    <CardDescription>Your personal information on record.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoadingBio ? (
                        <div className="space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <div className="grid grid-cols-3 gap-4">
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full" />
                            </div>
                        </div>
                    ) : bioData ? (
                        <BioDataDisplay bioData={bioData} />
                    ) : (
                        <p className="text-muted-foreground text-center py-4">Your bio-data has not been filled out yet. Please contact the department office to add your information.</p>
                    )}
                </CardContent>
            </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5"/> Change Password</CardTitle>
            <CardDescription>Update your account password for better security.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4 max-w-md">
                <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" {...passwordForm.register("currentPassword")} />
                    {passwordForm.formState.errors.currentPassword && <p className="text-sm text-destructive mt-1">{passwordForm.formState.errors.currentPassword.message}</p>}
                </div>
                <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" {...passwordForm.register("newPassword")} />
                     {passwordForm.formState.errors.newPassword && <p className="text-sm text-destructive mt-1">{passwordForm.formState.errors.newPassword.message}</p>}
                </div>
                <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" type="password" {...passwordForm.register("confirmPassword")} />
                     {passwordForm.formState.errors.confirmPassword && <p className="text-sm text-destructive mt-1">{passwordForm.formState.errors.confirmPassword.message}</p>}
                </div>
                <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
                   {passwordForm.formState.isSubmitting && <svg
                        viewBox="0 0 24 24"
                        className="mr-2 h-4 w-4 animate-pulse"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                        <path d="M6 12v5c3 3 9 3 12 0v-5" />
                    </svg>}
                   Update Password
                </Button>
            </form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BellRing className="h-5 w-5"/> Notification Preferences</CardTitle>
            <CardDescription>Manage how you receive notifications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
                <span>Email Notifications</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  Receive important updates via email.
                </span>
              </Label>
              <Switch id="email-notifications" defaultChecked />
            </div>
             <div className="flex items-center justify-between">
              <Label htmlFor="inapp-notifications" className="flex flex-col space-y-1">
                <span>In-App Notifications</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  Show notifications within the MCA Dept app.
                </span>
              </Label>
              <Switch id="inapp-notifications" defaultChecked />
            </div>
            <Button onClick={() => toast({ title: "Preferences Saved (Mock)", description: "Your notification settings have been updated."})}>Save Notification Settings</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
