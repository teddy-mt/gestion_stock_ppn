from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import (
    auth_router,
    categorie_router,
    produit_router,
    fournisseur_router,
    approvisionnement_router,
    sortie_router,
    vente_router,
    utilisateur_router,
)

app = FastAPI(
    title="API Gestion de Stock PPN",
    description="API backend pour la gestion de stock (produits, fournisseurs, ventes, sorties, approvisionnements)",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(categorie_router.router)
app.include_router(produit_router.router)
app.include_router(fournisseur_router.router)
app.include_router(approvisionnement_router.router)
app.include_router(sortie_router.router)
app.include_router(vente_router.router)
app.include_router(utilisateur_router.router)


@app.get("/")
def root():
    return {"message": "API Gestion de Stock PPN - OK"}
