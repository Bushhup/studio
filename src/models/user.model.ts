
import mongoose, { Schema, Document, models, model } from 'mongoose';
import type { User as UserType } from '@/types';

export interface IUser extends UserType, Document {
  id: string; 
  email: string;
  password?: string;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: {
    type: String,
    enum: ['admin', 'faculty', 'student'],
    required: true,
  },
  password: { type: String }, // In a real app, ALWAYS hash passwords.
});

const UserModel = models.User || model<IUser>('User', UserSchema);

export default UserModel;
