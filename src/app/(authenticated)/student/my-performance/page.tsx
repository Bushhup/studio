
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, LineChart, ShieldAlert, TrendingUp, TrendingDown, Star, Loader2 } from "lucide-react";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useToast } from '@/hooks/use-toast';
import { getStudentPerformance, type PerformanceStats } from './actions';


const chartConfig = {
  percentage: {
    label: "Percentage",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;


export default function StudentPerformancePage() {
  const { data: session } = useSession();
  const studentId = session?.user?.id;
  const { toast } = useToast();

  const [performanceData, setPerformanceData] = useState<PerformanceStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (studentId) {
      setIsLoading(true);
      getStudentPerformance(studentId)
        .then(setPerformanceData)
        .catch(() => toast({ title: "Error", description: "Failed to load performance data.", variant: "destructive" }))
        .finally(() => setIsLoading(false));
    }
  }, [studentId, toast]);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center gap-3">
        <BarChart3 className="h-10 w-10 text-primary" />
        <div>
          <h1 className="font-headline text-4xl font-bold tracking-tight text-primary">My Performance Dashboard</h1>
          <p className="text-muted-foreground">Track your academic progress across all subjects.</p>
        </div>
      </div>
       {isLoading ? (
        <div className="flex justify-center items-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : !performanceData || performanceData.subjectWisePerformance.length === 0 ? (
        <Card>
            <CardContent className="h-[300px] flex items-center justify-center">
                 <p className="text-muted-foreground">No performance data available yet. Check back after marks are published.</p>
            </CardContent>
        </Card>
      ) : (
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5"/> Subject-wise Performance</CardTitle>
            <CardDescription>Your overall percentage in each subject.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData.subjectWisePerformance} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis 
                  dataKey="subjectName"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={0}
                />
                <YAxis 
                   stroke="#888888"
                   fontSize={12}
                   tickLine={false}
                   axisLine={false}
                   tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                    cursor={{fill: 'hsla(var(--muted))'}}
                    content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                        return (
                            <div className="p-2 rounded-lg bg-background/80 backdrop-blur-sm border shadow-sm">
                            <p className="font-bold">{label}</p>
                            <p className="text-sm text-primary">{`Score: ${payload[0].value}%`}</p>
                            </div>
                        );
                        }
                        return null;
                    }}
                />
                <Bar dataKey="percentage" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Star className="h-5 w-5"/> Performance Insights</CardTitle>
            <CardDescription>A summary of your academic standing.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex flex-col justify-center space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted">
              <div className="p-3 rounded-full bg-primary/20 text-primary">
                 <BarChart3 className="h-6 w-6"/>
              </div>
              <div>
                 <p className="text-sm text-muted-foreground">Overall Average Score</p>
                 <p className="text-2xl font-bold">{performanceData.averageScore}%</p>
              </div>
            </div>
            {performanceData.bestSubject && (
                <div className="flex items-center gap-4 p-4 rounded-lg bg-green-500/10">
                    <div className="p-3 rounded-full bg-green-500/20 text-green-600">
                        <TrendingUp className="h-6 w-6"/>
                    </div>
                    <div>
                        <p className="text-sm text-green-700">Best Subject</p>
                        <p className="text-lg font-semibold text-green-800">{performanceData.bestSubject}</p>
                    </div>
                </div>
            )}
             {performanceData.subjectForImprovement && (
                <div className="flex items-center gap-4 p-4 rounded-lg bg-red-500/10">
                    <div className="p-3 rounded-full bg-red-500/20 text-red-600">
                        <TrendingDown className="h-6 w-6"/>
                    </div>
                    <div>
                        <p className="text-sm text-red-700">Needs Improvement</p>
                        <p className="text-lg font-semibold text-red-800">{performanceData.subjectForImprovement}</p>
                    </div>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
      )}
    </div>
  );
}
