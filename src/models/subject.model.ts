
import mongoose, { Schema, Document, models, model } from 'mongoose';
import type { Subject } from '@/types';

export interface ISubject extends Subject, Document {
  id: string;
}

const SubjectSchema = new Schema<ISubject>({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  facultyId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

const SubjectModel = models.Subject || model<ISubject>('Subject', SubjectSchema);

export default SubjectModel;
