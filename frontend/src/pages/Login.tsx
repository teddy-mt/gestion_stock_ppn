import { useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [nom, setNom] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(nom, motDePasse);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Nom d'utilisateur ou mot de passe incorrect"
      );
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
            Gestion de Stock
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
              placeholder="ex: admin"
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

          {error && (
            <p className="text-sm text-brick bg-brick-light px-3 py-2 rounded-md">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Connexion..." : "Se connecter"}
          </button>

          <p className="text-center text-sm text-muted pt-1">
            Pas encore de compte ?{" "}
            <Link to="/register" className="text-brand font-medium hover:underline">
              Créer un compte
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
