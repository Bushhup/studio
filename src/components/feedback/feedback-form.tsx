'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Send, MessageSquarePlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function FeedbackForm() {
  const [course, setCourse] = useState('');
  const [faculty, setFaculty] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) {
      toast({
        title: "Feedback empty",
        description: "Please write your feedback before submitting.",
        variant: "destructive",
      });
      return;
    }
    // Mock submission
    console.log({ course, faculty, feedbackText });
    toast({
      title: "Feedback Submitted",
      description: "Thank you for your valuable feedback!",
    });
    setCourse('');
    setFaculty('');
    setFeedbackText('');
  };

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
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="course">Course (Optional)</Label>
              <Select value={course} onValueChange={setCourse}>
                <SelectTrigger id="course">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cs501">CS501 - Advanced Algorithms</SelectItem>
                  <SelectItem value="cs502">CS502 - Operating Systems Design</SelectItem>
                  <SelectItem value="ma503">MA503 - Probability & Statistics</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="faculty">Faculty (Optional)</Label>
              <Select value={faculty} onValueChange={setFaculty}>
                <SelectTrigger id="faculty">
                  <SelectValue placeholder="Select a faculty member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prof_ada">Prof. Ada L.</SelectItem>
                  <SelectItem value="dr_alan">Dr. Alan T.</SelectItem>
                  <SelectItem value="prof_grace">Prof. Grace H.</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
          <Button type="submit" className="w-full sm:w-auto" disabled={!feedbackText.trim() || feedbackText.trim().length < 20}>
            <Send className="mr-2 h-4 w-4" /> Submit Feedback
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
