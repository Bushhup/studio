
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { GraduationCap, LogIn, UserCog, Briefcase, ChevronLeft, Loader2 } from 'lucide-react';
import type { Role } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { signIn, useSession } from 'next-auth/react';

const roleIcons = {
  admin: <UserCog className="h-10 w-10 mx-auto mb-4" />,
  faculty: <Briefcase className="h-10 w-10 mx-auto mb-4" />,
  student: <GraduationCap className="h-10 w-10 mx-auto mb-4" />,
};

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role) {
      let redirectPath = '/home';
      if (session.user.role === 'admin') redirectPath = '/admin/dashboard';
      else if (session.user.role === 'faculty') redirectPath = '/faculty/dashboard';
      else if (session.user.role === 'student') redirectPath = '/student/dashboard';
      router.replace(redirectPath);
    }
  }, [status, session, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole || !username || !password) {
      toast({
        title: "Missing Information",
        description: "Please select a role, and enter your username and password.",
        variant: "destructive"
      });
      return;
    }

    setIsLoggingIn(true);

    const result = await signIn('credentials', {
      redirect: false,
      username: username,
      password: password,
      role: selectedRole,
    });
    
    setIsLoggingIn(false);

    if (result?.ok && !result?.error) {
        let redirectPath = '/home';
        if (selectedRole === 'admin') redirectPath = '/admin/dashboard';
        else if (selectedRole === 'faculty') redirectPath = '/faculty/dashboard';
        else if (selectedRole === 'student') redirectPath = '/student/dashboard';
        router.replace(redirectPath);
    } else {
      toast({
        title: "Login Failed",
        description: result?.error || "Invalid credentials or role. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
  };

  const handleBack = () => {
    setSelectedRole(null);
    setUsername('');
    setPassword('');
  };


  if (status === 'loading' || status === 'authenticated') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center gap-4">
          <GraduationCap className="h-16 w-16 text-primary animate-pulse" />
          <p className="text-xl font-medium text-foreground">Loading MCA Dept...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-secondary p-6 sm:p-8">
      <Card className="w-full max-w-md shadow-2xl overflow-hidden">
        <CardHeader className="text-center relative">
           {selectedRole && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 left-4"
              onClick={handleBack}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          )}
          <div className="mb-4 flex justify-center">
            <GraduationCap className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="font-headline text-4xl tracking-tight text-primary">MCA Dept</CardTitle>
          <CardDescription className="text-muted-foreground pt-1">
            {selectedRole ? `Login as ${selectedRole}` : 'Select your role to begin'}
          </CardDescription>
        </CardHeader>
        <CardContent className="transition-all duration-500">
          {!selectedRole ? (
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(['admin', 'faculty', 'student'] as Role[]).map((role) => (
                <Card
                  key={role}
                  className="p-6 text-center cursor-pointer hover:bg-muted hover:border-primary transition-all duration-300 ease-in-out hover:scale-105"
                  onClick={() => handleRoleSelect(role)}
                >
                  {roleIcons[role]}
                  <p className="font-semibold capitalize">{role}</p>
                </Card>
              ))}
            </div>
          ) : (
             <form onSubmit={handleLogin} className="space-y-6 animate-in fade-in-50">
                <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
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

                <Button type="submit" className="w-full" disabled={!username || !password || isLoggingIn}>
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-5 w-5" /> Login
                    </>
                  )}
                </Button>
            </form>
          )}
         
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
