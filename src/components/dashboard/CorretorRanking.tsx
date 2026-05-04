import { cn } from "@/lib/utils";

interface CorretorRow {
  nome: string;
  leads: number;
  conversoes: number;
  taxa: number;
}

interface CorretorRankingProps {
  data: CorretorRow[];
}

export function CorretorRanking({ data }: CorretorRankingProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-xs text-dd-on-muted">Sem dados de corretores</p>
      </div>
    );
  }

  const maxLeads = Math.max(...data.map((d) => d.leads), 1);

  return (
    <div className="space-y-2">
      {data.map((row, i) => (
        <div
          key={row.nome}
          className="flex items-center gap-3 rounded-md px-3 py-2.5 hover:bg-dd-surface-overlay/30 transition-colors"
        >
          <span className="flex-shrink-0 w-5 text-[11px] text-dd-on-muted/60 text-right font-medium">
            {i + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] text-dd-on-primary truncate">
              {row.nome}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <div className="h-1.5 flex-1 rounded-full bg-dd-surface-overlay overflow-hidden">
                <div
                  className="h-full rounded-full bg-dd-accent-blue transition-all duration-500"
                  style={{ width: `${(row.leads / maxLeads) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-dd-on-muted w-8 text-right">
                {row.leads}
              </span>
            </div>
          </div>
          <div className="flex-shrink-0 text-right space-y-0.5">
            <p className="text-xs font-medium text-dd-on-primary">
              {row.conversoes}
            </p>
            <p
              className={cn(
                "text-[10px]",
                row.taxa >= 20
                  ? "text-dd-accent-green"
                  : row.taxa >= 10
                    ? "text-dd-accent-orange"
                    : "text-dd-on-muted/60",
              )}
            >
              {row.taxa.toFixed(1)}%
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
