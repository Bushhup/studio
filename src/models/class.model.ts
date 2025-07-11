
import mongoose, { Schema, Document, models, model } from 'mongoose';
import type { Class } from '@/types';

export interface IClass extends Class, Document {
  id: string; 
}

const ClassSchema = new Schema<IClass>({
  name: { type: String, required: true },
  academicYear: { type: String, required: true },
  inchargeFaculty: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

const ClassModel = models.Class || model<IClass>('Class', ClassSchema);

export default ClassModel;
