import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  color?: "green" | "blue" | "orange" | "red" | "purple";
  target?: number;
  current?: number;
}

const colorMap = {
  green: {
    bg: "bg-dd-accent-green/10",
    text: "text-dd-accent-green",
    bar: "bg-dd-accent-green",
  },
  blue: {
    bg: "bg-dd-accent-blue/10",
    text: "text-dd-accent-blue",
    bar: "bg-dd-accent-blue",
  },
  orange: {
    bg: "bg-dd-accent-orange/10",
    text: "text-dd-accent-orange",
    bar: "bg-dd-accent-orange",
  },
  red: {
    bg: "bg-dd-accent-red/10",
    text: "text-dd-accent-red",
    bar: "bg-dd-accent-red",
  },
  purple: {
    bg: "bg-dd-accent-purple/10",
    text: "text-dd-accent-purple",
    bar: "bg-dd-accent-purple",
  },
};

export function KpiCard({
  title,
  value,
  description,
  icon: Icon,
  color = "green",
  target,
  current,
}: KpiCardProps) {
  const c = colorMap[color];
  const progress =
    target && current
      ? Math.min(100, Math.round((current / target) * 100))
      : null;

  return (
    <div className="rounded-lg border border-dd-border-subtle bg-dd-surface-raised p-4 transition-colors hover:border-dd-border-subtle/80">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-wider text-dd-on-muted font-medium">
            {title}
          </p>
          <p className="text-2xl font-semibold text-dd-on-primary tracking-tight">
            {value}
          </p>
        </div>
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg",
            c.bg,
          )}
        >
          <Icon className={cn("h-4 w-4", c.text)} />
        </div>
      </div>

      {description && (
        <p className="text-[11px] text-dd-on-muted/60 mt-2">{description}</p>
      )}

      {progress !== null && (
        <div className="mt-3 space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-dd-on-muted">Meta</span>
            <span className={c.text}>{progress}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-dd-surface-overlay overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                c.bar,
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
