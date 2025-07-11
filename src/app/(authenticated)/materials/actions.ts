
'use server';

import { connectToDB } from '@/lib/mongoose';
import StudyMaterialModel, { IStudyMaterial } from '@/models/studyMaterial.model';
import type { StudyMaterial } from '@/types';

// Helper to serialize MongoDB document
function serializeMaterial(doc: IStudyMaterial): StudyMaterial {
  const plainObject = doc.toObject({ getters: true });
  return {
    ...plainObject,
    id: plainObject._id.toString(),
    uploadDate: plainObject.uploadDate.toISOString(),
    _id: undefined,
    __v: undefined,
  };
}

export async function getMaterials(): Promise<StudyMaterial[]> {
  try {
    await connectToDB();
    const materials = await StudyMaterialModel.find({}).sort({ uploadDate: -1 });
    return materials.map(serializeMaterial);
  } catch (error) {
    console.error('Error fetching materials:', error);
    return [];
  }
}

export type AddMaterialInput = Omit<StudyMaterial, 'id' | 'uploadDate'>;

export async function addMaterial(data: AddMaterialInput): Promise<StudyMaterial | { error: string }> {
  try {
    await connectToDB();

    const newMaterial = new StudyMaterialModel({
      ...data,
      uploadDate: new Date(),
    });

    const savedMaterial = await newMaterial.save();
    return serializeMaterial(savedMaterial);
  } catch (error) {
    console.error('Error adding material:', error);
    if (error instanceof Error) {
        return { error: error.message };
    }
    return { error: 'An unknown error occurred while adding the material.' };
  }
}
