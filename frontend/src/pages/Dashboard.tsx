import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/ui";
import { StockGauge } from "@/components/StockGauge";
import { getProduits, getVentes } from "@/api/services";
import { Produit, Vente } from "@/types";

export default function Dashboard() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [ventes, setVentes] = useState<Vente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProduits(), getVentes()])
      .then(([p, v]) => {
        setProduits(p);
        setVentes(v);
      })
      .finally(() => setLoading(false));
  }, []);

  const stockBas = produits.filter((p) => p.quantite_stock <= p.stock_minimum);
  const valeurStock = produits.reduce(
    (sum, p) => sum + p.quantite_stock * Number(p.prix_achat),
    0
  );
  const chiffreAffaires = ventes.reduce((sum, v) => sum + Number(v.montant_total), 0);

  return (
    <div>
      <PageHeader eyebrow="Vue d'ensemble" title="Tableau de bord" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Produits référencés" value={produits.length} />
        <StatCard
          label="Valeur du stock"
          value={`${valeurStock.toLocaleString("fr-FR")} Ar`}
        />
        <StatCard
          label="Chiffre d'affaires"
          value={`${chiffreAffaires.toLocaleString("fr-FR")} Ar`}
          accent
        />
      </div>

      <div className="card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.06]">
          <div>
            <h2 className="font-display font-semibold">Alertes stock bas</h2>
            <p className="text-xs text-muted mt-0.5">
              Produits sous ou égaux au seuil minimum
            </p>
          </div>
          <Link to="/produits" className="text-sm text-brand font-medium hover:underline">
            Voir tous les produits →
          </Link>
        </div>

        {loading ? (
          <p className="px-5 py-8 text-sm text-muted">Chargement...</p>
        ) : stockBas.length === 0 ? (
          <p className="px-5 py-8 text-sm text-muted">
            Aucune alerte — tous les stocks sont au-dessus du seuil minimum.
          </p>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className="th-cell">Produit</th>
                <th className="th-cell">Catégorie</th>
                <th className="th-cell">Stock</th>
                <th className="th-cell">Seuil min.</th>
              </tr>
            </thead>
            <tbody>
              {stockBas.map((p) => (
                <tr key={p.id_produit}>
                  <td className="td-cell font-medium">{p.designation}</td>
                  <td className="td-cell text-muted">{p.categorie?.nom ?? "—"}</td>
                  <td className="td-cell">
                    <StockGauge quantite={p.quantite_stock} minimum={p.stock_minimum} />
                  </td>
                  <td className="td-cell font-mono text-muted">{p.stock_minimum}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className="card p-5">
      <p className="text-[11px] font-semibold uppercase tracking-tag text-muted mb-2">
        {label}
      </p>
      <p className={`font-display text-2xl font-semibold ${accent ? "text-brand" : "text-ink"}`}>
        {value}
      </p>
    </div>
  );
}
