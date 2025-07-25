
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Lightbulb, AlertTriangle, GraduationCap } from 'lucide-react';
import { handleSummarizeFeedback } from '@/app/(authenticated)/feedback/actions';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from '@/components/ui/badge';

interface SummaryResult {
  summary: string;
  sentiment: string;
}

export function FeedbackSummary() {
  const [feedbackToSummarize, setFeedbackToSummarize] = useState('');
  const [summaryResult, setSummaryResult] = useState<SummaryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sample student feedback pieces
  const sampleFeedbacks = [
    "The course content was excellent and very well structured. Professor Smith explained complex topics clearly. However, I wish there were more practical examples.",
    "I found the lectures to be a bit fast-paced. It was sometimes hard to keep up. The study materials provided were helpful though.",
    "This was one of the best courses I've taken! The projects were challenging but rewarding. The professor was very engaging and supportive.",
    "The online portal for submitting assignments was clunky and often had issues. The course itself was good, but the tech infrastructure needs improvement.",
    "Not enough interactive sessions. Most lectures were one-way. Would appreciate more Q&A or discussion opportunities."
  ];
  const [selectedSampleFeedback, setSelectedSampleFeedback] = useState<string>('');


  const handleSubmitForSummarization = async () => {
    if (!feedbackToSummarize.trim()) {
      setError("Please enter feedback text to summarize.");
      setSummaryResult(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    setSummaryResult(null);

    const result = await handleSummarizeFeedback(feedbackToSummarize);

    if ('error' in result) {
      setError(result.error);
    } else {
      setSummaryResult({ summary: result.summary, sentiment: result.sentiment });
    }
    setIsLoading(false);
  };

  const handleSampleFeedbackSelect = (feedback: string) => {
    setSelectedSampleFeedback(feedback);
    setFeedbackToSummarize(feedback);
    setError(null);
    setSummaryResult(null);
  };


  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <CardTitle className="font-headline text-2xl">AI Feedback Summarization</CardTitle>
        </div>
        <CardDescription>Enter student feedback below to get an AI-generated summary and sentiment analysis.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="sampleFeedback">Select Sample Feedback (or paste your own below)</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {sampleFeedbacks.map((fb, index) => (
              <Button
                key={index}
                variant={selectedSampleFeedback === fb ? "default" : "outline"}
                size="sm"
                onClick={() => handleSampleFeedbackSelect(fb)}
              >
                Sample {index + 1}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <Label htmlFor="feedbackTextSummarize">Feedback Text</Label>
          <Textarea
            id="feedbackTextSummarize"
            placeholder="Paste or type student feedback here..."
            value={feedbackToSummarize}
            onChange={(e) => {
              setFeedbackToSummarize(e.target.value);
              setSelectedSampleFeedback(''); // Clear sample selection if user types
            }}
            rows={8}
          />
        </div>
        <Button onClick={handleSubmitForSummarization} disabled={isLoading || !feedbackToSummarize.trim()} className="w-full sm:w-auto">
          {isLoading ? (
            <GraduationCap className="mr-2 h-4 w-4 animate-pulse" />
          ) : (
            <Lightbulb className="mr-2 h-4 w-4" />
          )}
          Summarize Feedback
        </Button>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {summaryResult && !error && (
          <Card className="mt-6 bg-muted/50">
            <CardHeader>
              <CardTitle className="font-headline text-xl flex items-center justify-between">
                Summary & Sentiment
                <Badge 
                  className={
                    summaryResult.sentiment.toLowerCase() === 'positive' ? 'bg-green-500 hover:bg-green-600' :
                    summaryResult.sentiment.toLowerCase() === 'negative' ? 'bg-red-500 hover:bg-red-600' :
                    'bg-yellow-500 hover:bg-yellow-600 text-yellow-900'
                  }
                >
                  {summaryResult.sentiment}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground/90 whitespace-pre-wrap">{summaryResult.summary}</p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
