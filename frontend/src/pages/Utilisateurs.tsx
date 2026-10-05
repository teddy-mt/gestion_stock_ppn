import { useEffect, useState, FormEvent } from "react";
import { PageHeader, Modal, EmptyState } from "@/components/ui";
import {
  getUtilisateurs,
  createUtilisateur,
  updateUtilisateur,
  deleteUtilisateur,
} from "@/api/services";
import { useAuth } from "@/context/AuthContext";
import { Utilisateur, Role } from "@/types";

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrateur",
  GESTIONNAIRE: "Gestionnaire",
  CAISSIER: "Caissier",
};

export default function Utilisateurs() {
  const { utilisateur: moi } = useAuth();
  const [items, setItems] = useState<Utilisateur[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Utilisateur | null>(null);
  const [error, setError] = useState("");

  const [nom, setNom] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [role, setRole] = useState<Role>("GESTIONNAIRE");

  const load = () => {
    setLoading(true);
    getUtilisateurs()
      .then(setItems)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditing(null);
    setNom("");
    setMotDePasse("");
    setRole("GESTIONNAIRE");
    setError("");
    setModalOpen(true);
  };

  const openEdit = (u: Utilisateur) => {
    setEditing(u);
    setNom(u.nom);
    setMotDePasse("");
    setRole(u.role);
    setError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (editing) {
        await updateUtilisateur(editing.id_utilisateur, {
          nom,
          role,
          ...(motDePasse ? { mot_de_passe: motDePasse } : {}),
        });
      } else {
        await createUtilisateur({ nom, mot_de_passe: motDePasse, role });
      }
      setModalOpen(false);
      load();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Une erreur est survenue");
    }
  };

  const handleDelete = async (u: Utilisateur) => {
    if (!confirm(`Supprimer l'utilisateur "${u.nom}" ?`)) return;
    try {
      await deleteUtilisateur(u.id_utilisateur);
      load();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Suppression impossible");
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Administration"
        title="Utilisateurs"
        action={
          <button className="btn-primary" onClick={openCreate}>
            + Nouvel utilisateur
          </button>
        }
      />

      <div className="card">
        {loading ? (
          <p className="px-5 py-8 text-sm text-muted">Chargement...</p>
        ) : items.length === 0 ? (
          <EmptyState message="Aucun utilisateur." />
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className="th-cell">Nom</th>
                <th className="th-cell">Rôle</th>
                <th className="th-cell w-40">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((u) => (
                <tr key={u.id_utilisateur}>
                  <td className="td-cell font-medium">
                    {u.nom}
                    {moi?.id_utilisateur === u.id_utilisateur && (
                      <span className="tag bg-black/5 text-muted ml-2">Toi</span>
                    )}
                  </td>
                  <td className="td-cell">
                    <span className="tag bg-brand-light text-brand-dark">
                      {ROLE_LABELS[u.role]}
                    </span>
                  </td>
                  <td className="td-cell">
                    <button
                      className="text-brand hover:underline text-sm mr-3"
                      onClick={() => openEdit(u)}
                    >
                      Modifier
                    </button>
                    {moi?.id_utilisateur !== u.id_utilisateur && (
                      <button
                        className="text-brick hover:underline text-sm"
                        onClick={() => handleDelete(u)}
                      >
                        Supprimer
                      </button>
                    )}
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
        title={editing ? `Modifier ${editing.nom}` : "Nouvel utilisateur"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              Nom d'utilisateur
            </label>
            <input
              className="input-field"
              required
              autoFocus
              value={nom}
              onChange={(e) => setNom(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              {editing ? "Nouveau mot de passe (laisser vide pour ne pas changer)" : "Mot de passe"}
            </label>
            <input
              type="password"
              className="input-field"
              required={!editing}
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              placeholder={editing ? "••••••••" : ""}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Rôle</label>
            <select
              className="input-field"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              disabled={editing?.id_utilisateur === moi?.id_utilisateur}
            >
              <option value="ADMIN">Administrateur</option>
              <option value="GESTIONNAIRE">Gestionnaire</option>
              <option value="CAISSIER">Caissier</option>
            </select>
            {editing?.id_utilisateur === moi?.id_utilisateur && (
              <p className="text-xs text-muted mt-1">
                Tu ne peux pas changer ton propre rôle.
              </p>
            )}
          </div>

          {error && (
            <p className="text-sm text-brick bg-brick-light px-3 py-2 rounded-md">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
              Annuler
            </button>
            <button type="submit" className="btn-primary">
              {editing ? "Enregistrer" : "Créer"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
