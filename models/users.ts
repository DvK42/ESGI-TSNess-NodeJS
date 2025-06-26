import mongoose, { Document, Schema } from "mongoose";

export type UserRole = "SUPER_ADMIN" | "SALLE_OWNER" | "CLIENT";

export interface IUser extends Document {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
  token: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    role: {
      type: String,
      enum: ["SUPER_ADMIN", "SALLE_OWNER", "CLIENT"],
      default: "CLIENT",
      required: true,
    },
    is_active: { type: Boolean, default: true },
    token: { type: String },
  },
  { timestamps: true }
);

const userModel = mongoose.model("users", userSchema);

export default userModel;
