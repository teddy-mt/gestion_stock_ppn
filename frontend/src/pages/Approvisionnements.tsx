import { useEffect, useState, FormEvent } from "react";
import { PageHeader, Modal, EmptyState } from "@/components/ui";
import {
  getApprovisionnements,
  getFournisseurs,
  getProduits,
  createApprovisionnement,
} from "@/api/services";
import { Approvisionnement, Fournisseur, Produit } from "@/types";

interface Ligne {
  id_produit: string;
  quantite: string;
}

export default function Approvisionnements() {
  const [items, setItems] = useState<Approvisionnement[]>([]);
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");

  const [dateEntree, setDateEntree] = useState(new Date().toISOString().slice(0, 10));
  const [idFournisseur, setIdFournisseur] = useState("");
  const [lignes, setLignes] = useState<Ligne[]>([{ id_produit: "", quantite: "" }]);

  const load = () => {
    setLoading(true);
    getApprovisionnements()
      .then((data) => setItems(data.reverse()))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    getFournisseurs().then(setFournisseurs);
    getProduits().then(setProduits);
  }, []);

  const openCreate = () => {
    setDateEntree(new Date().toISOString().slice(0, 10));
    setIdFournisseur("");
    setLignes([{ id_produit: "", quantite: "" }]);
    setError("");
    setModalOpen(true);
  };

  const updateLigne = (idx: number, field: keyof Ligne, value: string) => {
    setLignes((prev) => prev.map((l, i) => (i === idx ? { ...l, [field]: value } : l)));
  };

  const addLigne = () => setLignes((prev) => [...prev, { id_produit: "", quantite: "" }]);
  const removeLigne = (idx: number) =>
    setLignes((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await createApprovisionnement({
        date_entree: dateEntree,
        id_fournisseur: Number(idFournisseur),
        details: lignes
          .filter((l) => l.id_produit && l.quantite)
          .map((l) => ({ id_produit: Number(l.id_produit), quantite: Number(l.quantite) })),
      });
      setModalOpen(false);
      load();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Une erreur est survenue");
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Mouvements de stock"
        title="Approvisionnements"
        action={
          <button className="btn-primary" onClick={openCreate}>
            + Nouvel approvisionnement
          </button>
        }
      />

      <div className="card">
        {loading ? (
          <p className="px-5 py-8 text-sm text-muted">Chargement...</p>
        ) : items.length === 0 ? (
          <EmptyState message="Aucun approvisionnement enregistré." />
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className="th-cell">Date</th>
                <th className="th-cell">Fournisseur</th>
                <th className="th-cell">Produits reçus</th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id_approvisionnement}>
                  <td className="td-cell font-mono text-muted">{a.date_entree}</td>
                  <td className="td-cell font-medium">{a.fournisseur?.nom ?? "—"}</td>
                  <td className="td-cell text-muted">
                    {a.details
                      .map((d) => `${d.produit?.designation ?? d.id_produit} (+${d.quantite})`)
                      .join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nouvel approvisionnement">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Date</label>
              <input
                type="date"
                className="input-field"
                required
                value={dateEntree}
                onChange={(e) => setDateEntree(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Fournisseur</label>
              <select
                className="input-field"
                required
                value={idFournisseur}
                onChange={(e) => setIdFournisseur(e.target.value)}
              >
                <option value="">Choisir...</option>
                {fournisseurs.map((f) => (
                  <option key={f.id_fournisseur} value={f.id_fournisseur}>
                    {f.nom}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              Produits reçus
            </label>
            <div className="space-y-2">
              {lignes.map((ligne, idx) => (
                <div key={idx} className="flex gap-2">
                  <select
                    className="input-field flex-1"
                    required
                    value={ligne.id_produit}
                    onChange={(e) => updateLigne(idx, "id_produit", e.target.value)}
                  >
                    <option value="">Produit...</option>
                    {produits.map((p) => (
                      <option key={p.id_produit} value={p.id_produit}>
                        {p.designation}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    placeholder="Qté"
                    className="input-field w-24"
                    required
                    value={ligne.quantite}
                    onChange={(e) => updateLigne(idx, "quantite", e.target.value)}
                  />
                  {lignes.length > 1 && (
                    <button
                      type="button"
                      className="text-brick text-sm px-2"
                      onClick={() => removeLigne(idx)}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addLigne}
              className="text-brand text-sm font-medium mt-2 hover:underline"
            >
              + Ajouter une ligne
            </button>
          </div>

          {error && (
            <p className="text-sm text-brick bg-brick-light px-3 py-2 rounded-md">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
              Annuler
            </button>
            <button type="submit" className="btn-primary">
              Enregistrer l'entrée
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
