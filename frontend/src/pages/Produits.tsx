import { useEffect, useState, FormEvent } from "react";
import { PageHeader, Modal, EmptyState } from "@/components/ui";
import { StockGauge } from "@/components/StockGauge";
import {
  getProduits,
  getCategories,
  createProduit,
  updateProduit,
  deleteProduit,
} from "@/api/services";
import { Produit, Categorie } from "@/types";

const EMPTY_FORM = {
  code: "",
  designation: "",
  prix_achat: "",
  prix_vente: "",
  stock_minimum: "0",
  quantite_stock: "0",
  id_categorie: "",
};

export default function Produits() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filtreCategorie, setFiltreCategorie] = useState("");
  const [stockBasOnly, setStockBasOnly] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Produit | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    getProduits({
      q: search || undefined,
      id_categorie: filtreCategorie ? Number(filtreCategorie) : undefined,
      stock_bas: stockBasOnly || undefined,
    })
      .then(setProduits)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(load, 250);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filtreCategorie, stockBasOnly]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (p: Produit) => {
    setEditing(p);
    setForm({
      code: p.code,
      designation: p.designation,
      prix_achat: String(p.prix_achat),
      prix_vente: String(p.prix_vente),
      stock_minimum: String(p.stock_minimum),
      quantite_stock: String(p.quantite_stock),
      id_categorie: String(p.id_categorie),
    });
    setError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const payload = {
      code: form.code,
      designation: form.designation,
      prix_achat: Number(form.prix_achat),
      prix_vente: Number(form.prix_vente),
      stock_minimum: Number(form.stock_minimum),
      quantite_stock: Number(form.quantite_stock),
      id_categorie: Number(form.id_categorie),
    };
    try {
      if (editing) {
        await updateProduit(editing.id_produit, payload);
      } else {
        await createProduit(payload);
      }
      setModalOpen(false);
      load();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Une erreur est survenue");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer ce produit ?")) return;
    await deleteProduit(id);
    load();
  };

  return (
    <div>
      <PageHeader
        eyebrow="Référentiel"
        title="Produits"
        action={
          <button className="btn-primary" onClick={openCreate}>
            + Nouveau produit
          </button>
        }
      />

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          className="input-field max-w-xs"
          placeholder="Rechercher par code ou désignation..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input-field max-w-[200px]"
          value={filtreCategorie}
          onChange={(e) => setFiltreCategorie(e.target.value)}
        >
          <option value="">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c.id_categorie} value={c.id_categorie}>
              {c.nom}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-muted px-1">
          <input
            type="checkbox"
            checked={stockBasOnly}
            onChange={(e) => setStockBasOnly(e.target.checked)}
          />
          Stock bas uniquement
        </label>
      </div>

      <div className="card">
        {loading ? (
          <p className="px-5 py-8 text-sm text-muted">Chargement...</p>
        ) : produits.length === 0 ? (
          <EmptyState message="Aucun produit ne correspond à ces critères." />
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className="th-cell">Code</th>
                <th className="th-cell">Désignation</th>
                <th className="th-cell">Catégorie</th>
                <th className="th-cell">Prix achat</th>
                <th className="th-cell">Prix vente</th>
                <th className="th-cell">Stock</th>
                <th className="th-cell w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {produits.map((p) => (
                <tr key={p.id_produit}>
                  <td className="td-cell font-mono text-muted">{p.code}</td>
                  <td className="td-cell font-medium">{p.designation}</td>
                  <td className="td-cell text-muted">{p.categorie?.nom ?? "—"}</td>
                  <td className="td-cell font-mono">
                    {Number(p.prix_achat).toLocaleString("fr-FR")} Ar
                  </td>
                  <td className="td-cell font-mono">
                    {Number(p.prix_vente).toLocaleString("fr-FR")} Ar
                  </td>
                  <td className="td-cell">
                    <StockGauge quantite={p.quantite_stock} minimum={p.stock_minimum} />
                  </td>
                  <td className="td-cell">
                    <button
                      className="text-brand hover:underline text-sm mr-3"
                      onClick={() => openEdit(p)}
                    >
                      Modifier
                    </button>
                    <button
                      className="text-brick hover:underline text-sm"
                      onClick={() => handleDelete(p.id_produit)}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Modifier le produit" : "Nouveau produit"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Code</label>
              <input
                className="input-field"
                required
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Catégorie</label>
              <select
                className="input-field"
                required
                value={form.id_categorie}
                onChange={(e) => setForm({ ...form, id_categorie: e.target.value })}
              >
                <option value="">Choisir...</option>
                {categories.map((c) => (
                  <option key={c.id_categorie} value={c.id_categorie}>
                    {c.nom}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Désignation</label>
            <input
              className="input-field"
              required
              value={form.designation}
              onChange={(e) => setForm({ ...form, designation: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Prix d'achat</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="input-field"
                required
                value={form.prix_achat}
                onChange={(e) => setForm({ ...form, prix_achat: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Prix de vente</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="input-field"
                required
                value={form.prix_vente}
                onChange={(e) => setForm({ ...form, prix_vente: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">
                Stock minimum
              </label>
              <input
                type="number"
                min="0"
                className="input-field"
                value={form.stock_minimum}
                onChange={(e) => setForm({ ...form, stock_minimum: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">
                Quantité en stock
              </label>
              <input
                type="number"
                min="0"
                className="input-field"
                value={form.quantite_stock}
                onChange={(e) => setForm({ ...form, quantite_stock: e.target.value })}
                disabled={!!editing}
                title={editing ? "Le stock se met à jour via les approvisionnements et sorties" : ""}
              />
            </div>
          </div>
          {editing && (
            <p className="text-xs text-muted -mt-2">
              Pour ajuster le stock, utilise un approvisionnement ou une sortie.
            </p>
          )}

          {error && (
            <p className="text-sm text-brick bg-brick-light px-3 py-2 rounded-md">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
              Annuler
            </button>
            <button type="submit" className="btn-primary">
              Enregistrer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
