
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpenText, ClipboardList, ListChecks, MessageSquareText, Users, BookCopy } from "lucide-react";
import { getFacultyDashboardStats, getClassesInCharge, getSubjectsHandled, getRecentFeedback } from "./actions";
import Link from "next/link";
import { useToast } from '@/hooks/use-toast';
import type { ClassInfo, SubjectInfo, FeedbackInfo } from './actions';


type ModalDataType = 'classes' | 'subjects' | 'feedback';
type ListItem = { id: string; name: string; description?: string; date?: string };

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>A list of your {title.toLowerCase()}.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-72 w-full rounded-md border p-4">
          {isLoading ? (
             <div className="flex justify-center items-center h-full">
                <svg
                  viewBox="0 0 24 24"
                  className="h-8 w-8 animate-pulse theme-gradient-stroke"
                  fill="none"
                  stroke="url(#theme-gradient)"
                  strokeWidth="2"
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
          ) : items.length > 0 ? (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.id} className="text-sm border-b pb-2">
                  <p className="font-semibold">{item.name}</p>
                  {item.description && <p className="text-muted-foreground">{item.description}</p>}
                  {item.date && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(item.date).toLocaleString()}
                    </p>
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


export default function FacultyDashboardPage() {
    const { data: session } = useSession();
    const userId = session?.user?.id;
    const { toast } = useToast();

    const [stats, setStats] = useState({ assignedClassesCount: 0, handlingSubjectsCount: 0, unreadFeedbackCount: 0 });
    const [classes, setClasses] = useState<ClassInfo[]>([]);
    const [subjects, setSubjects] = useState<SubjectInfo[]>([]);
    const [feedback, setFeedback] = useState<FeedbackInfo[]>([]);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<ModalDataType | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isLoadingModal, setIsLoadingModal] = useState(false);

    useEffect(() => {
        async function fetchData() {
            if (!userId) return;
            setIsLoadingData(true);
            try {
                const dashboardStats = await getFacultyDashboardStats(userId);
                setStats(dashboardStats);
            } catch (error) {
                toast({ title: "Error", description: "Failed to load dashboard data.", variant: "destructive" });
            } finally {
                setIsLoadingData(false);
            }
        }
        fetchData();
    }, [userId, toast]);

    const handleCardClick = async (type: ModalDataType) => {
        if (!userId) return;
        setModalType(type);
        setIsModalOpen(true);
        setIsLoadingModal(true);

        try {
            if (type === 'classes') {
                const data = await getClassesInCharge(userId);
                setClasses(data);
            } else if (type === 'subjects') {
                const data = await getSubjectsHandled(userId);
                setSubjects(data);
            } else if (type === 'feedback') {
                const data = await getRecentFeedback(userId);
                setFeedback(data);
            }
        } catch (error) {
            toast({ title: "Error", description: `Failed to load ${type}.`, variant: "destructive" });
        } finally {
            setIsLoadingModal(false);
        }
    };
    
    const getModalData = () => {
        switch (modalType) {
            case 'classes':
                return { 
                    title: 'Classes In-Charge', 
                    items: classes.map(c => ({ id: c.id, name: c.name, description: `Academic Year: ${c.academicYear}` }))
                };
            case 'subjects':
                return { 
                    title: 'Subjects Handled', 
                    items: subjects.map(s => ({ id: s.id, name: s.name, description: `${s.code} - ${s.className}` }))
                };
            case 'feedback':
                return { 
                    title: 'Recent Unread Feedback', 
                    items: feedback.map(f => ({ id: f.id, name: `For: ${f.subjectName}`, description: f.text, date: f.date }))
                };
            default:
                return { title: '', items: [] };
        }
    };
    
    const { title: modalTitle, items: modalItems } = getModalData();
    
    const renderCardContent = (count: number) => {
        if (isLoadingData) {
            return (
                <svg
                    viewBox="0 0 24 24"
                    className="h-8 w-8 animate-pulse theme-gradient-stroke"
                    fill="none"
                    stroke="url(#theme-gradient)"
                    strokeWidth="2"
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
            );
        }
        return <div className="text-2xl font-bold">{count}</div>;
    }

  return (
    <>
        <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
            <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary">Faculty Dashboard</h1>
            <p className="text-muted-foreground">Manage your classes, students, and academic materials.</p>
            </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => handleCardClick('classes')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Classes In-Charge</CardTitle>
                <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {renderCardContent(stats.assignedClassesCount)}
                <p className="text-xs text-muted-foreground">Click to view list</p>
            </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => handleCardClick('subjects')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Subjects Handled</CardTitle>
                <BookCopy className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {renderCardContent(stats.handlingSubjectsCount)}
                <p className="text-xs text-muted-foreground">Click to view list</p>
            </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => handleCardClick('feedback')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Feedback</CardTitle>
                <MessageSquareText className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
                {renderCardContent(stats.unreadFeedbackCount)}
                <p className="text-xs text-muted-foreground">Click to view summaries</p>
            </CardContent>
            </Card>
        </div>

        <Card className="shadow-lg">
            <CardHeader>
            <CardTitle className="font-headline">Quick Actions</CardTitle>
            <CardDescription>Access your common tasks quickly.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button asChild variant="outline" className="justify-start text-left">
                <Link href="/faculty/marks"><ClipboardList className="mr-2 h-4 w-4"/> Enter Marks</Link>
            </Button>
            <Button asChild variant="outline" className="justify-start text-left">
                <Link href="/faculty/attendance"><ListChecks className="mr-2 h-4 w-4"/> Mark Attendance</Link>
            </Button>
            <Button asChild variant="outline" className="justify-start text-left">
                <Link href="/materials"><BookOpenText className="mr-2 h-4 w-4"/> Upload Material</Link>
            </Button>
            <Button asChild variant="outline" className="justify-start text-left">
                <Link href="/feedback"><MessageSquareText className="mr-2 h-4 w-4"/> View Feedback</Link>
            </Button>
            </CardContent>
        </Card>
        <Card className="shadow-lg">
            <CardHeader>
            <CardTitle className="font-headline">My Schedule</CardTitle>
            <CardDescription>Your upcoming classes and events.</CardDescription>
            </CardHeader>
            <CardContent>
            <ul className="space-y-2 text-sm">
                <li className="flex justify-between p-2 rounded-md hover:bg-muted"><span>MCA II (A) - Operating Systems</span> <span>10:00 AM - 11:00 AM</span></li>
                <li className="flex justify-between p-2 rounded-md hover:bg-muted"><span>MCA I - DSA</span> <span>11:00 AM - 12:00 PM</span></li>
                <li className="flex justify-between p-2 rounded-md hover:bg-muted"><span>Department Meeting</span> <span className="text-primary">02:00 PM</span></li>
            </ul>
            </CardContent>
        </Card>
        </div>

        <ListDialog
            isOpen={isModalOpen}
            setIsOpen={setIsModalOpen}
            title={modalTitle}
            items={modalItems}
            isLoading={isLoadingModal}
        />
    </>
  );
}
