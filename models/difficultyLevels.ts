import { Schema, model, Document } from "mongoose";

export interface IDifficultyLevel extends Document {
  label: string;
}

const DifficultyLevelSchema = new Schema<IDifficultyLevel>(
  {
    label: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export const difficultyLevelModel = model<IDifficultyLevel>("difficultyLevels", DifficultyLevelSchema);
