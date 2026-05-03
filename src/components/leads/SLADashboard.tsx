"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Clock, CheckCircle, XCircle, TrendingUp, Target, Zap } from "lucide-react";
import { api } from "@/lib/api/client";

interface SLAData {
  dentro_do_sla: number;
  fora_do_sla: number;
  tempo_medio_resposta_min: number;
  por_origem: Record<string, { dentro: number; fora: number }>;
}

const EMPTY: SLAData = { dentro_do_sla: 0, fora_do_sla: 0, tempo_medio_resposta_min: 0, por_origem: {} };

export function SLADashboard({ className }: { className?: string }) {
  const [data, setData] = useState<SLAData>(EMPTY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSLAMetrics()
      .then((res) => { if (res.data) setData(res.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const total = data.dentro_do_sla + data.fora_do_sla;
  const complianceRate = total > 0 ? ((data.dentro_do_sla / total) * 100).toFixed(1) : "0.0";
  const complianceColor = Number(complianceRate) >= 90 ? "text-dd-accent-green" : Number(complianceRate) >= 70 ? "text-dd-accent-orange" : "text-dd-accent-red";
  const responseColor = data.tempo_medio_resposta_min <= 30 ? "text-dd-accent-green" : data.tempo_medio_resposta_min <= 60 ? "text-dd-accent-orange" : "text-dd-accent-red";

  if (loading) {
    return (
      <Card className="glass border-border/50">
        <CardContent className="flex items-center justify-center h-48">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
            <p className="text-muted-foreground text-sm">Carregando métricas SLA...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className ?? ""}`}>
      {/* KPIs */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conformidade SLA</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${complianceColor}`}>{complianceRate}%</div>
            <p className="text-xs text-muted-foreground">{data.dentro_do_sla} de {total} no prazo</p>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio Resposta</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${responseColor}`}>{data.tempo_medio_resposta_min}min</div>
            <p className="text-xs text-muted-foreground">Meta: 30 minutos</p>
          </CardContent>
        </Card>

        <Card className="glass border-border/50 col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Monitorado</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
            <p className="text-xs text-muted-foreground">{data.fora_do_sla} fora do prazo</p>
          </CardContent>
        </Card>
      </div>

      {/* Dentro x Fora */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-primary" />
            Resumo de Conformidade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-dd-accent-green/20">
                  <CheckCircle className="h-5 w-5 text-dd-accent-green" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Dentro do SLA</p>
                  <p className="text-2xl font-semibold text-dd-accent-green">{data.dentro_do_sla}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-dd-accent-red/20">
                  <XCircle className="h-5 w-5 text-dd-accent-red" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Fora do SLA</p>
                  <p className="text-2xl font-semibold text-dd-accent-red">{data.fora_do_sla}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Por Origem */}
      {Object.keys(data.por_origem).length > 0 && (
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-primary" />
              SLA por Origem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(data.por_origem).map(([origem, vals]) => {
                const origTotal = vals.dentro + vals.fora;
                const pct = origTotal > 0 ? ((vals.dentro / origTotal) * 100).toFixed(0) : "0";
                return (
                  <div key={origem} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-2.5">
                    <span className="text-sm capitalize">{origem}</span>
                    <div className="flex items-center gap-4 text-xs text-right">
                      <span className="text-dd-accent-green">{vals.dentro} ✓</span>
                      <span className="text-dd-accent-red">{vals.fora} ✗</span>
                      <span className="font-semibold text-dd-on-surface w-10">{pct}%</span>
                    </div>
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