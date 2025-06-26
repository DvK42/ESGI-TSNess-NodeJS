# 📄 Documentation API — Création d’un Utilisateur

## ➕ Endpoint

**POST** `/api/users`

---

## 📤 Corps de la requête (JSON)

Envoyez un objet JSON contenant les informations suivantes :

```json
{
  "email": "test@example.com",
  "password": "motdepasseHashe",
  "first_name": "Jean",
  "last_name": "Dupont",
  "role": "SALLE_OWNER",
  "is_active": true
}
```

### Champs obligatoires :

| Champ        | Type    | Description                                                    |
| ------------ | ------- | -------------------------------------------------------------- |
| `email`      | string  | Adresse email unique de l’utilisateur                          |
| `password`   | string  | Mot de passe **déjà haché**                                    |
| `first_name` | string  | Prénom                                                         |
| `last_name`  | string  | Nom de famille                                                 |
| `role`       | string  | Rôle de l’utilisateur (`SUPER_ADMIN`, `SALLE_OWNER`, `CLIENT`) |
| `is_active`  | boolean | Statut du compte (actif ou non)                                |

---

## ✅ Exemple avec `fetch` (JavaScript)

```ts
fetch("http://localhost:3001/api/users", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: "test@example.com",
    password: "motdepasseHashe",
    first_name: "Jean",
    last_name: "Dupont",
    role: "SALLE_OWNER",
    is_active: true,
  }),
})
  .then((res) => res.json())
  .then((data) => console.log("Utilisateur créé :", data))
  .catch((err) => console.error("Erreur :", err));
```

---

## 🧪 Réponse attendue

```json
{
  "message": "Utilisateur créé avec succès",
  "user": {
    "_id": "685d8118b2c36354bbfef337",
    "email": "test@example.com",
    "password": "$2b$10$rVyvT9SLO0d//tXwz57JT..vaPfPta0cwStyFVGOD5r3lLrulV4ai",
    "first_name": "Jean",
    "last_name": "Dupont",
    "role": "SALLE_OWNER",
    "is_active": true,
    "token": "1de1f1ed700beebf702f701c7d9a6f258a34f21072767e1e2dd66bb8a2dbaa32",
    "createdAt": "2025-06-26T17:19:20.885Z",
    "updatedAt": "2025-06-26T17:19:20.885Z",
    "__v": 0
  }
}
```
