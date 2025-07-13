
import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IMark extends Document {
  studentId: mongoose.Schema.Types.ObjectId;
  subjectId: mongoose.Schema.Types.ObjectId;
  classId: mongoose.Schema.Types.ObjectId;
  assessmentName: string;
  marksObtained: number;
  maxMarks: number;
  date: Date;
}

const MarkSchema = new Schema<IMark>({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  assessmentName: { type: String, required: true },
  marksObtained: { type: Number, required: true },
  maxMarks: { type: Number, required: true },
  date: { type: Date, default: Date.now },
}, {
  collection: 'marks',
  // Create a compound index to ensure one mark entry per student per assessment
  indexes: [{ fields: { studentId: 1, subjectId: 1, assessmentName: 1 }, unique: true }]
});

const MarkModel = models.Mark || model<IMark>('Mark', MarkSchema);

export default MarkModel;
