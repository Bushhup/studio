
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingDown, TrendingUp, Users, School, Star, UserCheck, GraduationCap } from "lucide-react";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import { useSession } from 'next-auth/react';
import { getSubjectsForFaculty } from '../marks/actions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getPerformanceDataForClass, type MarksDistributionData, type StudentPerformanceInfo } from './actions';


const chartConfig = {
  count: {
    label: "Students",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;


type SubjectInfo = {
  id: string;
  name: string;
  classId: string;
  className: string;
};

export default function FacultyPerformancePage() {
  const { data: session } = useSession();
  const facultyId = session?.user?.id;

  const [subjects, setSubjects] = useState<SubjectInfo[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingChart, setIsLoadingChart] = useState(false);
  
  const [chartData, setChartData] = useState<MarksDistributionData[]>([]);
  const [studentsToWatch, setStudentsToWatch] = useState<StudentPerformanceInfo[]>([]);
  const [topPerformers, setTopPerformers] = useState<StudentPerformanceInfo[]>([]);
  const [averagePerformers, setAveragePerformers] = useState<StudentPerformanceInfo[]>([]);

  useEffect(() => {
    if (facultyId) {
      setIsLoading(true);
      getSubjectsForFaculty(facultyId)
        .then(data => {
            setSubjects(data);
            if (data.length > 0) {
                // Automatically select the first subject and fetch its data
                handleSubjectChange(data[0].id, data);
            } else {
                setIsLoading(false);
            }
        })
        .catch(() => setIsLoading(false));
    }
  }, [facultyId]);

  const handleSubjectChange = async (subjectId: string, currentSubjects?: SubjectInfo[]) => {
    const subjectList = currentSubjects || subjects;
    setSelectedSubjectId(subjectId);

    if (!subjectId) {
      setIsLoading(false);
      setIsLoadingChart(false);
      return;
    }

    const subject = subjectList.find(s => s.id === subjectId);
    if (subject) {
        setIsLoadingChart(true);
        setChartData([]);
        setStudentsToWatch([]);
        setTopPerformers([]);
        setAveragePerformers([]);
        
        try {
            const performanceData = await getPerformanceDataForClass(subject.classId, subject.id);
            setChartData(performanceData.distribution);
            setStudentsToWatch(performanceData.studentsToWatch);
            setTopPerformers(performanceData.topPerformers);
            setAveragePerformers(performanceData.averagePerformers);
        } catch (error) {
            console.error("Failed to fetch performance data:", error);
        } finally {
            setIsLoadingChart(false);
        }
    }
    if (isLoading) setIsLoading(false);
  }
  
  const selectedSubject = subjects.find(s => s.id === selectedSubjectId);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
            <BarChart3 className="h-10 w-10 text-primary" />
            <div>
            <h1 className="font-headline text-4xl font-bold tracking-tight text-primary">Class Performance Overview</h1>
            <p className="text-muted-foreground">View performance metrics for your classes.</p>
            </div>
        </div>
        <Select onValueChange={(value) => handleSubjectChange(value)} value={selectedSubjectId} disabled={isLoading || subjects.length === 0}>
            <SelectTrigger className="w-full sm:w-[300px]">
                <School className="mr-2 h-4 w-4"/>
                <SelectValue placeholder={isLoading ? "Loading classes..." : "Select a class to view performance"} />
            </SelectTrigger>
            <SelectContent>
                {subjects.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.className} ({s.name})</SelectItem>
                ))}
            </SelectContent>
        </Select>
      </div>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Marks Distribution</CardTitle>
            <CardDescription>
                {selectedSubject ? `Subject: ${selectedSubject.name} (${selectedSubject.className})` : 'No class selected'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingChart ? (
                 <div className="flex justify-center items-center h-[250px]">
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
            ) : chartData.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <ResponsiveContainer>
                    <BarChart accessibilityLayer data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                        dataKey="range"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        interval={0}
                        fontSize={12}
                        />
                        <Tooltip
                            cursor={false}
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                return (
                                    <div className="p-2 rounded-lg bg-background/80 backdrop-blur-sm border shadow-sm">
                                    <p className="font-bold">{label}</p>
                                    <p className="text-sm text-primary">{`Students: ${payload[0].value}`}</p>
                                    </div>
                                );
                                }
                                return null;
                            }}
                        />
                        <Bar dataKey="count" fill="var(--color-count)" radius={8} />
                    </BarChart>
                </ResponsiveContainer>
                </ChartContainer>
            ) : (
                <div className="flex justify-center items-center h-[250px]">
                    <p className="text-muted-foreground">No performance data available for this selection.</p>
                </div>
            )}
          </CardContent>
        </Card>
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Star className="h-5 w-5 text-yellow-400"/> Top Performers</CardTitle>
                <CardDescription>Students excelling in this subject (&gt;90%).</CardDescription>
              </CardHeader>
              <CardContent>
                 {isLoadingChart ? (
                      <div className="flex justify-center items-center h-[250px]">
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
                 ) : topPerformers.length > 0 ? (
                    <ul className="space-y-4">
                        {topPerformers.map((student, index) => (
                            <li key={index} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                                <div className="flex items-center gap-3">
                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                    <div>
                                        <p className="font-medium">{student.name}</p>
                                        <p className="text-sm text-muted-foreground">{student.reason}</p>
                                    </div>
                                </div>
                                <Badge variant="secondary" className="bg-green-100 text-green-800">Outstanding</Badge>
                            </li>
                        ))}
                    </ul>
                 ) : (
                    <div className="flex justify-center items-center h-[250px]">
                        <p className="text-muted-foreground text-center">No students currently in the top performer category.</p>
                    </div>
                 )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><UserCheck className="h-5 w-5 text-blue-500"/> Average Performers</CardTitle>
                <CardDescription>Students with scores between 50% and 89%.</CardDescription>
              </CardHeader>
              <CardContent>
                 {isLoadingChart ? (
                      <div className="flex justify-center items-center h-[250px]">
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
                 ) : averagePerformers.length > 0 ? (
                    <ul className="space-y-4 max-h-[300px] overflow-y-auto">
                        {averagePerformers.map((student, index) => (
                            <li key={index} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                                <div className="flex items-center gap-3">
                                    <div>
                                        <p className="font-medium">{student.name}</p>
                                        <p className="text-sm text-muted-foreground">{student.reason}</p>
                                    </div>
                                </div>
                                <Badge variant="secondary">Consistent</Badge>
                            </li>
                        ))}
                    </ul>
                 ) : (
                    <div className="flex justify-center items-center h-[250px]">
                        <p className="text-muted-foreground text-center">No students currently in the average performer category.</p>
                    </div>
                 )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-destructive"/> Students to Watch</CardTitle>
                <CardDescription>Students scoring below 50% who might need attention.</CardDescription>
              </CardHeader>
              <CardContent>
                 {isLoadingChart ? (
                      <div className="flex justify-center items-center h-[250px]">
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
                 ) : studentsToWatch.length > 0 ? (
                    <ul className="space-y-4">
                        {studentsToWatch.map((student, index) => (
                            <li key={index} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                                <div className="flex items-center gap-3">
                                    <TrendingDown className="h-4 w-4 text-destructive" />
                                    <div>
                                        <p className="font-medium">{student.name}</p>
                                        <p className="text-sm text-muted-foreground">{student.reason}</p>
                                    </div>
                                </div>
                                <Badge variant="destructive">Action Needed</Badge>
                            </li>
                        ))}
                    </ul>
                 ) : (
                    <div className="flex justify-center items-center h-[250px]">
                        <p className="text-muted-foreground text-center">No students require special attention at this time.</p>
                    </div>
                 )}
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
