import { Schema, model, Types, Document } from "mongoose";

export interface IUserScore extends Document {
  user: Types.ObjectId;
  score: number;
  lastUpdated: Date;
}

const UserScoreSchema = new Schema<IUserScore>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  score: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
});

UserScoreSchema.pre("save", function (next) {
  this.lastUpdated = new Date();
  next();
});

export const userScoreModel = model<IUserScore>("userScores", UserScoreSchema);
