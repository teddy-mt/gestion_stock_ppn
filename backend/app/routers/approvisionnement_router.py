from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/approvisionnements", tags=["Approvisionnements"])


@router.get("/", response_model=List[schemas.ApprovisionnementOut])
def list_approvisionnements(db: Session = Depends(get_db)):
    return (
        db.query(models.Approvisionnement)
        .options(joinedload(models.Approvisionnement.details))
        .all()
    )


@router.get("/{id_approvisionnement}", response_model=schemas.ApprovisionnementOut)
def get_approvisionnement(id_approvisionnement: int, db: Session = Depends(get_db)):
    appro = db.query(models.Approvisionnement).get(id_approvisionnement)
    if not appro:
        raise HTTPException(status_code=404, detail="Approvisionnement introuvable")
    return appro


@router.post("/", response_model=schemas.ApprovisionnementOut, status_code=status.HTTP_201_CREATED)
def create_approvisionnement(
    payload: schemas.ApprovisionnementCreate,
    db: Session = Depends(get_db),
    current_user: models.Utilisateur = Depends(auth.require_role("ADMIN", "GESTIONNAIRE")),
):
    fournisseur = db.query(models.Fournisseur).get(payload.id_fournisseur)
    if not fournisseur:
        raise HTTPException(status_code=400, detail="Fournisseur inexistant")
    if not payload.details:
        raise HTTPException(status_code=400, detail="L'approvisionnement doit contenir au moins un produit")

    appro = models.Approvisionnement(
        date_entree=payload.date_entree,
        id_fournisseur=payload.id_fournisseur,
    )
    db.add(appro)
    db.flush()

    for ligne in payload.details:
        produit = db.query(models.Produit).get(ligne.id_produit)
        if not produit:
            db.rollback()
            raise HTTPException(status_code=400, detail=f"Produit {ligne.id_produit} inexistant")

        detail = models.DetailEntree(
            id_approvisionnement=appro.id_approvisionnement,
            id_produit=ligne.id_produit,
            quantite=ligne.quantite,
        )
        db.add(detail)
        produit.quantite_stock += ligne.quantite

    db.commit()
    db.refresh(appro)
    return appro
