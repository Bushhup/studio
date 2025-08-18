
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent
} from '@/components/ui/dropdown-menu';
import { LogOut, Settings, UserCircle, PanelLeft, Moon, Sun, Monitor, LogIn as LogInIcon, GraduationCap, LayoutDashboard, Info } from 'lucide-react';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { useSession, signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { getStudentBioForProfile } from '@/app/(authenticated)/settings/account/actions';
import { IStudentBio } from '@/models/studentBio.model';
import { Label } from '../ui/label';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { ScrollArea } from '../ui/scroll-area';
import { format } from 'date-fns';


const getInitials = (name: string) => {
    if (!name) return '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
};

const formatAadhar = (value?: string) => {
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


function StudentProfileDialog({ studentId, studentName, isOpen, setIsOpen }: {
    studentId: string,
    studentName: string,
    isOpen: boolean,
    setIsOpen: (open: boolean) => void,
}) {
    const [bioData, setBioData] = useState<IStudentBio | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            getStudentBioForProfile(studentId)
                .then(setBioData)
                .finally(() => setIsLoading(false));
        }
    }, [isOpen, studentId]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border-2 border-primary">
                            <AvatarImage src={`https://placehold.co/100x100.png?text=${getInitials(studentName)}`} alt={studentName} data-ai-hint="student avatar" />
                            <AvatarFallback>{getInitials(studentName)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <DialogTitle className="font-headline text-2xl">Student Profile: {studentName}</DialogTitle>
                            {bioData?.email && <DialogDescription>{bioData.email}</DialogDescription>}
                        </div>
                    </div>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh] p-1">
                {isLoading ? (
                     <div className="flex justify-center items-center h-48">
                        <svg viewBox="0 0 24 24" className="h-8 w-8 animate-pulse theme-gradient-stroke" fill="none" stroke="url(#theme-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
                     </div>
                ) : bioData ? (
                    <div className="space-y-4 text-sm p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                            <div><Label>Email</Label><p className="text-muted-foreground">{bioData.email || 'N/A'}</p></div>
                            <div><Label>Date of Birth</Label><p className="text-muted-foreground">{bioData.dob ? format(new Date(bioData.dob), "PPP") : 'N/A'}</p></div>
                            <div><Label>Mobile Number</Label><p className="text-muted-foreground">{bioData.mobileNumber || 'N/A'}</p></div>
                            <div><Label>Gender</Label><p className="text-muted-foreground capitalize">{bioData.gender || 'N/A'}</p></div>
                            <div className="lg:col-span-2"><Label>Aadhar Number</Label><p className="text-muted-foreground">{formatAadhar(bioData.aadharNumber) || 'N/A'}</p></div>
                            <div className="md:col-span-2 lg:col-span-3"><Label>Address</Label><p className="text-muted-foreground">{bioData.address || 'N/A'}</p></div>
                            <div><Label>Father's Name</Label><p className="text-muted-foreground">{bioData.fatherName || 'N/A'}</p></div>
                            <div><Label>Father's Occupation</Label><p className="text-muted-foreground">{bioData.fatherOccupation || 'N/A'}</p></div>
                            <div><Label>Father's Mobile</Label><p className="text-muted-foreground">{bioData.fatherMobileNumber || 'N/A'}</p></div>
                            <div><Label>Religion</Label><p className="text-muted-foreground">{bioData.religion || 'N/A'}</p></div>
                            <div><Label>Community</Label><p className="text-muted-foreground">{bioData.community || 'N/A'}</p></div>
                            <div><Label>Caste</Label><p className="text-muted-foreground">{bioData.caste || 'N/A'}</p></div>
                            <div><Label>Admission Quota</Label><p className="text-muted-foreground capitalize">{bioData.quota || 'N/A'}</p></div>
                        </div>
                    </div>
                ) : (
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>No Bio-data Found</AlertTitle>
                        <AlertDescription>Your bio-data has not been entered by the admin yet. Please contact them for assistance.</AlertDescription>
                    </Alert>
                )}
                </ScrollArea>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export function Header() {
  const { toggleSidebar } = useSidebar();
  const { setTheme } = useTheme();
  const { data: session, status } = useSession();
  const user = session?.user;
  const role = user?.role;
  const isAuthenticated = status === 'authenticated';
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const userName = user?.name || (role ? `${role.charAt(0).toUpperCase() + role.slice(1)} User` : "User");

  const handleLogout = () => {
    signOut({ callbackUrl: '/landing' });
  }

  const getDashboardPath = () => {
    if (!role) return '/login';
    switch (role) {
        case 'admin': return '/authenticated/admin/dashboard';
        case 'faculty': return '/authenticated/faculty/dashboard';
        case 'student': return '/authenticated/student/dashboard';
        default: return '/authenticated/home';
    }
  };
  
  const handleProfileClick = (e: React.MouseEvent) => {
    if (role === 'student') {
        e.preventDefault();
        setIsProfileOpen(true);
    }
    // For other roles, it will proceed with the Link's href
  };

  useEffect(() => {
    const handleScroll = () => {
      // Only apply scroll effect on the landing page
      if (pathname === '/landing') {
        setIsScrolled(window.scrollY > 10);
      } else {
        setIsScrolled(true); // Keep header solid on other pages
      }
    };
    
    // Set initial state based on current path
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [pathname]);


  return (
    <>
    <header className={cn(
        "sticky top-0 z-40 flex h-16 items-center gap-4 px-4 md:px-6 transition-all duration-300",
        isScrolled || !isAuthenticated ? "border-b bg-background/95 backdrop-blur-md" : "bg-transparent border-b-transparent",
        !isAuthenticated && "bg-transparent" // Public header specific style
    )}>
        {isAuthenticated ? (
          <>
            <div className="md:hidden">
              <SidebarTrigger>
                 <PanelLeft className="h-6 w-6" />
              </SidebarTrigger>
            </div>
            <div className="hidden md:block">
               <SidebarTrigger/>
            </div>
          </>
        ) : (
             <Link href="/landing" className="flex items-center gap-2" aria-label="MCA Dept Home">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="font-headline text-2xl font-bold text-primary">
                MCA Dept
              </span>
            </Link>
        )}

      <div className="flex w-full items-center justify-end">
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            pathname === '/landing' ? (
                <Button asChild>
                    <Link href={getDashboardPath()}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Account
                    </Link>
                </Button>
            ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10 border-2 border-primary/50">
                        <AvatarImage src={`https://placehold.co/100x100.png?text=${getInitials(userName)}`} alt={userName} data-ai-hint="user avatar" />
                        <AvatarFallback>{getInitials(userName)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{userName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {role ? `${role.charAt(0).toUpperCase() + role.slice(1)}` : 'Role'}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={role === 'student' ? '#' : '/authenticated/settings/account'} onClick={handleProfileClick}>
                        <UserCircle className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                       <Link href="/authenticated/settings/account">
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <Sun className="mr-2 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute mr-2 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span>Theme</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                          <DropdownMenuItem onClick={() => setTheme('light')}>
                            <Sun className="mr-2 h-4 w-4" />
                            <span>Light</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setTheme('dark')}>
                            <Moon className="mr-2 h-4 w-4" />
                            <span>Dark</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setTheme('system')}>
                            <Monitor className="mr-2 h-4 w-4" />
                            <span>System</span>
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            )
          ) : (
            <Button asChild>
                <Link href="/login">
                    <LogInIcon className="mr-2 h-4 w-4" />
                    Login
                </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
    {user && role === 'student' && (
        <StudentProfileDialog
            studentId={user.id}
            studentName={userName}
            isOpen={isProfileOpen}
            setIsOpen={setIsProfileOpen}
        />
    )}
    </>
  );
}
