"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, DollarSign, Activity, Calendar } from "lucide-react";
import { api } from "@/lib/api/client";

const STATUS_LABEL: Record<string, string> = {
  NOVO: "Novos",
  EM_ATENDIMENTO: "Em Atendimento",
  AGUARDANDO_RETORNO: "Aguardando Retorno",
  CONVERTIDO: "Convertidos",
  PERDIDO: "Perdidos",
};

const STATUS_COLOR: Record<string, string> = {
  NOVO: "bg-dd-accent-orange/20 text-dd-accent-orange border-dd-accent-orange/30",
  EM_ATENDIMENTO: "bg-dd-accent-blue/20 text-dd-accent-blue border-dd-accent-blue/30",
  AGUARDANDO_RETORNO: "bg-dd-accent-purple/20 text-dd-accent-purple border-dd-accent-purple/30",
  CONVERTIDO: "bg-dd-accent-green/20 text-dd-accent-green border-dd-accent-green/30",
  PERDIDO: "bg-dd-accent-red/20 text-dd-accent-red border-dd-accent-red/30",
};

interface FlowData {
  por_status: Record<string, number>;
  conversoes_semana: Array<{ dia: string; total: number }>;
  por_origem: Record<string, number>;
}

const EMPTY: FlowData = { por_status: {}, conversoes_semana: [], por_origem: {} };

export function LeadFlowDashboard({ className }: { className?: string }) {
  const [data, setData] = useState<FlowData>(EMPTY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getLeadFlowMetrics()
      .then((res) => { if (res.data) setData(res.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalLeads = Object.values(data.por_status).reduce((a, b) => a + b, 0);
  const convertidos = data.por_status["CONVERTIDO"] ?? 0;
  const conversionRate = totalLeads > 0 ? ((convertidos / totalLeads) * 100).toFixed(1) : "0.0";
  const totalSemana = data.conversoes_semana.reduce((a, b) => a + b.total, 0);

  if (loading) {
    return (
      <Card className="glass border-border/50">
        <CardContent className="flex items-center justify-center h-48">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
            <p className="text-muted-foreground text-sm">Carregando fluxo de leads...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className ?? ""}`}>
      {/* KPIs rápidos */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeads.toLocaleString("pt-BR")}</div>
            <p className="text-xs text-muted-foreground">Todos os status</p>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-dd-accent-green">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground">{convertidos} convertidos</p>
          </CardContent>
        </Card>

        <Card className="glass border-border/50 col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversões na Semana</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalSemana}</div>
            <p className="text-xs text-muted-foreground">Últimos {data.conversoes_semana.length} dias</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Distribuição por Status */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <BarChart3 className="h-4 w-4 text-primary" />
              Distribuição por Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(data.por_status).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Sem dados disponíveis</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(data.por_status).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <Badge variant="outline" className={STATUS_COLOR[status] ?? "bg-dd-surface-overlay/20 text-dd-on-muted"}>
                      {STATUS_LABEL[status] ?? status}
                    </Badge>
                    <div className="flex items-center gap-3">
                      <div className="h-1.5 w-24 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary/60"
                          style={{ width: totalLeads > 0 ? `${(count / totalLeads) * 100}%` : "0%" }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Origens */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-primary" />
              Leads por Origem
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(data.por_origem).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Sem dados disponíveis</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(data.por_origem)
                  .sort(([, a], [, b]) => b - a)
                  .map(([origem, count], i) => (
                  <div key={origem} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-4">#{i + 1}</span>
                      <span className="text-sm capitalize">{origem}</span>
                    </div>
                    <span className="text-sm font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tendência Semanal */}
      {data.conversoes_semana.length > 0 && (
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-primary" />
              Conversões por Dia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-20">
              {data.conversoes_semana.map((item) => {
                const maxVal = Math.max(...data.conversoes_semana.map(d => d.total), 1);
                const pct = (item.total / maxVal) * 100;
                return (
                  <div key={item.dia} className="flex flex-col items-center gap-1 flex-1">
                    <span className="text-xs font-medium text-dd-on-surface">{item.total}</span>
                    <div
                      className="w-full rounded-t bg-primary/60 transition-all"
                      style={{ height: `${Math.max(pct, 4)}%`, minHeight: "4px" }}
                    />
                    <span className="text-[10px] text-muted-foreground">{item.dia}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}