# API Gestion de Stock PPN — Backend

## Installation
```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows : venv\Scripts\activate
pip install -r requirements.txt
```

## Configuration
```bash
cp .env.example .env
```
Renseigne tes identifiants MySQL (ceux de phpMyAdmin) dans `.env`.

## Créer le premier compte admin
```bash
python create_admin.py
```
(Alternative : utiliser `POST /auth/register` depuis le frontend — crée un compte GESTIONNAIRE, qu'un admin peut ensuite promouvoir.)

## Lancer
```bash
uvicorn app.main:app --reload
```
API : http://localhost:8000 — Doc interactive : http://localhost:8000/docs

## Endpoints

| Méthode | Route | Description |
|---|---|---|
| POST | /auth/register | Inscription publique (rôle GESTIONNAIRE par défaut) |
| POST | /auth/login | Connexion, retourne un token JWT |
| GET | /auth/me | Utilisateur connecté |
| GET/POST/PUT/DELETE | /categories | CRUD catégories |
| GET/POST/PUT/DELETE | /produits | CRUD produits (`?q=`, `?id_categorie=`, `?stock_bas=true`) |
| GET/POST/PUT/DELETE | /fournisseurs | CRUD fournisseurs |
| GET/POST | /approvisionnements | Entrées de stock |
| GET/POST | /sorties | Sorties de stock |
| GET/POST | /ventes | Ventes |
| GET | /ventes/statistiques/resume | Chiffre d'affaires, ventes par jour, top produits |
| GET/POST/PUT/DELETE | /utilisateurs | Gestion des comptes (admin uniquement) |

## Points clés métier

- Approvisionnement → augmente le stock. Sortie/Vente → vérifient puis décrémentent le stock.
- Vente → calcule `montant_total` automatiquement.
- Un admin ne peut pas supprimer son propre compte.
- Hashage des mots de passe via `bcrypt` directement (pas de `passlib`, pour éviter l'incompatibilité connue passlib/bcrypt 4.1+).
