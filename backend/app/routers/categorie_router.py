from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("/", response_model=List[schemas.CategorieOut])
def list_categories(db: Session = Depends(get_db)):
    return db.query(models.Categorie).all()


@router.get("/{id_categorie}", response_model=schemas.CategorieOut)
def get_categorie(id_categorie: int, db: Session = Depends(get_db)):
    cat = db.query(models.Categorie).get(id_categorie)
    if not cat:
        raise HTTPException(status_code=404, detail="Catégorie introuvable")
    return cat


@router.post("/", response_model=schemas.CategorieOut, status_code=status.HTTP_201_CREATED)
def create_categorie(
    payload: schemas.CategorieCreate,
    db: Session = Depends(get_db),
    current_user: models.Utilisateur = Depends(auth.require_role("ADMIN", "GESTIONNAIRE")),
):
    cat = models.Categorie(**payload.model_dump())
    db.add(cat)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Cette catégorie existe déjà")
    db.refresh(cat)
    return cat


@router.put("/{id_categorie}", response_model=schemas.CategorieOut)
def update_categorie(
    id_categorie: int,
    payload: schemas.CategorieUpdate,
    db: Session = Depends(get_db),
    current_user: models.Utilisateur = Depends(auth.require_role("ADMIN", "GESTIONNAIRE")),
):
    cat = db.query(models.Categorie).get(id_categorie)
    if not cat:
        raise HTTPException(status_code=404, detail="Catégorie introuvable")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(cat, key, value)
    db.commit()
    db.refresh(cat)
    return cat


@router.delete("/{id_categorie}", status_code=status.HTTP_204_NO_CONTENT)
def delete_categorie(
    id_categorie: int,
    db: Session = Depends(get_db),
    current_user: models.Utilisateur = Depends(auth.require_role("ADMIN")),
):
    cat = db.query(models.Categorie).get(id_categorie)
    if not cat:
        raise HTTPException(status_code=404, detail="Catégorie introuvable")
    db.delete(cat)
    db.commit()
