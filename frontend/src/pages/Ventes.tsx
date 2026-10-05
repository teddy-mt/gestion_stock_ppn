import { useEffect, useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import { PageHeader, Modal, EmptyState } from "@/components/ui";
import { getVentes, getProduits, createVente } from "@/api/services";
import { useAuth } from "@/context/AuthContext";
import { Vente, Produit } from "@/types";

interface Ligne {
  id_produit: string;
  quantite: string;
  prix: string;
}

export default function Ventes() {
  const { utilisateur } = useAuth();
  const [items, setItems] = useState<Vente[]>([]);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");

  const [dateVente, setDateVente] = useState(new Date().toISOString().slice(0, 10));
  const [lignes, setLignes] = useState<Ligne[]>([{ id_produit: "", quantite: "", prix: "" }]);

  const load = () => {
    setLoading(true);
    getVentes()
      .then((data) => setItems(data.reverse()))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    getProduits().then(setProduits);
  }, []);

  const openCreate = () => {
    setDateVente(new Date().toISOString().slice(0, 10));
    setLignes([{ id_produit: "", quantite: "", prix: "" }]);
    setError("");
    setModalOpen(true);
  };

  const updateLigne = (idx: number, field: keyof Ligne, value: string) => {
    setLignes((prev) =>
      prev.map((l, i) => {
        if (i !== idx) return l;
        const updated = { ...l, [field]: value };
        if (field === "id_produit") {
          const produit = produits.find((p) => String(p.id_produit) === value);
          if (produit && !l.prix) updated.prix = String(produit.prix_vente);
        }
        return updated;
      })
    );
  };

  const addLigne = () => setLignes((prev) => [...prev, { id_produit: "", quantite: "", prix: "" }]);
  const removeLigne = (idx: number) =>
    setLignes((prev) => prev.filter((_, i) => i !== idx));

  const total = lignes.reduce(
    (sum, l) => sum + (Number(l.quantite) || 0) * (Number(l.prix) || 0),
    0
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!utilisateur) return;
    try {
      await createVente({
        id_utilisateur: utilisateur.id_utilisateur,
        date_vente: dateVente,
        details: lignes
          .filter((l) => l.id_produit && l.quantite && l.prix)
          .map((l) => ({
            id_produit: Number(l.id_produit),
            quantite: Number(l.quantite),
            prix: Number(l.prix),
          })),
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
        title="Ventes"
        action={
          <div className="flex gap-2">
            <Link to="/statistiques" className="btn-secondary">
              Voir les statistiques
            </Link>
            <button className="btn-primary" onClick={openCreate}>
              + Nouvelle vente
            </button>
          </div>
        }
      />

      <div className="card">
        {loading ? (
          <p className="px-5 py-8 text-sm text-muted">Chargement...</p>
        ) : items.length === 0 ? (
          <EmptyState message="Aucune vente enregistrée." />
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className="th-cell">Date</th>
                <th className="th-cell">Produits vendus</th>
                <th className="th-cell">Montant total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((v) => (
                <tr key={v.id_vente}>
                  <td className="td-cell font-mono text-muted">{v.date_vente}</td>
                  <td className="td-cell text-muted">
                    {v.details
                      .map((d) => `${d.produit?.designation ?? d.id_produit} ×${d.quantite}`)
                      .join(", ")}
                  </td>
                  <td className="td-cell font-mono font-semibold text-brand">
                    {Number(v.montant_total).toLocaleString("fr-FR")} Ar
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nouvelle vente">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Date</label>
            <input
              type="date"
              className="input-field"
              required
              value={dateVente}
              onChange={(e) => setDateVente(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Produits vendus</label>
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
                    className="input-field w-20"
                    required
                    value={ligne.quantite}
                    onChange={(e) => updateLigne(idx, "quantite", e.target.value)}
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Prix"
                    className="input-field w-28"
                    required
                    value={ligne.prix}
                    onChange={(e) => updateLigne(idx, "prix", e.target.value)}
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

          <div className="flex items-center justify-between px-3 py-2.5 bg-brand-light rounded-md">
            <span className="text-sm font-medium text-brand-dark">Total</span>
            <span className="font-mono font-semibold text-brand-dark">
              {total.toLocaleString("fr-FR")} Ar
            </span>
          </div>

          {error && (
            <p className="text-sm text-brick bg-brick-light px-3 py-2 rounded-md">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
              Annuler
            </button>
            <button type="submit" className="btn-primary">
              Enregistrer la vente
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
