import { Schema, model, Types, Document } from "mongoose";

export interface IChallengeProgress extends Document {
  participation: Types.ObjectId;
  exerciseType: Types.ObjectId;
  completedRepetitions: number;
  durationSeconds: number;
  caloriesBurned: number;
}

const ChallengeProgressSchema = new Schema<IChallengeProgress>({
  participation: { type: Schema.Types.ObjectId, ref: "ChallengeParticipation", required: true },
  exerciseType: { type: Schema.Types.ObjectId, ref: "ExerciseType", required: true },
  completedRepetitions: { type: Number, default: 0 },
  durationSeconds: { type: Number, default: 0 },
  caloriesBurned: { type: Number, default: 0 },
});

export const challengeProgressModel = model<IChallengeProgress>("challengeProgress", ChallengeProgressSchema);
