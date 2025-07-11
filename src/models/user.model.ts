
import mongoose, { Schema, Document, models, model } from 'mongoose';
import type { User as UserType } from '@/types';

export interface IUser extends UserType, Document {
  id: string; 
  email: string;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: {
    type: String,
    enum: ['admin', 'faculty', 'student'],
    required: true,
  },
  // You can add other fields here like password (hashed), profilePicture, etc.
});

const UserModel = models.User || model<IUser>('User', UserSchema);

export default UserModel;
