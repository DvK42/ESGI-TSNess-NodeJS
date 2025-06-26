import { Schema } from "mongoose";
import { userScoreModel } from "../models/userScores";

export async function getLeaderboard(limit = 10) {
  return userScoreModel.find().sort({ score: -1 }).limit(limit).populate("user", "first_name last_name");
}

export async function addUserScore(userId: Schema.Types.ObjectId, points: number) {
  const updated = await userScoreModel.findOneAndUpdate(
    { user: userId },
    { $inc: { score: points }, $set: { lastUpdated: new Date() } },
    { upsert: true, new: true }
  );

  return updated;
}
