
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { GraduationCap, LogIn, UserCog, Briefcase, ChevronLeft } from 'lucide-react';
import type { Role } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';

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
    if (status === 'authenticated' && session) {
        const redirectPath = (session as any).redirectPath || '/home';
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
      username: username,
      password: password,
      role: selectedRole,
      redirect: false, // We handle redirect manually after checking result
    });
    
    setIsLoggingIn(false);

    if (result?.ok) {
        toast({
            title: "Login Successful",
            description: "Redirecting to your dashboard...",
        });
        // The useEffect will handle the redirection, but we can try to force a reload of the session
        router.push('/login'); // Re-trigger the page to run useEffect with new session
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
        <div className="flex flex-col items-center gap-4 animate-pulse shadow-lg shadow-primary/30 p-8 rounded-full">
          <svg
            viewBox="0 0 24 24"
            className="h-32 w-32 theme-gradient-stroke"
            fill="none"
            stroke="url(#theme-gradient)"
            strokeWidth="1.5"
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
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-secondary p-4">
        <Card className="w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in-0 slide-in-from-top-10 duration-500">
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
                <Link href="/landing">
                    <GraduationCap className="h-16 w-16 text-primary" />
                </Link>
            </div>
            <CardTitle className="font-headline text-4xl tracking-tight text-primary">MCA Dept Login</CardTitle>
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
                    className="p-6 text-center cursor-pointer border-2 border-transparent hover:border-primary transition-all duration-300 ease-in-out hover:scale-105"
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
                  <div className="flex justify-center">
                    <Button type="submit" disabled={!username || !password || isLoggingIn} className="w-full">
                      {isLoggingIn ? (
                        <>
                          <GraduationCap className="mr-2 h-5 w-5 animate-pulse" />
                          Logging in...
                        </>
                      ) : (
                        <>
                          <LogIn className="mr-2 h-5 w-5" /> Login
                        </>
                      )}
                    </Button>
                  </div>
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
