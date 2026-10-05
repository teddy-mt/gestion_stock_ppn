# Gestion de Stock PPN — Frontend

## Installation
```bash
cd frontend
npm install
```

## Lancer
Backend lancé sur le port 8000, puis :
```bash
npm run dev
```
http://localhost:5173

## Pages
- Login / Register (inscription publique)
- Dashboard (stats + alertes stock bas)
- Produits, Catégories, Fournisseurs (CRUD)
- Approvisionnements, Sorties (mouvements de stock, formulaires multi-lignes)
- Ventes (calcul auto du total) + lien vers Statistiques
- **Statistiques** : chiffre d'affaires total, panier moyen, graphique du CA par jour (recharts), top 5 produits vendus
- Utilisateurs (admin) : création, **modification** (rôle, mot de passe), suppression — un admin ne peut ni se supprimer ni changer son propre rôle depuis l'interface

## Accès par rôle

| Page | ADMIN | GESTIONNAIRE | CAISSIER |
|---|---|---|---|
| Tableau de bord | ✓ | ✓ | ✓ |
| Produits | ✓ | ✓ | ✓ |
| Catégories / Fournisseurs / Approvisionnements / Sorties | ✓ | ✓ | — |
| Ventes / Statistiques | ✓ | ✓ | ✓ |
| Utilisateurs | ✓ | — | — |
