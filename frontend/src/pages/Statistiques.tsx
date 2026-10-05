import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import { PageHeader, EmptyState } from "@/components/ui";
import { getStatistiquesVentes } from "@/api/services";
import { StatistiquesVentes } from "@/types";

const formatAr = (n: number) => `${n.toLocaleString("fr-FR")} Ar`;

const formatDateCourte = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
};

export default function Statistiques() {
  const [stats, setStats] = useState<StatistiquesVentes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getStatistiquesVentes()
      .then(setStats)
      .catch((err) => setError(err.response?.data?.detail || "Impossible de charger les statistiques"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <PageHeader eyebrow="Analyse" title="Statistiques de vente" />
        <p className="text-sm text-muted">Chargement...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div>
        <PageHeader eyebrow="Analyse" title="Statistiques de vente" />
        <div className="card">
          <EmptyState message={error || "Aucune donnée disponible."} />
        </div>
      </div>
    );
  }

  const chartData = stats.ventes_par_jour.map((v) => ({
    ...v,
    label: formatDateCourte(v.date),
  }));

  return (
    <div>
      <PageHeader eyebrow="Analyse" title="Statistiques de vente" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Nombre de ventes" value={stats.nombre_ventes} />
        <StatCard
          label="Chiffre d'affaires total"
          value={formatAr(stats.chiffre_affaires_total)}
          accent
        />
        <StatCard label="Panier moyen" value={formatAr(stats.panier_moyen)} />
      </div>

      <div className="card p-5 mb-6">
        <h2 className="font-display font-semibold mb-1">Chiffre d'affaires par jour</h2>
        <p className="text-xs text-muted mb-4">Montant total des ventes, jour par jour</p>

        {chartData.length === 0 ? (
          <EmptyState message="Aucune vente enregistrée pour le moment." />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#1C232111" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "#5B6664" }}
                axisLine={{ stroke: "#1C232122" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#5B6664" }}
                axisLine={false}
                tickLine={false}
                width={60}
              />
              <Tooltip
                formatter={(value: number) => formatAr(value)}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid #1C232114",
                  fontFamily: "Inter, sans-serif",
                }}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#0F5D52"
                strokeWidth={2}
                dot={{ r: 3, fill: "#0F5D52" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="card p-5">
        <h2 className="font-display font-semibold mb-1">Produits les plus vendus</h2>
        <p className="text-xs text-muted mb-4">Top 5 par montant total généré</p>

        {stats.top_produits.length === 0 ? (
          <EmptyState message="Aucune vente enregistrée pour le moment." />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={stats.top_produits}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 10, bottom: 0 }}
            >
              <CartesianGrid stroke="#1C232111" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "#5B6664" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="produit"
                tick={{ fontSize: 12, fill: "#1C2321" }}
                axisLine={false}
                tickLine={false}
                width={140}
              />
              <Tooltip
                formatter={(value: number) => formatAr(value)}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid #1C232114",
                  fontFamily: "Inter, sans-serif",
                }}
              />
              <Bar dataKey="montant" fill="#C97A2B" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
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
