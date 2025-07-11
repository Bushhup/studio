
import mongoose, { Schema, Document, models, model } from 'mongoose';
import type { StudyMaterial } from '@/types';

// Interface for the document, extending Mongoose's Document
export interface IStudyMaterial extends StudyMaterial, Document {
  id: string; // Ensure id is part of the interface
}

const StudyMaterialSchema = new Schema<IStudyMaterial>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  subject: { type: String, required: true },
  fileType: { 
    type: String, 
    enum: ['pdf', 'ppt', 'doc', 'link'], 
    required: true 
  },
  fileName: { type: String },
  fileUrl: { type: String, required: true },
  uploadedBy: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
});

// Use existing model if it exists, otherwise create a new one
const StudyMaterialModel = models.StudyMaterial || model<IStudyMaterial>('StudyMaterial', StudyMaterialSchema);

export default StudyMaterialModel;
