from sqlalchemy import (
    Column, Integer, String, DECIMAL, Date, ForeignKey, Enum
)
from sqlalchemy.orm import relationship
import enum

from app.database import Base


class RoleEnum(str, enum.Enum):
    ADMIN = "ADMIN"
    GESTIONNAIRE = "GESTIONNAIRE"
    CAISSIER = "CAISSIER"


class Categorie(Base):
    __tablename__ = "categorie"

    id_categorie = Column(Integer, primary_key=True, index=True)
    nom = Column(String(100), nullable=False, unique=True)

    produits = relationship("Produit", back_populates="categorie", cascade="all, delete")


class Produit(Base):
    __tablename__ = "produit"

    id_produit = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), nullable=False, unique=True)
    designation = Column(String(150), nullable=False)
    prix_achat = Column(DECIMAL(10, 2), nullable=False)
    prix_vente = Column(DECIMAL(10, 2), nullable=False)
    stock_minimum = Column(Integer, default=0)
    quantite_stock = Column(Integer, default=0)
    id_categorie = Column(Integer, ForeignKey("categorie.id_categorie", ondelete="CASCADE"), nullable=False)

    categorie = relationship("Categorie", back_populates="produits")
    details_entree = relationship("DetailEntree", back_populates="produit")
    details_sortie = relationship("DetailSortie", back_populates="produit")
    details_vente = relationship("DetailVente", back_populates="produit")


class Fournisseur(Base):
    __tablename__ = "fournisseur"

    id_fournisseur = Column(Integer, primary_key=True, index=True)
    nom = Column(String(100), nullable=False)
    adresse = Column(String(255))
    telephone = Column(String(20))
    email = Column(String(100))

    approvisionnements = relationship("Approvisionnement", back_populates="fournisseur")


class Approvisionnement(Base):
    __tablename__ = "approvisionnement"

    id_approvisionnement = Column(Integer, primary_key=True, index=True)
    date_entree = Column(Date, nullable=False)
    id_fournisseur = Column(Integer, ForeignKey("fournisseur.id_fournisseur", ondelete="RESTRICT"), nullable=False)

    fournisseur = relationship("Fournisseur", back_populates="approvisionnements")
    details = relationship("DetailEntree", back_populates="approvisionnement", cascade="all, delete")


class DetailEntree(Base):
    __tablename__ = "detail_entree"

    id_detail_entree = Column(Integer, primary_key=True, index=True)
    id_approvisionnement = Column(Integer, ForeignKey("approvisionnement.id_approvisionnement", ondelete="CASCADE"), nullable=False)
    id_produit = Column(Integer, ForeignKey("produit.id_produit", ondelete="RESTRICT"), nullable=False)
    quantite = Column(Integer, nullable=False)

    approvisionnement = relationship("Approvisionnement", back_populates="details")
    produit = relationship("Produit", back_populates="details_entree")


class Sortie(Base):
    __tablename__ = "sortie"

    id_sortie = Column(Integer, primary_key=True, index=True)
    date_sortie = Column(Date, nullable=False)
    motif = Column(String(100), nullable=False)

    details = relationship("DetailSortie", back_populates="sortie", cascade="all, delete")


class DetailSortie(Base):
    __tablename__ = "detail_sortie"

    id_detail_sortie = Column(Integer, primary_key=True, index=True)
    id_sortie = Column(Integer, ForeignKey("sortie.id_sortie", ondelete="CASCADE"), nullable=False)
    id_produit = Column(Integer, ForeignKey("produit.id_produit", ondelete="RESTRICT"), nullable=False)
    quantite = Column(Integer, nullable=False)

    sortie = relationship("Sortie", back_populates="details")
    produit = relationship("Produit", back_populates="details_sortie")


class Utilisateur(Base):
    __tablename__ = "utilisateur"

    id_utilisateur = Column(Integer, primary_key=True, index=True)
    nom = Column(String(100), nullable=False)
    mot_de_passe = Column(String(255), nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.GESTIONNAIRE)

    ventes = relationship("Vente", back_populates="utilisateur")


class Vente(Base):
    __tablename__ = "vente"

    id_vente = Column(Integer, primary_key=True, index=True)
    date_vente = Column(Date, nullable=False)
    montant_total = Column(DECIMAL(10, 2), default=0)
    id_utilisateur = Column(Integer, ForeignKey("utilisateur.id_utilisateur"), nullable=False)

    utilisateur = relationship("Utilisateur", back_populates="ventes")
    details = relationship("DetailVente", back_populates="vente", cascade="all, delete")


class DetailVente(Base):
    __tablename__ = "detail_vente"

    id_detail_vente = Column(Integer, primary_key=True, index=True)
    id_vente = Column(Integer, ForeignKey("vente.id_vente", ondelete="CASCADE"), nullable=False)
    id_produit = Column(Integer, ForeignKey("produit.id_produit"), nullable=False)
    quantite = Column(Integer, nullable=False)
    prix = Column(DECIMAL(10, 2), nullable=False)

    vente = relationship("Vente", back_populates="details")
    produit = relationship("Produit", back_populates="details_vente")
