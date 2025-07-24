import { Schema, Types } from "mongoose";
import { Result, UserBadge } from "../../models";

export const userBadgeSchema = new Schema<UserBadge>(
  {
    user: { type: Types.ObjectId, ref: "User", required: true },
    badge: { type: Types.ObjectId, ref: "Badge", required: true },
  },
  {
    timestamps: true,
    collection: "user_badges",
    versionKey: false,
  }
);
