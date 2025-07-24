
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
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
import { LogOut, Settings, UserCircle, PanelLeft, Moon, Sun, Monitor, LogIn as LogInIcon, GraduationCap } from 'lucide-react';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { useSession, signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

export function Header() {
  const { toggleSidebar } = useSidebar();
  const { setTheme } = useTheme();
  const { data: session, status } = useSession();
  const user = session?.user;
  const role = user?.role;
  const isAuthenticated = status === 'authenticated';
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };
  
  const userName = user?.name || (role ? `${role.charAt(0).toUpperCase() + role.slice(1)} User` : "User");

  const handleLogout = () => {
    signOut({ callbackUrl: '/landing' });
  }

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
                  <Link href="/settings/account">
                    <UserCircle className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                   <Link href="/settings/account">
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
  );
}
