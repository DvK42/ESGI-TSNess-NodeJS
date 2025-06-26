import { Schema, model, Types, Document } from "mongoose";

export interface IChallengeExercise extends Document {
  challenge: Types.ObjectId;
  exerciseType: Types.ObjectId;
  order: number;
  repetitions?: number;
  durationSeconds?: number;
}

const ChallengeExerciseSchema = new Schema<IChallengeExercise>({
  challenge: { type: Schema.Types.ObjectId, ref: "Challenge", required: true },
  exerciseType: { type: Schema.Types.ObjectId, ref: "ExerciseType", required: true },
  order: { type: Number, required: true },
  repetitions: { type: Number },
  durationSeconds: { type: Number },
});

export const challengeExerciseModel = model<IChallengeExercise>("challengeExercises", ChallengeExerciseSchema);
