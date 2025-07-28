
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Send, MessageSquarePlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getSubjectsForFeedback, submitFeedback, type SubjectWithFaculty } from '@/app/(authenticated)/feedback/actions';
import { useSession } from 'next-auth/react';

export function FeedbackForm() {
  const [subjects, setSubjects] = useState<SubjectWithFaculty[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { data: session } = useSession();

  useEffect(() => {
    async function fetchSubjects() {
      setIsLoading(true);
      const fetchedSubjects = await getSubjectsForFeedback();
      setSubjects(fetchedSubjects);
      setIsLoading(false);
    }
    fetchSubjects();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim() || !selectedSubjectId) {
      toast({
        title: "Information Missing",
        description: "Please select a subject and write your feedback.",
        variant: "destructive",
      });
      return;
    }

    const selectedSubject = subjects.find(s => s.id === selectedSubjectId);
    if (!selectedSubject) {
        toast({ title: "Error", description: "Selected subject not found.", variant: "destructive" });
        return;
    }

    setIsSubmitting(true);
    
    const result = await submitFeedback({
        subjectId: selectedSubject.id,
        facultyId: selectedSubject.facultyId,
        feedbackText: feedbackText,
        studentId: session?.user?.id // This can be omitted for full anonymity if needed
    });

    if (result.success) {
      toast({
        title: "Feedback Submitted",
        description: result.message,
      });
      setSelectedSubjectId('');
      setFeedbackText('');
    } else {
        toast({
            title: "Submission Failed",
            description: result.message,
            variant: "destructive",
        })
    }
    setIsSubmitting(false);
  };

  const selectedSubject = subjects.find(s => s.id === selectedSubjectId);

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <MessageSquarePlus className="h-6 w-6 text-primary" />
          <CardTitle className="font-headline text-2xl">Submit Feedback</CardTitle>
        </div>
        <CardDescription>Your feedback is anonymous and helps us improve.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="flex justify-center items-center h-24">
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6 animate-pulse theme-gradient-stroke"
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
                <p className="ml-2 text-muted-foreground">Loading subjects...</p>
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <Label htmlFor="subject">Select Subject *</Label>
                <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId} required>
                <SelectTrigger id="subject">
                    <SelectValue placeholder="Select a subject..." />
                </SelectTrigger>
                <SelectContent>
                    {subjects.length > 0 ? (
                        subjects.map(s => (
                            <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>
                        ))
                    ) : (
                        <div className="p-4 text-sm text-muted-foreground">No subjects available for feedback.</div>
                    )}
                </SelectContent>
                </Select>
                {selectedSubject && <p className="text-xs text-muted-foreground mt-1">Faculty: {selectedSubject.facultyName}</p>}
            </div>
            
            <div>
                <Label htmlFor="feedbackText">Your Feedback *</Label>
                <Textarea
                id="feedbackText"
                placeholder="Share your thoughts on the course, teaching, resources, etc."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={6}
                required
                />
                <p className="text-xs text-muted-foreground mt-1">Min. 20 characters. Your identity will remain anonymous.</p>
            </div>
            <Button type="submit" className="w-full sm:w-auto" disabled={!feedbackText.trim() || feedbackText.trim().length < 20 || !selectedSubjectId || isSubmitting}>
                {isSubmitting ? <svg
                    viewBox="0 0 24 24"
                    className="mr-2 h-4 w-4 animate-pulse"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg> : <Send className="mr-2 h-4 w-4" />}
                 Submit Feedback
            </Button>
            </form>
        )}
      </CardContent>
    </Card>
  );
}
