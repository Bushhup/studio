'use server';

import { summarizeFeedback as summarizeFeedbackFlow, type SummarizeFeedbackInput, type SummarizeFeedbackOutput } from '@/ai/flows/summarize-student-feedback';

export async function handleSummarizeFeedback(feedbackText: string): Promise<SummarizeFeedbackOutput | { error: string }> {
  if (!feedbackText || feedbackText.trim().length === 0) {
    return { error: "Feedback text cannot be empty." };
  }

  const input: SummarizeFeedbackInput = { feedbackText };

  try {
    const result = await summarizeFeedbackFlow(input);
    return result;
  } catch (error) {
    console.error("Error summarizing feedback:", error);
    return { error: "Failed to summarize feedback due to an internal error." };
  }
}
