
import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IStudentBio extends Document {
  studentId: mongoose.Schema.Types.ObjectId;
  mobileNumber?: string;
  email?: string;
  dob?: Date;
  fatherName?: string;
  fatherOccupation?: string;
  fatherMobileNumber?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  religion?: string;
  community?: 'BC(MUSLIM)' | 'OC' | 'BC' | 'MBC' | 'SC' | 'SCC' | 'ST';
  caste?: string;
  quota?: 'management' | 'government';
  aadharNumber?: string;
}

const StudentBioSchema = new Schema<IStudentBio>({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  mobileNumber: { type: String, required: false },
  email: { type: String, required: false },
  dob: { type: Date, required: false },
  fatherName: { type: String, required: false },
  fatherOccupation: { type: String, required: false },
  fatherMobileNumber: { type: String, required: false },
  gender: { type: String, enum: ['male', 'female', 'other'], required: false },
  address: { type: String, required: false },
  religion: { type: String, required: false },
  community: { type: String, enum: ['BC(MUSLIM)', 'OC', 'BC', 'MBC', 'SC', 'SCC', 'ST'], required: false },
  caste: { type: String, required: false },
  quota: { type: String, enum: ['management', 'government'], required: false },
  aadharNumber: { type: String, required: false },
}, {
  collection: 'studentbios'
});

const StudentBioModel = models.StudentBio || model<IStudentBio>('StudentBio', StudentBioSchema);

export default StudentBioModel;
