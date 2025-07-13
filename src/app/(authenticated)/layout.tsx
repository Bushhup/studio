
'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
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
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { GraduationCap, Settings } from 'lucide-react';
import Link from 'next/link';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const role = session?.user?.role;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/'); // Redirect to login if not authenticated
    }
  }, [status, router]);
  
  if (status === 'loading' || !role) {
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
            <Link href="/home" className="flex items-center gap-2" aria-label="MCA Dept Home">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="font-headline text-2xl font-bold text-primary group-data-[collapsible=icon]:hidden">
                MCA Dept
              </span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <SidebarNav userRole={role} />
          </SidebarContent>
          <SidebarFooter className="p-2">
             <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith('/settings')} tooltip={{ children: "Settings" }}>
                        <Link href="/settings/account">
                            <Settings className="h-5 w-5" />
                            <span>Settings</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
             </SidebarMenu>
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
