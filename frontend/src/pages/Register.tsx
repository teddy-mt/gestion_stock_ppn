import { useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const [nom, setNom] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (motDePasse !== confirmation) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    if (motDePasse.length < 4) {
      setError("Le mot de passe doit contenir au moins 4 caractères");
      return;
    }

    setLoading(true);
    try {
      await register(nom, motDePasse);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Impossible de créer le compte");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ledger-950 flex items-center justify-center px-4 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 39px, #fff 39px, #fff 40px)",
        }}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-ochre font-display font-bold text-3xl">#</span>
          <h1 className="font-display text-2xl font-semibold text-white mt-2">
            Créer un compte
          </h1>
          <p className="text-white/40 text-[11px] uppercase tracking-tag mt-1">
            Registre PPN
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              Nom d'utilisateur
            </label>
            <input
              type="text"
              required
              autoFocus
              className="input-field"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="ex: rakoto"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              Mot de passe
            </label>
            <input
              type="password"
              required
              className="input-field"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              required
              className="input-field"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-brick bg-brick-light px-3 py-2 rounded-md">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Création..." : "Créer mon compte"}
          </button>

          <p className="text-center text-sm text-muted pt-1">
            Déjà un compte ?{" "}
            <Link to="/login" className="text-brand font-medium hover:underline">
              Se connecter
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
