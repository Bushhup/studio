
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { Role } from '@/types';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarGroup,
  SidebarGroupLabel
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, CalendarDays, BookOpenText, MessageSquareText, Briefcase, 
  Users, ClipboardList, GraduationCap, FileText, UploadCloud, DownloadCloud, 
  Sparkles, ListChecks, BarChart3, ShieldCheck, Settings, UserCog, BookCopy, School
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: Role[];
  subItems?: NavItem[];
  isDashboardLink?: boolean;
}

const navItems: NavItem[] = [
  { href: '/home', label: 'Home (Events)', icon: CalendarDays, roles: ['admin', 'faculty', 'student'] },
  { 
    href: '/dashboard', 
    label: 'Dashboard', 
    icon: LayoutDashboard, 
    roles: ['admin', 'faculty', 'student'],
    isDashboardLink: true, // Special flag to construct role-specific dashboard URL
  },
  { 
    href: '/materials', 
    label: 'Study Materials', 
    icon: BookOpenText, 
    roles: ['admin', 'faculty', 'student'],
    // subItems: [
    //   { href: '/materials/view', label: 'View Materials', icon: DownloadCloud, roles: ['admin', 'faculty', 'student'] },
    //   { href: '/materials/upload', label: 'Upload Material', icon: UploadCloud, roles: ['admin', 'faculty'] },
    // ]
  },
  { 
    href: '/feedback', 
    label: 'Feedback', 
    icon: MessageSquareText, 
    roles: ['admin', 'faculty', 'student'],
    // subItems: [
    //   { href: '/feedback/submit', label: 'Submit Feedback', icon: Send, roles: ['student'] },
    //   { href: '/feedback/summary', label: 'View Summary (AI)', icon: Sparkles, roles: ['admin', 'faculty'] },
    // ]
  },
  { href: '/placements', label: 'Placements Hub', icon: Briefcase, roles: ['admin', 'student'] },

  // Admin Specific
  { href: '/admin/users', label: 'User Management', icon: Users, roles: ['admin'] },
  { href: '/admin/classes', label: 'Class Management', icon: School, roles: ['admin'] },
  { href: '/admin/subjects', label: 'Subject Management', icon: BookCopy, roles: ['admin'] },
  
  // Faculty Specific
  { href: '/faculty/marks', label: 'Marks Entry', icon: ClipboardList, roles: ['faculty'] },
  { href: '/faculty/attendance', label: 'Attendance', icon: ListChecks, roles: ['faculty'] },
  { href: '/faculty/performance', label: 'Class Performance', icon: BarChart3, roles: ['faculty'] },

  // Student Specific
  { href: '/student/my-marks', label: 'My Marks', icon: GraduationCap, roles: ['student'] },
  { href: '/student/my-attendance', label: 'My Attendance', icon: ShieldCheck, roles: ['student'] },
  { href: '/student/my-performance', label: 'My Performance', icon: BarChart3, roles: ['student'] },
];


export function SidebarNav({ userRole }: { userRole: Role | null }) {
  const pathname = usePathname();

  if (!userRole) return null;

  const filteredNavItems = navItems.filter(item => item.roles.includes(userRole));
  
  const getDashboardPath = (role: Role) => `/${role}/dashboard`;

  return (
    <SidebarMenu>
      {filteredNavItems.map((item) => {
        const href = item.isDashboardLink ? getDashboardPath(userRole) : item.href;
        const isActive = pathname === href || (item.subItems && item.subItems.some(sub => pathname === sub.href));
        
        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              tooltip={{ children: item.label, className: "capitalize" }}
            >
              <Link href={href}>
                <item.icon className="h-5 w-5" />
                <span className="truncate capitalize">{item.label}</span>
              </Link>
            </SidebarMenuButton>
            {item.subItems && item.subItems.length > 0 && (
              <SidebarMenuSub>
                {item.subItems.filter(subItem => subItem.roles.includes(userRole)).map(subItem => (
                  <SidebarMenuSubItem key={subItem.href}>
                    <SidebarMenuSubButton asChild isActive={pathname === subItem.href}>
                      <Link href={subItem.href}>
                        <subItem.icon className="h-4 w-4" />
                        <span className="truncate capitalize">{subItem.label}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            )}
          </SidebarMenuItem>
        );
      })}
        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarMenuItem>
             <SidebarMenuButton asChild tooltip={{ children: "Account Settings" }}>
                <Link href="/settings/account">
                    <UserCog className="h-5 w-5" />
                    <span>Account Settings</span>
                </Link>
             </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarGroup>
    </SidebarMenu>
  );
}
