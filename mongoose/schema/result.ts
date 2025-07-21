import { Schema, Types } from "mongoose";
import { Result, ResultData } from "../../models";

export const resultSchema = new Schema<Result>(
  {
    exercise: { type: Types.ObjectId, ref: "Exercise", required: true },
    data: {
      type: String,
      required: true,
      default: {},
      get: (data: string) => JSON.parse(data),
      set: (data: ResultData) => JSON.stringify(data),
    },
  },
  {
    timestamps: true,
    collection: "results",
    versionKey: false,
  }
);
