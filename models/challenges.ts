import { Schema, model, Types, Document } from "mongoose";

export interface IChallenge extends Document {
  title: string;
  description: string;
  durationMinutes: number;
  creator: Types.ObjectId;
  gym?: Types.ObjectId;
  difficultyLevel?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ChallengeSchema = new Schema<IChallenge>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  durationMinutes: { type: Number, required: true },
  creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
  gym: { type: Schema.Types.ObjectId, ref: "Gym" },
  difficultyLevel: { type: Schema.Types.ObjectId, ref: "DifficultyLevel" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

ChallengeSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export const challengeModel = model<IChallenge>("challenges", ChallengeSchema);
