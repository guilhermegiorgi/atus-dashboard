import { cn } from "@/lib/utils";

interface FunnelStep {
  label: string;
  value: number;
  color: string;
}

interface FunnelChartProps {
  steps: FunnelStep[];
}

export function FunnelChart({ steps }: FunnelChartProps) {
  const max = Math.max(...steps.map((s) => s.value), 1);

  return (
    <div className="space-y-3">
      {steps.map((step, i) => {
        const width = Math.max(20, (step.value / max) * 100);
        const dropRate =
          i > 0 && steps[i - 1].value > 0
            ? Math.round(
                ((steps[i - 1].value - step.value) / steps[i - 1].value) * 100,
              )
            : null;

        return (
          <div key={step.label} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-dd-on-muted font-medium">
                {step.label}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-dd-on-primary">
                  {step.value}
                </span>
                {dropRate !== null && dropRate > 0 && (
                  <span className="text-[10px] text-dd-accent-red/70">
                    -{dropRate}%
                  </span>
                )}
              </div>
            </div>
            <div className="h-6 w-full rounded bg-dd-surface-overlay overflow-hidden">
              <div
                className={cn(
                  "h-full rounded transition-all duration-700",
                  step.color,
                )}
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
