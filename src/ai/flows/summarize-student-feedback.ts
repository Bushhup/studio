// Summarize Student Feedback
'use server';
/**
 * @fileOverview Summarizes student feedback using Genkit.
 *
 * - summarizeFeedback - A function that summarizes student feedback.
 * - SummarizeFeedbackInput - The input type for the summarizeFeedback function.
 * - SummarizeFeedbackOutput - The return type for the summarizeFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeFeedbackInputSchema = z.object({
  feedbackText: z.string().describe('The text of the student feedback to summarize.'),
});

export type SummarizeFeedbackInput = z.infer<typeof SummarizeFeedbackInputSchema>;

const SummarizeFeedbackOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the student feedback.'),
  sentiment: z
    .string()
    .describe('The overall sentiment expressed in the feedback (e.g., positive, negative, neutral).'),
});

export type SummarizeFeedbackOutput = z.infer<typeof SummarizeFeedbackOutputSchema>;

export async function summarizeFeedback(input: SummarizeFeedbackInput): Promise<SummarizeFeedbackOutput> {
  return summarizeFeedbackFlow(input);
}

const summarizeFeedbackPrompt = ai.definePrompt({
  name: 'summarizeFeedbackPrompt',
  input: {schema: SummarizeFeedbackInputSchema},
  output: {schema: SummarizeFeedbackOutputSchema},
  prompt: `You are an AI assistant tasked with summarizing student feedback and determining its sentiment.

  Summarize the following feedback text and identify the overall sentiment (positive, negative, or neutral).

  Feedback Text: {{{feedbackText}}}

  Summary:
  Sentiment:`, // Use handlebars here
});

const summarizeFeedbackFlow = ai.defineFlow(
  {
    name: 'summarizeFeedbackFlow',
    inputSchema: SummarizeFeedbackInputSchema,
    outputSchema: SummarizeFeedbackOutputSchema,
  },
  async input => {
    const {output} = await summarizeFeedbackPrompt(input);
    return output!;
  }
);
