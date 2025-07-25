
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Settings, Briefcase, Bell, GraduationCap, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUserCounts, getUsersByRole } from "../users/actions";
import { getUpcomingEvents } from "./actions";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import type { IUser } from '@/models/user.model';
import type { AppEvent } from '@/types';

type ModalDataType = 'students' | 'faculty' | 'events';
type ListItem = { id: string; name: string; date?: string };

function ListDialog({
  isOpen,
  setIsOpen,
  title,
  items,
  isLoading
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  title: string;
  items: ListItem[];
  isLoading: boolean;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>A list of all {title.toLowerCase()}.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-72 w-full rounded-md border p-4">
          {isLoading ? (
             <div className="flex justify-center items-center h-full">
                <GraduationCap className="h-8 w-8 animate-pulse text-primary" />
             </div>
          ) : items.length > 0 ? (
            <ul className="space-y-2">
              {items.map((item, index) => (
                <li key={item.id} className="text-sm">
                  {index + 1}. {item.name}
                  {item.date && (
                    <span className="text-muted-foreground ml-2 text-xs">
                      ({new Date(item.date).toLocaleDateString()})
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-muted-foreground py-10">No items found.</p>
          )}
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


export default function AdminDashboardPage() {
  const [counts, setCounts] = useState({ students: 0, faculty: 0, events: 0 });
  const [students, setStudents] = useState<Pick<IUser, 'id' | 'name'>[]>([]);
  const [faculty, setFaculty] = useState<Pick<IUser, 'id' | 'name'>[]>([]);
  const [events, setEvents] = useState<Pick<AppEvent, 'id' | 'title' | 'date'>[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalDataType | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [userCounts, studentList, facultyList, eventList] = await Promise.all([
          getUserCounts(),
          getUsersByRole('student'),
          getUsersByRole('faculty'),
          getUpcomingEvents(),
        ]);
        setCounts({ students: userCounts.students, faculty: userCounts.faculty, events: eventList.length });
        setStudents(studentList);
        setFaculty(facultyList);
        setEvents(eventList);
      } catch (error) {
        toast({ title: "Error", description: "Failed to load dashboard data.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [toast]);
  
  const handleCardClick = (type: ModalDataType) => {
    setModalType(type);
    setIsModalOpen(true);
  };
  
  const getModalData = () => {
    switch (modalType) {
        case 'students':
            return { title: 'Students', items: students.map(s => ({ id: s.id, name: s.name })) };
        case 'faculty':
            return { title: 'Faculty', items: faculty.map(f => ({ id: f.id, name: f.name })) };
        case 'events':
            return { title: 'Upcoming Events', items: events.map(e => ({ id: e.id, name: e.title, date: e.date })) };
        default:
            return { title: '', items: [] };
    }
  };
  
  const { title: modalTitle, items: modalItems } = getModalData();

  const renderCardContent = (count: number, isLoading: boolean) => {
    if (isLoading) {
      return <GraduationCap className="h-8 w-8 animate-pulse text-primary" />;
    }
    return <div className="text-2xl font-bold">{count}</div>;
  }

  return (
    <>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary">Admin Dashboard</h1>
            <p className="text-muted-foreground">Oversee and manage all department activities.</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => handleCardClick('students')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {renderCardContent(counts.students, isLoading)}
              <p className="text-xs text-muted-foreground">Click to view list</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => handleCardClick('faculty')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Faculty Members</CardTitle>
              <Briefcase className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              {renderCardContent(counts.faculty, isLoading)}
              <p className="text-xs text-muted-foreground">Click to view list</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => handleCardClick('events')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              <CalendarDays className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {renderCardContent(counts.events, isLoading)}
              <p className="text-xs text-muted-foreground">Click to view list</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline">Quick Actions</CardTitle>
              <CardDescription>Manage core department functions.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Button asChild variant="outline" className="justify-start text-left">
                <Link href="/admin/users">
                  <Users className="mr-2 h-4 w-4"/> Manage Users
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start text-left">
                <Link href="/settings/account">
                  <Settings className="mr-2 h-4 w-4"/> System Settings
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start text-left">
                <Link href="/placements">
                  <Briefcase className="mr-2 h-4 w-4"/> Placement Hub
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start text-left">
                <Link href="/home">
                  <Bell className="mr-2 h-4 w-4"/> Post Notice
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <ListDialog 
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        title={modalTitle}
        items={modalItems}
        isLoading={isLoading}
      />
    </>
  );
}
