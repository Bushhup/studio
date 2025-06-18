'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GraduationCap, LogIn } from 'lucide-react';
import type { Role } from '@/types';
import { useMockAuth } from '@/hooks/use-mock-auth';

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<Role | ''>('');
  const { login, role: currentRole, isLoading } = useMockAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && currentRole) {
      // User is already logged in, redirect them
      let redirectPath = '/home';
      if (currentRole === 'admin') redirectPath = '/admin/dashboard';
      else if (currentRole === 'faculty') redirectPath = '/faculty/dashboard';
      else if (currentRole === 'student') redirectPath = '/student/dashboard';
      router.replace(redirectPath);
    }
  }, [currentRole, isLoading, router]);


  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole) {
      login(selectedRole as Role);
    }
  };

  if (isLoading || (!isLoading && currentRole)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center gap-4">
          <GraduationCap className="h-16 w-16 text-primary" />
          <p className="text-xl font-medium text-foreground">Loading DeptLink...</p>
        </div>
      </div>
    );
  }
  

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-secondary p-6 sm:p-8">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <GraduationCap className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="font-headline text-4xl tracking-tight text-primary">DeptLink</CardTitle>
          <CardDescription className="text-muted-foreground pt-1">
            MCA Department Management System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="role" className="text-foreground">Select Your Role</Label>
              <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as Role)}>
                <SelectTrigger id="role" className="w-full focus:ring-accent">
                  <SelectValue placeholder="Choose a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="faculty">Faculty</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={!selectedRole}>
              <LogIn className="mr-2 h-5 w-5" /> Login
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} DeptLink. All rights reserved.
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}
