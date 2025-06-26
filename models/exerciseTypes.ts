import { Schema, model, Document } from "mongoose";

export interface IExerciseType extends Document {
  name: string;
  description?: string;
  targetMuscles: string[];
}

const ExerciseTypeSchema = new Schema<IExerciseType>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    targetMuscles: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const exerciseTypeModel = model<IExerciseType>("exerciseTypes", ExerciseTypeSchema);
