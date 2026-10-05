import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const NAV_ITEMS = [
  { to: "/", label: "Tableau de bord", roles: ["ADMIN", "GESTIONNAIRE", "CAISSIER"] },
  { to: "/produits", label: "Produits", roles: ["ADMIN", "GESTIONNAIRE", "CAISSIER"] },
  { to: "/categories", label: "Catégories", roles: ["ADMIN", "GESTIONNAIRE"] },
  { to: "/fournisseurs", label: "Fournisseurs", roles: ["ADMIN", "GESTIONNAIRE"] },
  { to: "/approvisionnements", label: "Approvisionnements", roles: ["ADMIN", "GESTIONNAIRE"] },
  { to: "/sorties", label: "Sorties", roles: ["ADMIN", "GESTIONNAIRE"] },
  { to: "/ventes", label: "Ventes", roles: ["ADMIN", "GESTIONNAIRE", "CAISSIER"] },
  { to: "/statistiques", label: "Statistiques", roles: ["ADMIN", "GESTIONNAIRE", "CAISSIER"] },
  { to: "/utilisateurs", label: "Utilisateurs", roles: ["ADMIN"] },
];

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrateur",
  GESTIONNAIRE: "Gestionnaire",
  CAISSIER: "Caissier",
};

export function Layout() {
  const { utilisateur, logout } = useAuth();

  const visibleItems = NAV_ITEMS.filter((item) =>
    utilisateur ? item.roles.includes(utilisateur.role) : false
  );

  return (
    <div className="min-h-screen flex bg-paper">
      <aside className="w-64 shrink-0 bg-ledger-950 text-white flex flex-col relative">
        <div className="absolute left-6 top-0 bottom-0 w-px bg-white/[0.06]" aria-hidden="true" />
        <div className="px-6 pt-7 pb-6">
          <div className="flex items-center gap-2">
            <span className="text-ochre font-display font-bold text-lg">#</span>
            <h1 className="font-display font-semibold text-[15px] tracking-tight leading-tight">
              Gestion Stock
              <span className="block text-white/50 text-[11px] font-body font-normal tracking-tag uppercase">
                Registre PPN
              </span>
            </h1>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {visibleItems.map((item, idx) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                  isActive
                    ? "bg-white/10 text-white font-medium"
                    : "text-white/60 hover:text-white hover:bg-white/[0.06]"
                }`
              }
            >
              <span className="font-mono text-[10px] text-white/30 w-4 shrink-0">
                {String(idx + 1).padStart(2, "0")}
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-5 pt-3 border-t border-white/[0.08] mx-3">
          <div className="px-3 py-2">
            <p className="text-sm font-medium truncate">{utilisateur?.nom}</p>
            <p className="text-[11px] uppercase tracking-tag text-white/40">
              {utilisateur ? ROLE_LABELS[utilisateur.role] : ""}
            </p>
          </div>
          <button
            onClick={logout}
            className="w-full mt-1 text-left px-3 py-2 text-sm text-white/60 hover:text-white hover:bg-white/[0.06] rounded-md transition-colors"
          >
            Déconnexion
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
