import { Schema, Types } from "mongoose";

import { ChallengeGroupTry } from "../../models";

export const challengeGroupTrySchema: Schema<ChallengeGroupTry> = new Schema(
  {
    users: [{ type: Types.ObjectId, ref: "User", required: true }],
    challenge: { type: Types.ObjectId, ref: "Challenge", required: true },
    creator: { type: Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
  },
  {
    timestamps: true,
    collection: "groups",
    versionKey: false,
  }
);
