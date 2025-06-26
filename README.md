# ESGI-TSNess-NodeJS

Ce projet est une API REST développée avec **Node.js**, **TypeScript**, **Express** et **MongoDB**, conçue pour être lancée rapidement à l’aide de **Docker**.

---

## 🚀 Prérequis

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

---

## ⚙️ Installation et Lancement

1. **Cloner le dépôt :**

   ```bash
   git clone https://github.com/DvK42/ESGI-TSNess-NodeJS.git
   cd ESGI-TSNess-NodeJS
   ```

2. **Configurer les variables d'environnement :**

   Copiez le fichier `.env.example` en `.env` :

   ```bash
   cp .env.example .env
   ```

3. **Lancer les services avec Docker Compose :**

   ```bash
   docker-compose up --build
   ```

   Cela va :

   - Démarrer une base MongoDB sur le port **27017**
   - Démarrer l’API sur le port **3001**

4. **Accéder à l’API :**

   Exemple d’endpoint accessible :

   ```
   http://localhost:3001/api/users
   ```

5. **Arrêter les services :**

   ```bash
   docker-compose down
   ```

---

## 👨‍💻 Développement

- Le projet utilise **ts-node-dev** pour un rechargement automatique du code en développement.
- Les données MongoDB sont **persistées** grâce au volume Docker `mongo-data`.

---

## 📁 Structure du Projet

```txt
📦 ESGI-TSNess-NodeJS
├── models       → Schémas Mongoose
├── routes       → Routes Express
├── modules      → Fonctions utilitaires
├── seeders      → Données d'initialisation
├── .env         → Variables d'environnement
├── docker-compose.yml
└── ...
```

---

## 📫 Contexte

> Projet réalisé dans le cadre de l’ESGI
