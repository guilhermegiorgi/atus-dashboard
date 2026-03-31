"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, CheckCircle, XCircle, TrendingUp, Users, Target, Zap } from "lucide-react";
import type { LeadSLA, SLAStats } from "@/types/sla";

interface SLADashboardProps {
  className?: string;
}

const statusColors = {
  on_time: "bg-green-500/20 text-green-400 border-green-500/30",
  at_risk: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  overdue: "bg-red-500/20 text-red-400 border-red-500/30",
  completed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

const statusLabels = {
  on_time: "No Prazo",
  at_risk: "Em Risco",
  overdue: "Atrasado",
  completed: "Concluído",
};

export function SLADashboard({ className }: SLADashboardProps) {
  const [stats, setStats] = useState<SLAStats>({
    totalLeads: 0,
    onTime: 0,
    atRisk: 0,
    overdue: 0,
    completed: 0,
    averageResponseTime: 0,
    averageResolutionTime: 0,
    complianceRate: 0,
  });

  const [recentAlerts, setRecentAlerts] = useState<LeadSLA[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data - em produção, isso viria da API
  useEffect(() => {
    const mockStats: SLAStats = {
      totalLeads: 156,
      onTime: 98,
      atRisk: 23,
      overdue: 12,
      completed: 23,
      averageResponseTime: 45, // minutos
      averageResolutionTime: 24, // horas
      complianceRate: 85.5,
    };

    const mockAlerts: LeadSLA[] = [
      {
        id: "1",
        leadId: "lead-1",
        serviceLevelId: "sla-1",
        assignedAt: new Date().toISOString(),
        responseDeadline: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 horas
        resolutionDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
        status: "at_risk",
        alerts: [
          {
            id: "alert-1",
            leadSLAId: "1",
            type: "response_due",
            message: "Resposta próxima do vencimento",
            createdAt: new Date().toISOString(),
            acknowledged: false,
          },
        ],
      },
      {
        id: "2",
        leadId: "lead-2",
        serviceLevelId: "sla-2",
        assignedAt: new Date().toISOString(),
        responseDeadline: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hora atrás
        resolutionDeadline: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // 12 horas
        status: "overdue",
        alerts: [
          {
            id: "alert-2",
            leadSLAId: "2",
            type: "overdue",
            message: "Resposta vencida",
            createdAt: new Date().toISOString(),
            acknowledged: false,
          },
        ],
      },
    ];

    setTimeout(() => {
      setStats(mockStats);
      setRecentAlerts(mockAlerts);
      setLoading(false);
    }, 1000);
  }, []);

  const getComplianceColor = (rate: number) => {
    if (rate >= 90) return "text-green-400";
    if (rate >= 80) return "text-yellow-400";
    return "text-red-400";
  };

  const getTimeColor = (time: number, type: "response" | "resolution") => {
    const limits = type === "response" ? [30, 60, 120] : [12, 24, 48];
    const colors = ["text-green-400", "text-yellow-400", "text-orange-400", "text-red-400"];
    
    for (let i = 0; i < limits.length; i++) {
      if (time <= limits[i]) return colors[i];
    }
    return colors[colors.length - 1];
  };

  if (loading) {
    return (
      <Card className="glass border-border/50">
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
            <p className="text-muted-foreground">Carregando métricas SLA...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className || ""}`}>
      {/* Cards de Métricas Principais */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conformidade</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getComplianceColor(stats.complianceRate)}`}>
              {stats.complianceRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.onTime + stats.completed} de {stats.totalLeads} no prazo
            </p>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio de Resposta</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getTimeColor(stats.averageResponseTime, "response")}`}>
              {stats.averageResponseTime}min
            </div>
            <p className="text-xs text-muted-foreground">
              Meta: 30 minutos
            </p>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio de Resolução</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getTimeColor(stats.averageResolutionTime, "resolution")}`}>
              {stats.averageResolutionTime}h
            </div>
            <p className="text-xs text-muted-foreground">
              Meta: 24 horas
            </p>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              {stats.atRisk} em risco, {stats.overdue} atrasados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição por Status */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Distribuição por Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">No Prazo</p>
                  <p className="text-2xl font-semibold text-green-400">{stats.onTime}</p>
                </div>
              </div>
            </div>
            
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/20">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Em Risco</p>
                  <p className="text-2xl font-semibold text-yellow-400">{stats.atRisk}</p>
                </div>
              </div>
            </div>
            
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/20">
                  <XCircle className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Atrasados</p>
                  <p className="text-2xl font-semibold text-red-400">{stats.overdue}</p>
                </div>
              </div>
            </div>
            
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
                  <CheckCircle className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Concluídos</p>
                  <p className="text-2xl font-semibold text-blue-400">{stats.completed}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertas Recentes */}
      {recentAlerts.length > 0 && (
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-400" />
              Alertas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-orange-500/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={statusColors[alert.status]}>
                        {statusLabels[alert.status]}
                      </Badge>
                      <span className="text-sm text-zinc-300">
                        Lead #{alert.leadId.slice(-6)}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs">
                      Ver Lead
                    </Button>
                  </div>
                  {alert.alerts.length > 0 && (
                    <p className="mt-2 text-sm text-zinc-400">
                      {alert.alerts[0].message}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}