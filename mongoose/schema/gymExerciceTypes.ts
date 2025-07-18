import { Schema, model, Document, Types } from "mongoose";

export interface IGymExerciseType extends Document {
  gymId: Types.ObjectId;
  exerciseTypeId: Types.ObjectId;
}

const GymExerciseTypeSchema = new Schema<IGymExerciseType>(
  {
    gymId: { type: Schema.Types.ObjectId, ref: "Gym", required: true },
    exerciseTypeId: { type: Schema.Types.ObjectId, ref: "ExerciseType", required: true },
  },
  { timestamps: true }
);

export const gymExerciseTypeModel = model<IGymExerciseType>("gymExerciseTypes", GymExerciseTypeSchema);
