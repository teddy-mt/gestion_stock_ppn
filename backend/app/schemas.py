from datetime import date
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.models import RoleEnum


# ============ CATEGORIE ============
class CategorieBase(BaseModel):
    nom: str


class CategorieCreate(CategorieBase):
    pass


class CategorieUpdate(BaseModel):
    nom: Optional[str] = None


class CategorieOut(CategorieBase):
    model_config = ConfigDict(from_attributes=True)
    id_categorie: int


# ============ PRODUIT ============
class ProduitBase(BaseModel):
    code: str
    designation: str
    prix_achat: Decimal
    prix_vente: Decimal
    stock_minimum: int = 0
    quantite_stock: int = 0
    id_categorie: int


class ProduitCreate(ProduitBase):
    pass


class ProduitUpdate(BaseModel):
    code: Optional[str] = None
    designation: Optional[str] = None
    prix_achat: Optional[Decimal] = None
    prix_vente: Optional[Decimal] = None
    stock_minimum: Optional[int] = None
    quantite_stock: Optional[int] = None
    id_categorie: Optional[int] = None


class ProduitOut(ProduitBase):
    model_config = ConfigDict(from_attributes=True)
    id_produit: int
    categorie: Optional[CategorieOut] = None


# ============ FOURNISSEUR ============
class FournisseurBase(BaseModel):
    nom: str
    adresse: Optional[str] = None
    telephone: Optional[str] = None
    email: Optional[str] = None


class FournisseurCreate(FournisseurBase):
    pass


class FournisseurUpdate(BaseModel):
    nom: Optional[str] = None
    adresse: Optional[str] = None
    telephone: Optional[str] = None
    email: Optional[str] = None


class FournisseurOut(FournisseurBase):
    model_config = ConfigDict(from_attributes=True)
    id_fournisseur: int


# ============ DETAIL ENTREE ============
class DetailEntreeBase(BaseModel):
    id_produit: int
    quantite: int


class DetailEntreeCreate(DetailEntreeBase):
    pass


class DetailEntreeOut(DetailEntreeBase):
    model_config = ConfigDict(from_attributes=True)
    id_detail_entree: int
    produit: Optional[ProduitOut] = None


# ============ APPROVISIONNEMENT ============
class ApprovisionnementBase(BaseModel):
    date_entree: date
    id_fournisseur: int


class ApprovisionnementCreate(ApprovisionnementBase):
    details: List[DetailEntreeCreate]


class ApprovisionnementOut(ApprovisionnementBase):
    model_config = ConfigDict(from_attributes=True)
    id_approvisionnement: int
    fournisseur: Optional[FournisseurOut] = None
    details: List[DetailEntreeOut] = []


# ============ DETAIL SORTIE ============
class DetailSortieBase(BaseModel):
    id_produit: int
    quantite: int


class DetailSortieCreate(DetailSortieBase):
    pass


class DetailSortieOut(DetailSortieBase):
    model_config = ConfigDict(from_attributes=True)
    id_detail_sortie: int
    produit: Optional[ProduitOut] = None


# ============ SORTIE ============
class SortieBase(BaseModel):
    date_sortie: date
    motif: str


class SortieCreate(SortieBase):
    details: List[DetailSortieCreate]


class SortieOut(SortieBase):
    model_config = ConfigDict(from_attributes=True)
    id_sortie: int
    details: List[DetailSortieOut] = []


# ============ UTILISATEUR ============
class UtilisateurBase(BaseModel):
    nom: str
    role: RoleEnum = RoleEnum.GESTIONNAIRE


class UtilisateurCreate(UtilisateurBase):
    mot_de_passe: str


class UtilisateurUpdate(BaseModel):
    nom: Optional[str] = None
    role: Optional[RoleEnum] = None
    mot_de_passe: Optional[str] = None


class UtilisateurOut(UtilisateurBase):
    model_config = ConfigDict(from_attributes=True)
    id_utilisateur: int


# ============ AUTH ============
class LoginRequest(BaseModel):
    nom: str
    mot_de_passe: str


class RegisterRequest(BaseModel):
    nom: str
    mot_de_passe: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    utilisateur: UtilisateurOut


# ============ DETAIL VENTE ============
class DetailVenteBase(BaseModel):
    id_produit: int
    quantite: int
    prix: Decimal


class DetailVenteCreate(DetailVenteBase):
    pass


class DetailVenteOut(DetailVenteBase):
    model_config = ConfigDict(from_attributes=True)
    id_detail_vente: int
    produit: Optional[ProduitOut] = None


# ============ VENTE ============
class VenteBase(BaseModel):
    date_vente: date
    id_utilisateur: int


class VenteCreate(BaseModel):
    id_utilisateur: int
    date_vente: date
    details: List[DetailVenteCreate]


class VenteOut(VenteBase):
    model_config = ConfigDict(from_attributes=True)
    id_vente: int
    montant_total: Decimal
    details: List[DetailVenteOut] = []


# ============ STATISTIQUES VENTES ============
class VenteParJour(BaseModel):
    date: str
    total: float
    nombre_ventes: int


class TopProduitVente(BaseModel):
    produit: str
    quantite: int
    montant: float


class StatistiquesVentes(BaseModel):
    nombre_ventes: int
    chiffre_affaires_total: float
    panier_moyen: float
    ventes_par_jour: List[VenteParJour]
    top_produits: List[TopProduitVente]
