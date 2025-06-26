import crypto from "crypto";
import userModel from "../models/users";

export function generateUserToken(first_name: string, last_name: string): string {
  const timestamp = Date.now();
  const data = `${first_name}:${last_name}:${timestamp}`;
  return crypto.createHash("sha256").update(data).digest("hex");
}

export const isValidUser = async (token: string) => {
  if (!token) return null;

  try {
    const user = await userModel.findOne({ token }).lean();
    return user || null;
  } catch (err) {
    console.error("❌ Erreur dans isValidUser :", err);
    return null;
  }
};
