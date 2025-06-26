import mongoose from 'mongoose';
import {config} from "dotenv";
config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('✅ Connecté à MongoDB (Docker)');
  } catch (err) {
    if (err instanceof Error) {
      console.error('❌ Erreur MongoDB :', err.message);
    } else {
      console.error('❌ Erreur MongoDB inconnue :', err);
    }
  }
};

export default connectDB;