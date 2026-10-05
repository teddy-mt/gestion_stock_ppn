from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/ventes", tags=["Ventes"])


@router.get("/", response_model=List[schemas.VenteOut])
def list_ventes(db: Session = Depends(get_db)):
    return (
        db.query(models.Vente)
        .options(joinedload(models.Vente.details))
        .all()
    )


@router.get("/statistiques/resume", response_model=schemas.StatistiquesVentes)
def get_statistiques_ventes(
    db: Session = Depends(get_db),
    current_user: models.Utilisateur = Depends(
        auth.require_role("ADMIN", "GESTIONNAIRE", "CAISSIER")
    ),
):
    """Statistiques globales : chiffre d'affaires, ventes par jour, top produits."""
    nombre_ventes = db.query(func.count(models.Vente.id_vente)).scalar() or 0
    chiffre_affaires = (
        db.query(func.coalesce(func.sum(models.Vente.montant_total), 0)).scalar() or 0
    )
    panier_moyen = float(chiffre_affaires) / nombre_ventes if nombre_ventes else 0

    # Ventes groupées par jour
    par_jour_rows = (
        db.query(
            models.Vente.date_vente,
            func.sum(models.Vente.montant_total),
            func.count(models.Vente.id_vente),
        )
        .group_by(models.Vente.date_vente)
        .order_by(models.Vente.date_vente)
        .all()
    )
    ventes_par_jour = [
        schemas.VenteParJour(date=str(d), total=float(t or 0), nombre_ventes=n)
        for d, t, n in par_jour_rows
    ]

    # Top 5 des produits les plus vendus (en montant)
    top_rows = (
        db.query(
            models.Produit.designation,
            func.sum(models.DetailVente.quantite),
            func.sum(models.DetailVente.quantite * models.DetailVente.prix),
        )
        .join(models.DetailVente, models.DetailVente.id_produit == models.Produit.id_produit)
        .group_by(models.Produit.id_produit, models.Produit.designation)
        .order_by(func.sum(models.DetailVente.quantite * models.DetailVente.prix).desc())
        .limit(5)
        .all()
    )
    top_produits = [
        schemas.TopProduitVente(produit=nom, quantite=int(qte or 0), montant=float(montant or 0))
        for nom, qte, montant in top_rows
    ]

    return schemas.StatistiquesVentes(
        nombre_ventes=nombre_ventes,
        chiffre_affaires_total=float(chiffre_affaires),
        panier_moyen=round(panier_moyen, 2),
        ventes_par_jour=ventes_par_jour,
        top_produits=top_produits,
    )


@router.get("/{id_vente}", response_model=schemas.VenteOut)
def get_vente(id_vente: int, db: Session = Depends(get_db)):
    vente = db.query(models.Vente).get(id_vente)
    if not vente:
        raise HTTPException(status_code=404, detail="Vente introuvable")
    return vente


@router.post("/", response_model=schemas.VenteOut, status_code=status.HTTP_201_CREATED)
def create_vente(
    payload: schemas.VenteCreate,
    db: Session = Depends(get_db),
    current_user: models.Utilisateur = Depends(auth.require_role("ADMIN", "GESTIONNAIRE", "CAISSIER")),
):
    if not payload.details:
        raise HTTPException(status_code=400, detail="La vente doit contenir au moins un produit")

    utilisateur = db.query(models.Utilisateur).get(payload.id_utilisateur)
    if not utilisateur:
        raise HTTPException(status_code=400, detail="Utilisateur inexistant")

    produits_cache = {}
    montant_total = 0
    for ligne in payload.details:
        produit = db.query(models.Produit).get(ligne.id_produit)
        if not produit:
            raise HTTPException(status_code=400, detail=f"Produit {ligne.id_produit} inexistant")
        if produit.quantite_stock < ligne.quantite:
            raise HTTPException(
                status_code=400,
                detail=f"Stock insuffisant pour '{produit.designation}' "
                       f"(disponible: {produit.quantite_stock}, demandé: {ligne.quantite})",
            )
        produits_cache[ligne.id_produit] = produit
        montant_total += float(ligne.prix) * ligne.quantite

    vente = models.Vente(
        date_vente=payload.date_vente,
        id_utilisateur=payload.id_utilisateur,
        montant_total=montant_total,
    )
    db.add(vente)
    db.flush()

    for ligne in payload.details:
        detail = models.DetailVente(
            id_vente=vente.id_vente,
            id_produit=ligne.id_produit,
            quantite=ligne.quantite,
            prix=ligne.prix,
        )
        db.add(detail)
        produits_cache[ligne.id_produit].quantite_stock -= ligne.quantite

    db.commit()
    db.refresh(vente)
    return vente
