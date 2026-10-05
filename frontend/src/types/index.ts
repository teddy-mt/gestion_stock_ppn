export type Role = "ADMIN" | "GESTIONNAIRE" | "CAISSIER";

export interface Categorie {
  id_categorie: number;
  nom: string;
}

export interface Produit {
  id_produit: number;
  code: string;
  designation: string;
  prix_achat: number;
  prix_vente: number;
  stock_minimum: number;
  quantite_stock: number;
  id_categorie: number;
  categorie?: Categorie;
}

export interface Fournisseur {
  id_fournisseur: number;
  nom: string;
  adresse?: string;
  telephone?: string;
  email?: string;
}

export interface DetailEntree {
  id_detail_entree: number;
  id_produit: number;
  quantite: number;
  produit?: Produit;
}

export interface Approvisionnement {
  id_approvisionnement: number;
  date_entree: string;
  id_fournisseur: number;
  fournisseur?: Fournisseur;
  details: DetailEntree[];
}

export interface DetailSortie {
  id_detail_sortie: number;
  id_produit: number;
  quantite: number;
  produit?: Produit;
}

export interface Sortie {
  id_sortie: number;
  date_sortie: string;
  motif: string;
  details: DetailSortie[];
}

export interface DetailVente {
  id_detail_vente: number;
  id_produit: number;
  quantite: number;
  prix: number;
  produit?: Produit;
}

export interface Vente {
  id_vente: number;
  date_vente: string;
  id_utilisateur: number;
  montant_total: number;
  details: DetailVente[];
}

export interface Utilisateur {
  id_utilisateur: number;
  nom: string;
  role: Role;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  utilisateur: Utilisateur;
}

export interface VenteParJour {
  date: string;
  total: number;
  nombre_ventes: number;
}

export interface TopProduitVente {
  produit: string;
  quantite: number;
  montant: number;
}

export interface StatistiquesVentes {
  nombre_ventes: number;
  chiffre_affaires_total: number;
  panier_moyen: number;
  ventes_par_jour: VenteParJour[];
  top_produits: TopProduitVente[];
}
