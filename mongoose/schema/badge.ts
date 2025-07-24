import { Schema, Types } from "mongoose";
import { Badge, ResultData, } from "../../models";

export const badgeSchema = new Schema<Badge>(
  {
    name: { type: String, required: true },
    isGlobalTargetResults: { type: Boolean, default: false },
    targetResults: [
      { type: Types.ObjectId, ref: "Result" }
    ],
    fieldTargetResults: [{
      type: String,
      default: {},
      get: (data: string) => JSON.parse(data),
      set: (data: ResultData) => JSON.stringify(data),
    }],
  },
  {
    timestamps: true,
    collection: "badges",
    versionKey: false,
  }
);


