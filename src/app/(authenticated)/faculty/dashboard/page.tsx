
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpenText, ClipboardList, ListChecks, MessageSquareText, Users, BookCopy, Calendar, Clock, Info, User, Search } from "lucide-react";
import { getFacultyDashboardStats, getClassesInCharge, getSubjectsHandled, getRecentFeedback, getFacultySchedule } from "./actions";
import Link from "next/link";
import { useToast } from '@/hooks/use-toast';
import type { ClassInfo, SubjectInfo, FeedbackInfo, FacultySchedule } from './actions';
import { getStudentsByClass } from '@/app/(authenticated)/admin/classes/actions';
import type { IUser } from '@/models/user.model';
import type { IStudentBio } from '@/models/studentBio.model';
import { getStudentBioForProfile } from '../../settings/account/actions';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type ModalDataType = 'classes' | 'subjects' | 'feedback';
type ListItem = { id: string; name: string; description?: string; date?: string };

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

function StudentProfileDialog({ student, bioData, isLoading, isOpen, setIsOpen }: {
    student: Pick<IUser, 'id' | 'name'> | null,
    bioData: IStudentBio | null,
    isLoading: boolean,
    isOpen: boolean,
    setIsOpen: (open: boolean) => void,
}) {
    if (!student) return null;
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border-2 border-primary">
                            <AvatarImage src={`https://placehold.co/100x100.png?text=${getInitials(student.name)}`} alt={student.name} data-ai-hint="student avatar" />
                            <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <DialogTitle className="font-headline text-2xl">Student Profile: {student.name}</DialogTitle>
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
                        <AlertDescription>This student has not yet filled out their bio-data information.</AlertDescription>
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

function ClassStudentDialog({ isOpen, setIsOpen, classes, isLoading, onStudentClick }: {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    classes: ClassInfo[];
    isLoading: boolean;
    onStudentClick: (student: Pick<IUser, 'id' | 'name'>) => void;
}) {
    const { toast } = useToast();
    const [studentsByClass, setStudentsByClass] = useState<Record<string, Pick<IUser, 'id'|'name'|'rollNo'>[]>>({});
    const [loadingClass, setLoadingClass] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleClassToggle = async (classId: string) => {
        if (!studentsByClass[classId]) {
            setLoadingClass(classId);
            try {
                const fetchedStudents = await getStudentsByClass(classId);
                setStudentsByClass(prev => ({...prev, [classId]: fetchedStudents }));
            } catch {
                toast({ title: "Error", description: "Could not fetch student list.", variant: "destructive"});
            } finally {
                setLoadingClass(null);
            }
        }
    }
    
    const filteredStudents = (classId: string) => {
        const students = studentsByClass[classId] || [];
        if (!searchTerm) return students;
        return students.filter(s => 
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.rollNo?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Classes In-Charge</DialogTitle>
                    <DialogDescription>Select a class to view the list of students.</DialogDescription>
                </DialogHeader>
                 <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search for a student..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <ScrollArea className="h-96 w-full rounded-md border p-4">
                    {isLoading ? (
                         <div className="flex justify-center items-center h-full">
                            <svg viewBox="0 0 24 24" className="h-8 w-8 animate-pulse" fill="none" stroke="currentColor"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
                         </div>
                    ) : classes.length > 0 ? (
                        <Accordion type="single" collapsible className="w-full">
                            {classes.map(c => (
                                <AccordionItem key={c.id} value={c.id}>
                                    <AccordionTrigger onClick={() => handleClassToggle(c.id)}>{c.name}</AccordionTrigger>
                                    <AccordionContent>
                                        {loadingClass === c.id ? (
                                            <div className="flex justify-center items-center py-4">
                                                <svg viewBox="0 0 24 24" className="h-6 w-6 animate-pulse" fill="none" stroke="currentColor"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
                                            </div>
                                        ) : (filteredStudents(c.id) && filteredStudents(c.id).length > 0) ? (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-24">Roll No.</TableHead>
                                                        <TableHead>Name</TableHead>
                                                        <TableHead className="text-right">Action</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {filteredStudents(c.id).map((student) => (
                                                        <TableRow key={student.id}>
                                                            <TableCell className="font-medium">{student.rollNo || 'N/A'}</TableCell>
                                                            <TableCell>{student.name}</TableCell>
                                                            <TableCell className="text-right">
                                                                <Button variant="ghost" size="sm" onClick={() => onStudentClick(student)}>
                                                                    <User className="mr-2 h-4 w-4"/> Profile
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        ) : (
                                            <p className="text-center text-muted-foreground py-4">No students found.</p>
                                        )}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    ) : (
                        <p className="text-center text-muted-foreground py-10">You are not in-charge of any classes.</p>
                    )}
                </ScrollArea>
                 <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


export default function FacultyDashboardPage() {
    const { data: session } = useSession();
    const userId = session?.user?.id;
    const { toast } = useToast();

    const [stats, setStats] = useState({ assignedClassesCount: 0, handlingSubjectsCount: 0, unreadFeedbackCount: 0 });
    const [classes, setClasses] = useState<ClassInfo[]>([]);
    const [subjects, setSubjects] = useState<SubjectInfo[]>([]);
    const [feedback, setFeedback] = useState<FeedbackInfo[]>([]);
    const [schedule, setSchedule] = useState<FacultySchedule>({});
    
    const [modalType, setModalType] = useState<ModalDataType | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isLoadingModal, setIsLoadingModal] = useState(false);
    
    const [selectedStudent, setSelectedStudent] = useState<Pick<IUser, 'id' | 'name'> | null>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    
    const dayOfWeek = new Date().toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
    const todaySchedule = schedule[dayOfWeek] || [];

    useEffect(() => {
        async function fetchData() {
            if (!userId) return;
            setIsLoadingData(true);
            try {
                const [dashboardStats, facultySchedule, classesInCharge] = await Promise.all([
                    getFacultyDashboardStats(userId),
                    getFacultySchedule(userId),
                    getClassesInCharge(userId), // Fetch classes here
                ]);
                setStats(dashboardStats);
                setSchedule(facultySchedule);
                setClasses(classesInCharge); // Set classes for the dialog
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
            if (type === 'subjects') {
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
    
    const handleStudentClick = async (student: Pick<IUser, 'id' | 'name'>) => {
        setSelectedStudent(student);
        setIsModalOpen(false); // Close the class list dialog
        setIsProfileOpen(true);
    };

    const getModalData = () => {
        switch (modalType) {
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-lg">
                <CardHeader>
                <CardTitle className="font-headline">Quick Actions</CardTitle>
                <CardDescription>Access your common tasks quickly.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <CardTitle className="font-headline flex items-center gap-2"><Calendar className="h-5 w-5"/> Today's Schedule</CardTitle>
                <CardDescription>Your upcoming classes for today, <span className="capitalize font-medium">{dayOfWeek}</span>.</CardDescription>
                </CardHeader>
                <CardContent>
                {isLoadingData ? (
                     <div className="flex justify-center items-center h-full">
                        <svg
                          viewBox="0 0 24 24"
                          className="h-8 w-8 animate-pulse theme-gradient-stroke"
                          fill="none"
                          stroke="url(#theme-gradient)"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
                     </div>
                ) : todaySchedule.length > 0 ? (
                    <ul className="space-y-2 text-sm">
                        {todaySchedule.map((item, index) => (
                             <li key={index} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-primary"/>
                                    <div>
                                        <p className="font-semibold">{item.className}</p>
                                        <p className="text-muted-foreground">{item.subjectName}</p>
                                    </div>
                                </div>
                                <span className="font-mono text-xs bg-muted px-2 py-1 rounded-md">{item.time}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-muted-foreground py-10">You have no classes scheduled for today.</p>
                )}
                </CardContent>
            </Card>
        </div>
        </div>

        {modalType && modalType !== 'classes' && (
             <ListDialog
                isOpen={isModalOpen}
                setIsOpen={() => { setIsModalOpen(false); setModalType(null); }}
                title={modalTitle}
                items={modalItems}
                isLoading={isLoadingModal}
            />
        )}

        <ClassStudentDialog
            isOpen={modalType === 'classes'}
            setIsOpen={() => { setIsModalOpen(false); setModalType(null); }}
            classes={classes}
            isLoading={isLoadingData}
            onStudentClick={handleStudentClick}
        />
        
        <StudentProfileDialog
            student={selectedStudent}
            isOpen={isProfileOpen}
            setIsOpen={() => { setIsProfileOpen(false); setSelectedStudent(null); }}
        />
    </>
  );
}
