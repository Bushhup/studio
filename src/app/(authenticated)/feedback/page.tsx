
'use client';

import { FeedbackForm } from '@/components/feedback/feedback-form';
import { FeedbackSummary } from '@/components/feedback/feedback-summary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Sparkles } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function FeedbackPage() {
  const { data: session } = useSession();
  const role = session?.user?.role;

  if (!role) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="flex flex-col items-center gap-4">
                <svg
                  viewBox="0 0 24 24"
                  className="h-16 w-16 animate-pulse theme-gradient-stroke"
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
                <p className="text-muted-foreground">Loading...</p>
            </div>
        </div>
    );
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
