'use client';

import { FeedbackForm } from '@/components/feedback/feedback-form';
import { FeedbackSummary } from '@/components/feedback/feedback-summary';
import { useMockAuth } from '@/hooks/use-mock-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Sparkles } from 'lucide-react';

export default function FeedbackPage() {
  const { role } = useMockAuth();

  if (!role) {
    return <p>Loading or unauthorized...</p>; // Or a proper loading/error state
  }

  const canViewSummary = role === 'admin' || role === 'faculty';
  const canSubmitFeedback = role === 'student';

  // Determine default tab
  let defaultTab = "submit";
  if (canViewSummary && !canSubmitFeedback) {
    defaultTab = "summary";
  } else if (canSubmitFeedback && !canViewSummary) {
    defaultTab = "submit";
  } else if (canViewSummary && canSubmitFeedback) { // Should not happen with current roles, but good for flexibility
     defaultTab = "submit"; // Or based on some preference
  }


  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center gap-3">
        {defaultTab === "submit" ? <MessageSquare className="h-10 w-10 text-primary" /> : <Sparkles className="h-10 w-10 text-primary" />}
        <div>
          <h1 className="font-headline text-4xl font-bold tracking-tight text-primary">Feedback Center</h1>
          <p className="text-muted-foreground">
            {canSubmitFeedback && !canViewSummary ? "Share your thoughts to help us improve." : ""}
            {canViewSummary && !canSubmitFeedback ? "Review and analyze student feedback." : ""}
            {canViewSummary && canSubmitFeedback ? "Manage and submit course feedback." : ""}
          </p>
        </div>
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 max-w-md">
          {canSubmitFeedback && <TabsTrigger value="submit">Submit Feedback</TabsTrigger>}
          {canViewSummary && <TabsTrigger value="summary">Feedback Summary (AI)</TabsTrigger>}
        </TabsList>
        
        {canSubmitFeedback && (
          <TabsContent value="submit" className="mt-6">
            <FeedbackForm />
          </TabsContent>
        )}
        
        {canViewSummary && (
          <TabsContent value="summary" className="mt-6">
            <FeedbackSummary />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
