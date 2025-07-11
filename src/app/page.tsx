
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { GraduationCap, LogIn } from 'lucide-react';
import type { Role } from '@/types';
import { useMockAuth } from '@/hooks/use-mock-auth';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<Role | ''>('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, role: currentRole, isLoading } = useMockAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && currentRole) {
      let redirectPath = '/home';
      if (currentRole === 'admin') redirectPath = '/admin/dashboard';
      else if (currentRole === 'faculty') redirectPath = '/faculty/dashboard';
      else if (currentRole === 'student') redirectPath = '/student/dashboard';
      router.replace(redirectPath);
    }
  }, [currentRole, isLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole && email && password) {
      const result = await login(selectedRole as Role, email, password);
      if (!result.success) {
        toast({
          title: "Login Failed",
          description: result.message || "Invalid credentials or role.",
          variant: "destructive",
        });
      }
    } else {
        toast({
            title: "Missing Information",
            description: "Please select a role and enter your email and password.",
            variant: "destructive"
        })
    }
  };

  if (isLoading || (!isLoading && currentRole)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center gap-4">
          <GraduationCap className="h-16 w-16 text-primary" />
          <p className="text-xl font-medium text-foreground">Loading MCA Dept...</p>
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
          <CardTitle className="font-headline text-4xl tracking-tight text-primary">MCA Dept</CardTitle>
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
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="user@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={!selectedRole || !email || !password || isLoading}>
              {isLoading ? 'Logging in...' : <><LogIn className="mr-2 h-5 w-5" /> Login</>}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} MCA Dept. All rights reserved.
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}
