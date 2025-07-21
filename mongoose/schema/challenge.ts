import { Schema, Types } from "mongoose";
import { Challenge, } from "../../models";

export const challengeSchema = new Schema<Challenge>(
  {
    creator: { type: Types.ObjectId, ref: "User", required: true },
    targetResults: [
      { type: Types.ObjectId, ref: "Result" }
    ],
  },
  {
    timestamps: true,
    collection: "challenges",
    versionKey: false,
  }
);


