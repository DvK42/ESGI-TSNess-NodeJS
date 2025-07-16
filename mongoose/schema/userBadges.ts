import { Schema, model, Types, Document } from "mongoose";

export interface IUserBadge extends Document {
  user: Types.ObjectId;
  badge: Types.ObjectId;
  awardedAt: Date;
}

const UserBadgeSchema = new Schema<IUserBadge>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  badge: { type: Schema.Types.ObjectId, ref: "Badge", required: true },
  awardedAt: { type: Date, default: Date.now },
});

export const userBadgeModel = model<IUserBadge>("userBadges", UserBadgeSchema);
