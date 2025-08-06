
import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IStudentBio extends Document {
  studentId: mongoose.Schema.Types.ObjectId;
  mobileNumber: string;
  email: string;
  dob: Date;
  fatherName: string;
  fatherOccupation: string;
  fatherMobileNumber: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  religion: string;
  community: 'BC(MUSLIM)' | 'OC' | 'BC' | 'MBC' | 'SC' | 'SCC' | 'ST';
  caste: string;
  quota: 'management' | 'government';
  aadharNumber: string;
}

const StudentBioSchema = new Schema<IStudentBio>({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  mobileNumber: { type: String, required: true },
  email: { type: String, required: true },
  dob: { type: Date, required: true },
  fatherName: { type: String, required: true },
  fatherOccupation: { type: String, required: true },
  fatherMobileNumber: { type: String, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  address: { type: String, required: true },
  religion: { type: String, required: true },
  community: { type: String, enum: ['BC(MUSLIM)', 'OC', 'BC', 'MBC', 'SC', 'SCC', 'ST'], required: true },
  caste: { type: String, required: true },
  quota: { type: String, enum: ['management', 'government'], required: true },
  aadharNumber: { type: String, required: true },
}, {
  collection: 'studentbios'
});

const StudentBioModel = models.StudentBio || model<IStudentBio>('StudentBio', StudentBioSchema);

export default StudentBioModel;
