
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Role } from '@/types';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, CalendarDays, BookOpenText, MessageSquareText, Briefcase, 
  Users, ClipboardList, GraduationCap, 
  ListChecks, BarChart3, ShieldCheck, BookCopy, School, Calendar, FileText
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: Role[];
  isDashboardLink?: boolean;
}

const navItems: NavItem[] = [
  { href: '/authenticated/home', label: 'Home (Events)', icon: CalendarDays, roles: ['admin', 'faculty', 'student'] },
  { 
    href: '/dashboard', 
    label: 'Dashboard', 
    icon: LayoutDashboard, 
    roles: ['admin', 'faculty', 'student'],
    isDashboardLink: true,
  },
  { 
    href: '/authenticated/materials', 
    label: 'Study Materials', 
    icon: BookOpenText, 
    roles: ['admin', 'faculty', 'student'],
  },
  { 
    href: '/authenticated/feedback', 
    label: 'Feedback', 
    icon: MessageSquareText, 
    roles: ['admin', 'faculty', 'student'],
  },
  { href: '/authenticated/placements', label: 'Placements Hub', icon: Briefcase, roles: ['admin', 'student'] },

  // Admin Specific
  { href: '/authenticated/admin/users', label: 'User Management', icon: Users, roles: ['admin'] },
  { href: '/authenticated/admin/classes', label: 'Class Management', icon: School, roles: ['admin'] },
  { href: '/authenticated/admin/subjects', label: 'Subject Management', icon: BookCopy, roles: ['admin'] },
  { href: '/authenticated/admin/bio-data', label: 'Student Bio-data', icon: FileText, roles: ['admin'] },
  
  // Faculty Specific
  { href: '/authenticated/faculty/marks', label: 'Marks Entry', icon: ClipboardList, roles: ['faculty'] },
  { href: '/authenticated/faculty/attendance', label: 'Attendance', icon: ListChecks, roles: ['faculty'] },
  { href: '/authenticated/faculty/performance', label: 'Class Performance', icon: BarChart3, roles: ['faculty'] },

  // Student Specific
  { href: '/authenticated/student/my-marks', label: 'My Marks', icon: GraduationCap, roles: ['student'] },
  { href: '/authenticated/student/my-attendance', label: 'My Attendance', icon: ShieldCheck, roles: ['student'] },
  { href: '/authenticated/student/my-performance', label: 'My Performance', icon: BarChart3, roles: ['student'] },
  { href: '/authenticated/student/my-timetable', label: 'My Timetable', icon: Calendar, roles: ['student'] },
];


export function SidebarNav({ userRole }: { userRole: Role | null }) {
  const pathname = usePathname();

  if (!userRole) return null;

  const filteredNavItems = navItems.filter(item => item.roles.includes(userRole));
  
  const getDashboardPath = (role: Role) => `/authenticated/${role}/dashboard`;

  return (
    <SidebarMenu>
      {filteredNavItems.map((item) => {
        const href = item.isDashboardLink ? getDashboardPath(userRole) : item.href;
        const isActive = pathname.startsWith(href) && (href !== '/authenticated/home' || pathname === href);
        
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
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
