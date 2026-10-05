# Gestion de Stock PPN — Projet complet

```
gestion_stock_ppn/
├── backend/     → API FastAPI (voir backend/README.md)
└── frontend/    → Interface React (voir frontend/README.md)
```

## Liaison frontend ↔ backend

| Variable | Fichier | Valeur par défaut |
|---|---|---|
| `VITE_API_URL` | `frontend/.env` | `http://localhost:8000` |
| `FRONTEND_URL` | `backend/.env` | `http://localhost:5173` |

Par défaut, les deux se répondent déjà — rien à ajuster si tu gardes les ports standards.

## Lancer (2 terminaux)

**Terminal 1 — Backend**
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # renseigne tes identifiants MySQL
python create_admin.py
uvicorn app.main:app --reload
```

**Terminal 2 — Frontend**
```bash
cd frontend
npm install
npm run dev
```

Ouvre http://localhost:5173.

## Nouveautés de cette version

- **Inscription publique** (`/register`) : plus besoin de passer par `create_admin.py` pour le premier utilisateur non-admin.
- **Gestion des utilisateurs complète** : un admin peut désormais modifier (rôle, mot de passe) un utilisateur, pas seulement créer/supprimer. Un admin ne peut pas se supprimer lui-même ni changer son propre rôle.
- **Page Statistiques** (`/statistiques`) : nombre de ventes, chiffre d'affaires total, panier moyen, graphique du CA par jour, top 5 des produits les plus vendus.
- **Correctif bcrypt/passlib** : le hashage des mots de passe utilise `bcrypt` directement (plus de dépendance à `passlib`, qui casse avec bcrypt 4.1+).

## Dépannage

| Symptôme | Cause probable | Solution |
|---|---|---|
| Erreur CORS | `FRONTEND_URL` ≠ port du frontend | Vérifie `backend/.env`, relance uvicorn |
| Page blanche / erreur réseau | Backend non lancé ou mauvaise `VITE_API_URL` | Vérifie `uvicorn` et `frontend/.env` |
| `AttributeError: module 'bcrypt' has no attribute '__about__'` | Ancienne version du projet avec passlib | Utilise ce package à jour (bcrypt direct) |
| Erreur MySQL au démarrage | Identifiants incorrects | Vérifie `DB_USER`, `DB_PASSWORD`, `DB_NAME` dans `backend/.env` |
