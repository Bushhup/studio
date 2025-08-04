
import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface ITimetable extends Document {
  classId: mongoose.Schema.Types.ObjectId;
  schedule: {
    [day: string]: (mongoose.Schema.Types.ObjectId | null)[];
  };
}

const TimetableSchema = new Schema<ITimetable>({
  classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true, unique: true },
  schedule: {
    type: Map,
    of: [{ type: Schema.Types.ObjectId, ref: 'Subject', default: null }],
    default: {
      monday: Array(8).fill(null),
      tuesday: Array(8).fill(null),
      wednesday: Array(8).fill(null),
      thursday: Array(8).fill(null),
      friday: Array(8).fill(null),
    }
  },
}, {
  collection: 'timetables'
});

const TimetableModel = models.Timetable || model<ITimetable>('Timetable', TimetableSchema);

export default TimetableModel;
