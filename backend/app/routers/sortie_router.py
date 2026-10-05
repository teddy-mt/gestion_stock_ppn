from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/sorties", tags=["Sorties"])


@router.get("/", response_model=List[schemas.SortieOut])
def list_sorties(db: Session = Depends(get_db)):
    return (
        db.query(models.Sortie)
        .options(joinedload(models.Sortie.details))
        .all()
    )


@router.get("/{id_sortie}", response_model=schemas.SortieOut)
def get_sortie(id_sortie: int, db: Session = Depends(get_db)):
    sortie = db.query(models.Sortie).get(id_sortie)
    if not sortie:
        raise HTTPException(status_code=404, detail="Sortie introuvable")
    return sortie


@router.post("/", response_model=schemas.SortieOut, status_code=status.HTTP_201_CREATED)
def create_sortie(
    payload: schemas.SortieCreate,
    db: Session = Depends(get_db),
    current_user: models.Utilisateur = Depends(auth.require_role("ADMIN", "GESTIONNAIRE")),
):
    if not payload.details:
        raise HTTPException(status_code=400, detail="La sortie doit contenir au moins un produit")

    produits_cache = {}
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

    sortie = models.Sortie(date_sortie=payload.date_sortie, motif=payload.motif)
    db.add(sortie)
    db.flush()

    for ligne in payload.details:
        detail = models.DetailSortie(
            id_sortie=sortie.id_sortie,
            id_produit=ligne.id_produit,
            quantite=ligne.quantite,
        )
        db.add(detail)
        produits_cache[ligne.id_produit].quantite_stock -= ligne.quantite

    db.commit()
    db.refresh(sortie)
    return sortie
