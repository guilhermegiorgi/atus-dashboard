"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Clock, 
  Target, 
  AlertTriangle,
  BarChart3,
  Activity,
  DollarSign,
  Calendar
} from "lucide-react";

interface FlowMetrics {
  totalLeads: number;
  conversionRate: number;
  averageResponseTime: number;
  averageLeadTime: number;
  activeLeads: number;
  completedLeads: number;
  lostLeads: number;
  monthlyGrowth: number;
  topSources: Array<{
    name: string;
    leads: number;
    conversionRate: number;
  }>;
  statusDistribution: {
    NOVO: number;
    EM_ATENDIMENTO: number;
    CONVERTIDO: number;
    PERDIDO: number;
  };
  weeklyTrend: Array<{
    week: string;
    leads: number;
    conversions: number;
  }>;
}

interface LeadFlowDashboardProps {
  className?: string;
}

export function LeadFlowDashboard({ className }: LeadFlowDashboardProps) {
  const [metrics, setMetrics] = useState<FlowMetrics>({
    totalLeads: 0,
    conversionRate: 0,
    averageResponseTime: 0,
    averageLeadTime: 0,
    activeLeads: 0,
    completedLeads: 0,
    lostLeads: 0,
    monthlyGrowth: 0,
    topSources: [],
    statusDistribution: {
      NOVO: 0,
      EM_ATENDIMENTO: 0,
      CONVERTIDO: 0,
      PERDIDO: 0,
    },
    weeklyTrend: [],
  });
  
  const [loading, setLoading] = useState(true);

  // Mock data - em produção, isso viria da API
  useEffect(() => {
    const mockMetrics: FlowMetrics = {
      totalLeads: 1247,
      conversionRate: 23.5,
      averageResponseTime: 2.3, // horas
      averageLeadTime: 5.7, // dias
      activeLeads: 342,
      completedLeads: 293,
      lostLeads: 156,
      monthlyGrowth: 12.8,
      topSources: [
        { name: "Facebook Ads", leads: 456, conversionRate: 28.5 },
        { name: "Google Ads", leads: 387, conversionRate: 24.2 },
        { name: "Indicação", leads: 234, conversionRate: 45.3 },
        { name: "Site Orgânico", leads: 170, conversionRate: 18.7 },
      ],
      statusDistribution: {
        NOVO: 298,
        EM_ATENDIMENTO: 156,
        CONVERTIDO: 293,
        PERDIDO: 156,
      },
      weeklyTrend: [
        { week: "Semana 1", leads: 45, conversions: 12 },
        { week: "Semana 2", leads: 52, conversions: 15 },
        { week: "Semana 3", leads: 38, conversions: 9 },
        { week: "Semana 4", leads: 61, conversions: 18 },
      ],
    };

    setTimeout(() => {
      setMetrics(mockMetrics);
      setLoading(false);
    }, 1200);
  }, []);

  const getStatusColor = (status: keyof typeof metrics.statusDistribution) => {
    const colors = {
      NOVO: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      EM_ATENDIMENTO: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      CONVERTIDO: "bg-green-500/20 text-green-400 border-green-500/30",
      PERDIDO: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    return colors[status];
  };

  const getStatusLabel = (status: keyof typeof metrics.statusDistribution) => {
    const labels = {
      NOVO: "Novos",
      EM_ATENDIMENTO: "Em Atendimento",
      CONVERTIDO: "Convertidos",
      PERDIDO: "Perdidos",
    };
    return labels[status];
  };

  if (loading) {
    return (
      <Card className="glass border-border/50">
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
            <p className="text-muted-foreground">Carregando métricas de fluxo...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className || ""}`}>
      {/* Cards Principais */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalLeads.toLocaleString('pt-BR')}</div>
            <div className="flex items-center gap-1 text-sm">
              {metrics.monthlyGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-400" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-400" />
              )}
              <span className={metrics.monthlyGrowth >= 0 ? "text-green-400" : "text-red-400"}>
                {Math.abs(metrics.monthlyGrowth)}%
              </span>
              <span className="text-muted-foreground">este mês</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics.completedLeads} de {metrics.totalLeads} convertidos
            </p>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo de Resposta</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageResponseTime}h</div>
            <p className="text-xs text-muted-foreground">
              Tempo médio para primeiro contato
            </p>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo de Ciclo</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageLeadTime}d</div>
            <p className="text-xs text-muted-foreground">
              Dias até conversão ou perda
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição por Status */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Distribuição por Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(metrics.statusDistribution).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={getStatusColor(status as keyof typeof metrics.statusDistribution)}>
                      {getStatusLabel(status as keyof typeof metrics.statusDistribution)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{count}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium">
                      {((count / metrics.totalLeads) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Fontes */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Top Fontes de Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.topSources.map((source, index) => (
                <div key={source.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                    <span className="text-sm">{source.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{source.leads}</div>
                    <div className="text-xs text-muted-foreground">
                      {source.conversionRate}% conversão
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tendência Semanal */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Tendência Semanal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.weeklyTrend.map((week) => (
              <div key={week.week} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{week.week}</span>
                  <Badge variant="outline" className="text-xs">
                    {week.leads} leads
                  </Badge>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium">{week.conversions}</div>
                    <div className="text-xs text-muted-foreground">
                      {((week.conversions / week.leads) * 100).toFixed(1)}% conversão
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${
                    week.conversions >= 15 ? "text-green-400" : 
                    week.conversions >= 10 ? "text-yellow-400" : "text-red-400"
                  }`}>
                    {week.conversions >= 15 ? <TrendingUp className="h-3 w-3" /> : 
                     week.conversions >= 10 ? <Activity className="h-3 w-3" /> : 
                     <AlertTriangle className="h-3 w-3" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}