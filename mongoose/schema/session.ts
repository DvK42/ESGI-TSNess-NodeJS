import { Schema, Types } from "mongoose";

import { Session } from "../../models";

export const sessionSchema = new Schema<Session>(
  {
      expirationDate: { type: Date },
      user: { type: Types.ObjectId, ref: 'User', required: true },
  },
  {
      timestamps: true,
      collection: "sessions",
      versionKey: false,
  },
)
