
import mongoose, { Schema, Document, models, model } from 'mongoose';
import type { Feedback } from '@/types';

export interface IFeedback extends Feedback, Document {
  id: string;
}

const FeedbackSchema = new Schema<IFeedback>({
    studentId: { type: Schema.Types.ObjectId, ref: 'User' },
    facultyId: { type: Schema.Types.ObjectId, ref: 'User' },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject' },
    feedbackText: { type: String, required: true },
    submittedDate: { type: Date, default: Date.now },
    sentiment: { type: String, enum: ['positive', 'negative', 'neutral'] },
    summary: { type: String },
    isRead: { type: Boolean, default: false } // Added for tracking
}, {
    collection: 'feedbacks' // Explicit collection name
});

const FeedbackModel = models.Feedback || model<IFeedback>('Feedback', FeedbackSchema);

export default FeedbackModel;
