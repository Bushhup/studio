'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMockAuth } from '@/hooks/use-mock-auth';
import { Header } from '@/components/layout/header';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarHeader, 
  SidebarContent, 
  SidebarFooter,
  SidebarInset,
  SidebarRail,
} from '@/components/ui/sidebar';
import { GraduationCap, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role, isLoading, logout } = useMockAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !role) {
      router.replace('/'); // Redirect to login if not authenticated
    }
  }, [role, isLoading, router]);

  if (isLoading || !role) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <GraduationCap className="h-12 w-12 animate-pulse text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen>
        <Sidebar variant="sidebar" collapsible="icon" side="left">
          <SidebarHeader className="items-center justify-center p-4">
            <Link href="/home" className="flex items-center gap-2" aria-label="DeptLink Home">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="font-headline text-2xl font-bold text-primary group-data-[collapsible=icon]:hidden">
                DeptLink
              </span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <SidebarNav userRole={role} />
          </SidebarContent>
          <SidebarFooter className="p-2">
             {/* Placeholder for footer items like dark mode toggle or quick settings */}
          </SidebarFooter>
        </Sidebar>
        <SidebarRail />
        <SidebarInset className="flex flex-col">
            <Header />
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-background">
              {children}
            </main>
        </SidebarInset>
    </SidebarProvider>
  );
}
