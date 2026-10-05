import { useEffect, useState, FormEvent } from "react";
import { PageHeader, Modal, EmptyState } from "@/components/ui";
import { getCategories, createCategorie, updateCategorie, deleteCategorie } from "@/api/services";
import { Categorie } from "@/types";

export default function Categories() {
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Categorie | null>(null);
  const [nom, setNom] = useState("");
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    getCategories()
      .then(setCategories)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditing(null);
    setNom("");
    setError("");
    setModalOpen(true);
  };

  const openEdit = (cat: Categorie) => {
    setEditing(cat);
    setNom(cat.nom);
    setError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (editing) {
        await updateCategorie(editing.id_categorie, nom);
      } else {
        await createCategorie(nom);
      }
      setModalOpen(false);
      load();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Une erreur est survenue");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cette catégorie ? Les produits associés seront aussi supprimés.")) return;
    await deleteCategorie(id);
    load();
  };

  return (
    <div>
      <PageHeader
        eyebrow="Référentiel"
        title="Catégories"
        action={
          <button className="btn-primary" onClick={openCreate}>
            + Nouvelle catégorie
          </button>
        }
      />

      <div className="card">
        {loading ? (
          <p className="px-5 py-8 text-sm text-muted">Chargement...</p>
        ) : categories.length === 0 ? (
          <EmptyState message="Aucune catégorie pour le moment. Crée la première." />
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className="th-cell">Nom</th>
                <th className="th-cell w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id_categorie}>
                  <td className="td-cell font-medium">{cat.nom}</td>
                  <td className="td-cell">
                    <button
                      className="text-brand hover:underline text-sm mr-3"
                      onClick={() => openEdit(cat)}
                    >
                      Modifier
                    </button>
                    <button
                      className="text-brick hover:underline text-sm"
                      onClick={() => handleDelete(cat.id_categorie)}
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
        title={editing ? "Modifier la catégorie" : "Nouvelle catégorie"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Nom</label>
            <input
              className="input-field"
              required
              autoFocus
              value={nom}
              onChange={(e) => setNom(e.target.value)}
            />
          </div>
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
