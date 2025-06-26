import mongoose from "mongoose";
import dotenv from "dotenv";
import userModel from "../models/users";
import { generateUserToken } from "../modules/sharedFunctions";

dotenv.config();

const seedUsers = async () => {
  await mongoose.connect(process.env.MONGO_URI!);

  const existing = await userModel.countDocuments();
  if (existing > 0) {
    return;
  }

  await userModel.create([
    {
      email: "admin@example.com",
      password: "admin123",
      first_name: "Admin",
      last_name: "Super",
      role: "SUPER_ADMIN",
      is_active: true,
      token: generateUserToken("Admin", "Super"),
    },
    {
      email: "owner@example.com",
      password: "owner123",
      first_name: "Owner",
      last_name: "Salle",
      role: "SALLE_OWNER",
      is_active: true,
      token: generateUserToken("Owner", "Salle"),
    },
    {
      email: "client@example.com",
      password: "client123",
      first_name: "Client",
      last_name: "User",
      role: "CLIENT",
      is_active: true,
      token: generateUserToken("Client", "User"),
    },
  ]);

  console.log("✅ Utilisateurs créés");
};

seedUsers();
