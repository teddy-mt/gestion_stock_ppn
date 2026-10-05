from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/utilisateurs", tags=["Utilisateurs"])


@router.get("/", response_model=List[schemas.UtilisateurOut])
def list_utilisateurs(
    db: Session = Depends(get_db),
    current_user: models.Utilisateur = Depends(auth.require_role("ADMIN")),
):
    return db.query(models.Utilisateur).all()


@router.post("/", response_model=schemas.UtilisateurOut, status_code=status.HTTP_201_CREATED)
def create_utilisateur(
    payload: schemas.UtilisateurCreate,
    db: Session = Depends(get_db),
    current_user: models.Utilisateur = Depends(auth.require_role("ADMIN")),
):
    user = models.Utilisateur(
        nom=payload.nom,
        role=payload.role,
        mot_de_passe=auth.hash_password(payload.mot_de_passe),
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Cet utilisateur existe déjà")
    db.refresh(user)
    return user


@router.put("/{id_utilisateur}", response_model=schemas.UtilisateurOut)
def update_utilisateur(
    id_utilisateur: int,
    payload: schemas.UtilisateurUpdate,
    db: Session = Depends(get_db),
    current_user: models.Utilisateur = Depends(auth.require_role("ADMIN")),
):
    user = db.query(models.Utilisateur).get(id_utilisateur)
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")

    data = payload.model_dump(exclude_unset=True)
    if "mot_de_passe" in data:
        if not data["mot_de_passe"]:
            data.pop("mot_de_passe")
        else:
            data["mot_de_passe"] = auth.hash_password(data["mot_de_passe"])
    for key, value in data.items():
        setattr(user, key, value)

    db.commit()
    db.refresh(user)
    return user


@router.delete("/{id_utilisateur}", status_code=status.HTTP_204_NO_CONTENT)
def delete_utilisateur(
    id_utilisateur: int,
    db: Session = Depends(get_db),
    current_user: models.Utilisateur = Depends(auth.require_role("ADMIN")),
):
    user = db.query(models.Utilisateur).get(id_utilisateur)
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    if user.id_utilisateur == current_user.id_utilisateur:
        raise HTTPException(status_code=400, detail="Tu ne peux pas supprimer ton propre compte")
    db.delete(user)
    db.commit()
