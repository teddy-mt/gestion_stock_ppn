import { useEffect, useState, FormEvent } from "react";
import { PageHeader, Modal, EmptyState } from "@/components/ui";
import { getSorties, getProduits, createSortie } from "@/api/services";
import { Sortie, Produit } from "@/types";

interface Ligne {
  id_produit: string;
  quantite: string;
}

export default function Sorties() {
  const [items, setItems] = useState<Sortie[]>([]);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");

  const [dateSortie, setDateSortie] = useState(new Date().toISOString().slice(0, 10));
  const [motif, setMotif] = useState("");
  const [lignes, setLignes] = useState<Ligne[]>([{ id_produit: "", quantite: "" }]);

  const load = () => {
    setLoading(true);
    getSorties()
      .then((data) => setItems(data.reverse()))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    getProduits().then(setProduits);
  }, []);

  const openCreate = () => {
    setDateSortie(new Date().toISOString().slice(0, 10));
    setMotif("");
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
      await createSortie({
        date_sortie: dateSortie,
        motif,
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
        title="Sorties"
        action={
          <button className="btn-primary" onClick={openCreate}>
            + Nouvelle sortie
          </button>
        }
      />

      <div className="card">
        {loading ? (
          <p className="px-5 py-8 text-sm text-muted">Chargement...</p>
        ) : items.length === 0 ? (
          <EmptyState message="Aucune sortie enregistrée." />
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className="th-cell">Date</th>
                <th className="th-cell">Motif</th>
                <th className="th-cell">Produits sortis</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id_sortie}>
                  <td className="td-cell font-mono text-muted">{s.date_sortie}</td>
                  <td className="td-cell font-medium">{s.motif}</td>
                  <td className="td-cell text-muted">
                    {s.details
                      .map((d) => `${d.produit?.designation ?? d.id_produit} (−${d.quantite})`)
                      .join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nouvelle sortie">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Date</label>
              <input
                type="date"
                className="input-field"
                required
                value={dateSortie}
                onChange={(e) => setDateSortie(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Motif</label>
              <input
                className="input-field"
                required
                placeholder="ex: casse, péremption..."
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              Produits sortis
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
                        {p.designation} (stock: {p.quantite_stock})
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
              Enregistrer la sortie
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
