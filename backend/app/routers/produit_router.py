from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/produits", tags=["Produits"])


@router.get("/", response_model=List[schemas.ProduitOut])
def list_produits(
    db: Session = Depends(get_db),
    id_categorie: Optional[int] = None,
    q: Optional[str] = Query(None, description="Recherche par code ou désignation"),
    stock_bas: bool = Query(False, description="Ne retourner que les produits sous le seuil minimum"),
):
    query = db.query(models.Produit)
    if id_categorie:
        query = query.filter(models.Produit.id_categorie == id_categorie)
    if q:
        like = f"%{q}%"
        query = query.filter(
            (models.Produit.code.ilike(like)) | (models.Produit.designation.ilike(like))
        )
    if stock_bas:
        query = query.filter(models.Produit.quantite_stock <= models.Produit.stock_minimum)
    return query.all()


@router.get("/{id_produit}", response_model=schemas.ProduitOut)
def get_produit(id_produit: int, db: Session = Depends(get_db)):
    produit = db.query(models.Produit).get(id_produit)
    if not produit:
        raise HTTPException(status_code=404, detail="Produit introuvable")
    return produit


@router.post("/", response_model=schemas.ProduitOut, status_code=status.HTTP_201_CREATED)
def create_produit(
    payload: schemas.ProduitCreate,
    db: Session = Depends(get_db),
    current_user: models.Utilisateur = Depends(auth.require_role("ADMIN", "GESTIONNAIRE")),
):
    categorie = db.query(models.Categorie).get(payload.id_categorie)
    if not categorie:
        raise HTTPException(status_code=400, detail="Catégorie inexistante")

    produit = models.Produit(**payload.model_dump())
    db.add(produit)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Ce code produit existe déjà")
    db.refresh(produit)
    return produit


@router.put("/{id_produit}", response_model=schemas.ProduitOut)
def update_produit(
    id_produit: int,
    payload: schemas.ProduitUpdate,
    db: Session = Depends(get_db),
    current_user: models.Utilisateur = Depends(auth.require_role("ADMIN", "GESTIONNAIRE")),
):
    produit = db.query(models.Produit).get(id_produit)
    if not produit:
        raise HTTPException(status_code=404, detail="Produit introuvable")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(produit, key, value)
    db.commit()
    db.refresh(produit)
    return produit


@router.delete("/{id_produit}", status_code=status.HTTP_204_NO_CONTENT)
def delete_produit(
    id_produit: int,
    db: Session = Depends(get_db),
    current_user: models.Utilisateur = Depends(auth.require_role("ADMIN")),
):
    produit = db.query(models.Produit).get(id_produit)
    if not produit:
        raise HTTPException(status_code=404, detail="Produit introuvable")
    db.delete(produit)
    db.commit()
