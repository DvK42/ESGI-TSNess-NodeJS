import { Schema, model, Types, Document } from "mongoose";

export interface IChallengeParticipation extends Document {
  user: Types.ObjectId;
  challenge: Types.ObjectId;
  status: "in_progress" | "completed" | "abandoned";
  startedAt: Date;
  completedAt?: Date;
}

const ChallengeParticipationSchema = new Schema<IChallengeParticipation>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  challenge: { type: Schema.Types.ObjectId, ref: "Challenge", required: true },
  status: {
    type: String,
    enum: ["in_progress", "completed", "abandoned"],
    default: "in_progress",
  },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
});

export const challengeParticipationModel = model<IChallengeParticipation>(
  "challengeParticipations",
  ChallengeParticipationSchema
);
