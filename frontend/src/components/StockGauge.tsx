interface StockGaugeProps {
  quantite: number;
  minimum: number;
}

export function StockGauge({ quantite, minimum }: StockGaugeProps) {
  const seuil = Math.max(minimum, 1);
  const ratio = Math.min(quantite / (seuil * 2), 1);
  const isBas = quantite <= minimum;

  return (
    <div className="flex items-center gap-2.5">
      <div className="w-16 h-1.5 bg-black/[0.06] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${isBas ? "bg-ochre" : "bg-brand"}`}
          style={{ width: `${Math.max(ratio * 100, 4)}%` }}
        />
      </div>
      <span className={`font-mono text-sm ${isBas ? "text-ochre font-semibold" : "text-ink"}`}>
        {quantite}
      </span>
      {isBas && <span className="tag bg-ochre-light text-ochre">Bas</span>}
    </div>
  );
}
