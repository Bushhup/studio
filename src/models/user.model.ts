
import mongoose, { Schema, Document, models, model } from 'mongoose';
import type { User as UserType } from '@/types';

export interface IUser extends UserType, Document {
  id: string;
  email: string;
  password?: string;
  rollNo?: string;
  classId?: mongoose.Types.ObjectId;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  role: {
    type: String,
    enum: ['admin', 'faculty', 'student'],
    required: true,
  },
  password: { type: String, required: true, select: false },
  rollNo: { type: String, required: false },
  classId: { type: Schema.Types.ObjectId, ref: 'Class', required: false },
}, {
  collection: 'users'
});

const UserModel = models.User || model<IUser>('User', UserSchema);

export default UserModel;
