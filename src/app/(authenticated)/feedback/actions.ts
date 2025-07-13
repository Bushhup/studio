
'use server';

import { summarizeFeedback as summarizeFeedbackFlow, type SummarizeFeedbackInput, type SummarizeFeedbackOutput } from '@/ai/flows/summarize-student-feedback';
import { connectToDB } from '@/lib/mongoose';
import FeedbackModel from '@/models/feedback.model';
import SubjectModel from '@/models/subject.model';
import mongoose from 'mongoose';

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

export type SubjectWithFaculty = {
  id: string;
  name: string;
  code: string;
  facultyId: string;
  facultyName: string;
}

export async function getSubjectsForFeedback(): Promise<SubjectWithFaculty[]> {
    try {
        await connectToDB();
        const subjects = await SubjectModel.find().populate('facultyId', 'name').lean();
        
        return subjects.map(s => ({
            id: s._id.toString(),
            name: s.name,
            code: s.code,
            facultyId: (s.facultyId as any)._id.toString(),
            facultyName: (s.facultyId as any).name,
        }));

    } catch (error) {
        console.error('Error fetching subjects for feedback:', error);
        return [];
    }
}

type SubmitFeedbackInput = {
    subjectId: string;
    facultyId: string;
    feedbackText: string;
    studentId?: string; // Optional for anonymity
}

export async function submitFeedback(data: SubmitFeedbackInput): Promise<{success: boolean; message: string}> {
    try {
        await connectToDB();
        
        const newFeedback = new FeedbackModel({
            ...data,
            submittedDate: new Date(),
        });
        
        await newFeedback.save();

        return { success: true, message: "Feedback submitted successfully. Thank you!" };

    } catch (error) {
        console.error('Error submitting feedback:', error);
        if (error instanceof Error) {
            return { success: false, message: error.message };
        }
        return { success: false, message: "An unknown error occurred while submitting feedback." };
    }
}
