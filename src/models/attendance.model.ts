
import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IAttendance extends Document {
  studentId: mongoose.Schema.Types.ObjectId;
  subjectId: mongoose.Schema.Types.ObjectId;
  classId: mongoose.Schema.Types.ObjectId;
  date: Date;
  period: string;
  isPresent: boolean;
}

const AttendanceSchema = new Schema<IAttendance>({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  date: { type: Date, required: true },
  period: { type: String, required: true },
  isPresent: { type: Boolean, required: true },
}, {
  collection: 'attendances',
  indexes: [{ fields: { studentId: 1, subjectId: 1, date: 1, period: 1 }, unique: true }]
});

const AttendanceModel = models.Attendance || model<IAttendance>('Attendance', AttendanceSchema);

export default AttendanceModel;
