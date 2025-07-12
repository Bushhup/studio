
import mongoose, { Schema, Document, models, model } from 'mongoose';
import type { User as UserType } from '@/types';

export interface IUser extends UserType, Document {
  id: string;
  email: string;
  password?: string;
  classId?: mongoose.Schema.Types.ObjectId;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, unique: true }, // Username, must be unique
  email: { type: String, required: true, unique: true },
  role: {
    type: String,
    enum: ['admin', 'faculty', 'student'],
    required: true,
  },
  password: { type: String, required: true, select: true }, // Password is required and selected by default now
  classId: { type: Schema.Types.ObjectId, ref: 'Class', required: false }, // Link to the Class model for students
});

const UserModel = models.User || model<IUser>('User', UserSchema);

export default UserModel;
