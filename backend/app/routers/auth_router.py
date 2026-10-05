from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/auth", tags=["Authentification"])


@router.post("/register", response_model=schemas.Token, status_code=status.HTTP_201_CREATED)
def register(payload: schemas.RegisterRequest, db: Session = Depends(get_db)):
    existant = db.query(models.Utilisateur).filter(
        models.Utilisateur.nom == payload.nom
    ).first()
    if existant:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ce nom d'utilisateur est déjà pris",
        )

    user = models.Utilisateur(
        nom=payload.nom,
        mot_de_passe=auth.hash_password(payload.mot_de_passe),
        role=models.RoleEnum.GESTIONNAIRE,
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Ce nom d'utilisateur est déjà pris")
    db.refresh(user)

    access_token = auth.create_access_token(data={"sub": str(user.id_utilisateur)})
    return schemas.Token(access_token=access_token, utilisateur=user)


@router.post("/login", response_model=schemas.Token)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.Utilisateur).filter(
        models.Utilisateur.nom == payload.nom
    ).first()

    if not user or not auth.verify_password(payload.mot_de_passe, user.mot_de_passe):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nom d'utilisateur ou mot de passe incorrect",
        )

    access_token = auth.create_access_token(data={"sub": str(user.id_utilisateur)})
    return schemas.Token(access_token=access_token, utilisateur=user)


@router.get("/me", response_model=schemas.UtilisateurOut)
def read_current_user(current_user: models.Utilisateur = Depends(auth.get_current_user)):
    return current_user
