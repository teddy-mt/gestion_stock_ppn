import { useEffect, useState, FormEvent } from "react";
import { PageHeader, Modal, EmptyState } from "@/components/ui";
import {
  getFournisseurs,
  createFournisseur,
  updateFournisseur,
  deleteFournisseur,
} from "@/api/services";
import { Fournisseur } from "@/types";

const EMPTY_FORM = { nom: "", adresse: "", telephone: "", email: "" };

export default function Fournisseurs() {
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Fournisseur | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    getFournisseurs()
      .then(setFournisseurs)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (f: Fournisseur) => {
    setEditing(f);
    setForm({
      nom: f.nom,
      adresse: f.adresse || "",
      telephone: f.telephone || "",
      email: f.email || "",
    });
    setError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (editing) {
        await updateFournisseur(editing.id_fournisseur, form);
      } else {
        await createFournisseur(form);
      }
      setModalOpen(false);
      load();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Une erreur est survenue");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer ce fournisseur ?")) return;
    await deleteFournisseur(id);
    load();
  };

  return (
    <div>
      <PageHeader
        eyebrow="Référentiel"
        title="Fournisseurs"
        action={
          <button className="btn-primary" onClick={openCreate}>
            + Nouveau fournisseur
          </button>
        }
      />

      <div className="card">
        {loading ? (
          <p className="px-5 py-8 text-sm text-muted">Chargement...</p>
        ) : fournisseurs.length === 0 ? (
          <EmptyState message="Aucun fournisseur pour le moment." />
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className="th-cell">Nom</th>
                <th className="th-cell">Téléphone</th>
                <th className="th-cell">Email</th>
                <th className="th-cell">Adresse</th>
                <th className="th-cell w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {fournisseurs.map((f) => (
                <tr key={f.id_fournisseur}>
                  <td className="td-cell font-medium">{f.nom}</td>
                  <td className="td-cell text-muted">{f.telephone || "—"}</td>
                  <td className="td-cell text-muted">{f.email || "—"}</td>
                  <td className="td-cell text-muted">{f.adresse || "—"}</td>
                  <td className="td-cell">
                    <button
                      className="text-brand hover:underline text-sm mr-3"
                      onClick={() => openEdit(f)}
                    >
                      Modifier
                    </button>
                    <button
                      className="text-brick hover:underline text-sm"
                      onClick={() => handleDelete(f.id_fournisseur)}
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
        title={editing ? "Modifier le fournisseur" : "Nouveau fournisseur"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Nom</label>
            <input
              className="input-field"
              required
              autoFocus
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Téléphone</label>
            <input
              className="input-field"
              value={form.telephone}
              onChange={(e) => setForm({ ...form, telephone: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Email</label>
            <input
              type="email"
              className="input-field"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Adresse</label>
            <input
              className="input-field"
              value={form.adresse}
              onChange={(e) => setForm({ ...form, adresse: e.target.value })}
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
