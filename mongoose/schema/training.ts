import { Schema, Types } from "mongoose";
import { Training } from "../../models";

export const trainingSchema = new Schema<Training>(
  {
    date: { type: Date, required: true, default: Date.now },
    user: { type: Types.ObjectId, ref: "User", required: true },
    results: [
      { type: Types.ObjectId, ref: "Result" }
    ],
    name: { type: String, required: false },
  },
  {
    timestamps: true,
    collection: "trainings",
    versionKey: false,
  }
);

