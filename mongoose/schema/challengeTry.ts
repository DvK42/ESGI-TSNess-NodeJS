import { Schema, Types } from "mongoose";
import { ChallengeTry } from "../../models";

export const challengeTrySchema = new Schema<ChallengeTry>(
  {
    challenge: { type: Types.ObjectId, ref: "Challenge", required: true },
    training: { type: Types.ObjectId, ref: "Training", required: true },
    isCompleted: { type: Boolean, required: true, default: false },
  },
  {
    timestamps: true,
    collection: "challenge_tries",
    versionKey: false,
  }
);


