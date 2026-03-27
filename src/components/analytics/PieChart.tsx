"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api, StatsData } from "@/lib/api/client";
import { Loader2 } from "lucide-react";

const COLORS = {
  Novo: "#eab308",
  Em_Atendimento: "#3b82f6",
  Convertido: "#22c55e",
  Perdido: "#ef4444",
};

const ATUS_ORANGE = "#f97316";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: {
      percent: number;
    };
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="glass border border-primary/30 rounded-lg px-4 py-3 shadow-xl">
        <p className="font-semibold text-foreground">{data.name}</p>
        <p className="text-sm text-muted-foreground">
          {data.value} leads ({data.payload.percent.toFixed(1)}%)
        </p>
      </div>
    );
  }
  return null;
}

function CustomLegend({ payload }: { payload?: Array<{ value: string; color: string }> }) {
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {payload?.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full shadow-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-muted-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function PieChartComponent() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.getLeadsStats();
        if (response.error) {
          setError(response.error);
        } else if (response.data) {
          const statsData = (response.data as { data?: StatsData }).data || response.data;
          setStats(statsData as StatsData);
        }
      } catch (err) {
        console.error("Erro ao buscar estatísticas:", err);
        setError("Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Card className="glass border border-border/50">
        <CardContent className="flex items-center justify-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card className="glass border border-destructive/30">
        <CardContent className="flex items-center justify-center h-[400px]">
          <p className="text-destructive">{error || "Erro ao carregar dados"}</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = [
    { name: "Novo", value: stats.novos, color: COLORS.Novo },
    { name: "Em Atendimento", value: stats.em_atendimento, color: COLORS.Em_Atendimento },
    { name: "Convertido", value: stats.convertidos, color: COLORS.Convertido },
    { name: "Perdido", value: stats.perdidos, color: COLORS.Perdido },
  ].filter((item) => item.value > 0);

  const total = stats.total || 1;
  const dataWithPercent = chartData.map((item) => ({
    ...item,
    percent: (item.value / total) * 100,
  }));

  return (
    <Card className="glass border border-border/50 overflow-hidden relative">
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${ATUS_ORANGE} 0%, transparent 50%)`,
        }}
      />
      <CardHeader className="relative">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <span
            className="w-2 h-8 rounded-full"
            style={{ backgroundColor: ATUS_ORANGE }}
          />
          Distribuição de Leads
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Visualização percentual por status
        </CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dataWithPercent}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={120}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
                animationBegin={0}
                animationDuration={800}
                animationEasing="ease-out"
              >
                {dataWithPercent.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    style={{
                      filter: `drop-shadow(0 0 8px ${entry.color}40)`,
                      cursor: "pointer",
                    }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="absolute bottom-4 right-4 text-right">
          <p className="text-sm text-muted-foreground">Total de Leads</p>
          <p className="text-3xl font-bold text-primary">{stats.total}</p>
        </div>
      </CardContent>
    </Card>
  );
}
