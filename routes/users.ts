import { Router } from "express";
import bcrypt from "bcrypt";
import userModel from "../models/users";
import { generateUserToken } from "../modules/sharedFunctions";

const router = Router();

// Récupère tous les utilisateurs
router.get("/", async (req, res) => {
  console.log("🔍 GET /api/users appelée");

  let message = "";
  let userList = [];
  try {
    userList = await userModel.find().lean();
    if (userList.length > 0) {
      message = `Voici la liste des ${userList.length} utilisateurs !`;
    } else {
      message = "Aucun utilisateur trouvé";
    }
    res.json({ userList, message });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération des utilisateurs" });
  }
});

// Créer un utilisateur
router.post("/", async (req, res) => {
  console.log("🔍 POST /api/users appelée");

  try {
    const { email, password, first_name, last_name, role, is_active } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const token = generateUserToken(first_name, last_name);

    const user = await userModel.create({
      email,
      password: hashedPassword,
      first_name,
      last_name,
      role,
      is_active,
      token,
    });

    res.status(201).json(user);
  } catch (error: any) {
    console.error("Erreur création utilisateur :", error.message);
    res.status(500).json({ error: "Impossible de créer l'utilisateur" });
  }
});

export default router;
