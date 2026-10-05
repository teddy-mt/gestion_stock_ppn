from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/fournisseurs", tags=["Fournisseurs"])


@router.get("/", response_model=List[schemas.FournisseurOut])
def list_fournisseurs(db: Session = Depends(get_db)):
    return db.query(models.Fournisseur).all()


@router.get("/{id_fournisseur}", response_model=schemas.FournisseurOut)
def get_fournisseur(id_fournisseur: int, db: Session = Depends(get_db)):
    f = db.query(models.Fournisseur).get(id_fournisseur)
    if not f:
        raise HTTPException(status_code=404, detail="Fournisseur introuvable")
    return f


@router.post("/", response_model=schemas.FournisseurOut, status_code=status.HTTP_201_CREATED)
def create_fournisseur(
    payload: schemas.FournisseurCreate,
    db: Session = Depends(get_db),
    current_user: models.Utilisateur = Depends(auth.require_role("ADMIN", "GESTIONNAIRE")),
):
    f = models.Fournisseur(**payload.model_dump())
    db.add(f)
    db.commit()
    db.refresh(f)
    return f


@router.put("/{id_fournisseur}", response_model=schemas.FournisseurOut)
def update_fournisseur(
    id_fournisseur: int,
    payload: schemas.FournisseurUpdate,
    db: Session = Depends(get_db),
    current_user: models.Utilisateur = Depends(auth.require_role("ADMIN", "GESTIONNAIRE")),
):
    f = db.query(models.Fournisseur).get(id_fournisseur)
    if not f:
        raise HTTPException(status_code=404, detail="Fournisseur introuvable")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(f, key, value)
    db.commit()
    db.refresh(f)
    return f


@router.delete("/{id_fournisseur}", status_code=status.HTTP_204_NO_CONTENT)
def delete_fournisseur(
    id_fournisseur: int,
    db: Session = Depends(get_db),
    current_user: models.Utilisateur = Depends(auth.require_role("ADMIN")),
):
    f = db.query(models.Fournisseur).get(id_fournisseur)
    if not f:
        raise HTTPException(status_code=404, detail="Fournisseur introuvable")
    db.delete(f)
    db.commit()
