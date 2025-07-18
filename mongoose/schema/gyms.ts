import { Schema, model, Types } from "mongoose";

export interface IGym {
  _id?: Types.ObjectId;
  name: string;
  address: string;
  city: string;
  description?: string;
  capacity: number;
  isApproved: boolean;
  ownerId: Types.ObjectId; // Référence vers User
  createdAt?: Date;
  updatedAt?: Date;
}

const GymSchema = new Schema<IGym>(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    description: { type: String },
    capacity: { type: Number, required: true },
    isApproved: { type: Boolean, default: false },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const gymModel = model<IGym>("gyms", GymSchema);
