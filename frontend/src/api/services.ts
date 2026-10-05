import api from "./axios";
import type {
  Categorie,
  Produit,
  Fournisseur,
  Approvisionnement,
  Sortie,
  Vente,
  Utilisateur,
  LoginResponse,
  StatistiquesVentes,
} from "@/types";

// ============ AUTH ============
export const loginRequest = (nom: string, mot_de_passe: string) =>
  api.post<LoginResponse>("/auth/login", { nom, mot_de_passe }).then((r) => r.data);

export const registerRequest = (nom: string, mot_de_passe: string) =>
  api.post<LoginResponse>("/auth/register", { nom, mot_de_passe }).then((r) => r.data);

export const getMe = () => api.get<Utilisateur>("/auth/me").then((r) => r.data);

// ============ CATEGORIES ============
export const getCategories = () => api.get<Categorie[]>("/categories/").then((r) => r.data);
export const createCategorie = (nom: string) =>
  api.post<Categorie>("/categories/", { nom }).then((r) => r.data);
export const updateCategorie = (id: number, nom: string) =>
  api.put<Categorie>(`/categories/${id}`, { nom }).then((r) => r.data);
export const deleteCategorie = (id: number) => api.delete(`/categories/${id}`);

// ============ PRODUITS ============
export interface ProduitFilters {
  q?: string;
  id_categorie?: number;
  stock_bas?: boolean;
}
export const getProduits = (filters: ProduitFilters = {}) =>
  api.get<Produit[]>("/produits/", { params: filters }).then((r) => r.data);
export const createProduit = (payload: Omit<Produit, "id_produit" | "categorie">) =>
  api.post<Produit>("/produits/", payload).then((r) => r.data);
export const updateProduit = (id: number, payload: Partial<Produit>) =>
  api.put<Produit>(`/produits/${id}`, payload).then((r) => r.data);
export const deleteProduit = (id: number) => api.delete(`/produits/${id}`);

// ============ FOURNISSEURS ============
export const getFournisseurs = () => api.get<Fournisseur[]>("/fournisseurs/").then((r) => r.data);
export const createFournisseur = (payload: Omit<Fournisseur, "id_fournisseur">) =>
  api.post<Fournisseur>("/fournisseurs/", payload).then((r) => r.data);
export const updateFournisseur = (id: number, payload: Partial<Fournisseur>) =>
  api.put<Fournisseur>(`/fournisseurs/${id}`, payload).then((r) => r.data);
export const deleteFournisseur = (id: number) => api.delete(`/fournisseurs/${id}`);

// ============ APPROVISIONNEMENTS ============
export const getApprovisionnements = () =>
  api.get<Approvisionnement[]>("/approvisionnements/").then((r) => r.data);
export const createApprovisionnement = (payload: {
  date_entree: string;
  id_fournisseur: number;
  details: { id_produit: number; quantite: number }[];
}) => api.post<Approvisionnement>("/approvisionnements/", payload).then((r) => r.data);

// ============ SORTIES ============
export const getSorties = () => api.get<Sortie[]>("/sorties/").then((r) => r.data);
export const createSortie = (payload: {
  date_sortie: string;
  motif: string;
  details: { id_produit: number; quantite: number }[];
}) => api.post<Sortie>("/sorties/", payload).then((r) => r.data);

// ============ VENTES ============
export const getVentes = () => api.get<Vente[]>("/ventes/").then((r) => r.data);
export const createVente = (payload: {
  id_utilisateur: number;
  date_vente: string;
  details: { id_produit: number; quantite: number; prix: number }[];
}) => api.post<Vente>("/ventes/", payload).then((r) => r.data);
export const getStatistiquesVentes = () =>
  api.get<StatistiquesVentes>("/ventes/statistiques/resume").then((r) => r.data);

// ============ UTILISATEURS ============
export const getUtilisateurs = () => api.get<Utilisateur[]>("/utilisateurs/").then((r) => r.data);
export const createUtilisateur = (payload: { nom: string; mot_de_passe: string; role: string }) =>
  api.post<Utilisateur>("/utilisateurs/", payload).then((r) => r.data);
export const updateUtilisateur = (
  id: number,
  payload: { nom?: string; role?: string; mot_de_passe?: string }
) => api.put<Utilisateur>(`/utilisateurs/${id}`, payload).then((r) => r.data);
export const deleteUtilisateur = (id: number) => api.delete(`/utilisateurs/${id}`);
