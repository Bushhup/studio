import mongoose, { Schema, Document, models, model } from 'mongoose';
import type { AppEvent } from '@/types';

// Define the interface for the document, extending Mongoose's Document
export interface IEvent extends AppEvent, Document {
  id: string; // Ensure id is part of the interface
}

const EventSchema = new Schema<IEvent>({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  description: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['lecture', 'hackathon', 'fest', 'internship_fair', 'exam', 'notice'],
    required: true 
  },
  location: { type: String, required: true },
  image: { type: String, required: false },
  dataAiHint: { type: String, required: false },
  classIds: [{ type: Schema.Types.ObjectId, ref: 'Class' }],
  inchargeFacultyId: { type: Schema.Types.ObjectId, ref: 'User' },
});

// Use existing model if it exists, otherwise create a new one
const Event = models.Event || model<IEvent>('Event', EventSchema);

export default Event;
