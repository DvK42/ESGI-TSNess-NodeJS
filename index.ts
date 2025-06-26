import { config } from 'dotenv';
config();

import connectDB from './db';
import express from 'express';
const app = express();
app.use(express.json());

import userRoutes from './routes/users';
app.use('/api/users', userRoutes);

const startServer = async () => {
  try {
    await connectDB();

    // ✅ Importer le seeder APRÈS la connexion
    await import('./seeders/users');

    const port = process.env.PORT || 3001;
    app.listen(port, () => {
      console.log(`🚀 Serveur démarré sur http://localhost:${port}`);
    });
  } catch (err) {
    console.error('❌ Échec de démarrage :', err);
    process.exit(1);
  }
};

startServer();
