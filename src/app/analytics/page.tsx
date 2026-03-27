"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle, ArrowUpRight } from "lucide-react";
import { api, StatsData } from "@/lib/api/client";
import PieChart from "@/components/analytics/PieChart";

export default function AnalyticsPage() {
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
        console.error('Erro ao buscar estatísticas:', err);
        setError("Erro ao carregar estatísticas");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
          <p className="text-muted-foreground">Carregando análises...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive text-center">
          <p className="font-semibold">Erro ao carregar</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const metrics = stats ? [
    {
      title: "Total de Leads",
      value: stats.total,
      description: "Leads registrados no sistema",
      icon: Users,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      title: "Novos",
      value: stats.novos,
      description: "Aguardando primeiro contato",
      icon: Clock,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/20",
    },
    {
      title: "Em Atendimento",
      value: stats.em_atendimento,
      description: "Em processo de negociação",
      icon: AlertCircle,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      title: "Convertidos",
      value: stats.convertidos,
      description: "Negócios fechados",
      icon: CheckCircle,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
    },
    {
      title: "Perdidos",
      value: stats.perdidos,
      description: "Leads não convertidos",
      icon: XCircle,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20",
    },
    {
      title: "Taxa de Conversão",
      value: `${((stats.convertidos / stats.total) * 100).toFixed(1)}%`,
      description: "Percentual de conversão",
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20",
    },
  ] : [];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Análises</h1>
        <p className="text-muted-foreground">
          Estatísticas detalhadas dos leads e conversões
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric, index) => (
          <Card 
            key={metric.title}
            className={`glass border ${metric.borderColor} hover:border-primary/30 transition-all duration-300 animate-slide-up`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <div className={`h-10 w-10 rounded-xl ${metric.bgColor} flex items-center justify-center`}>
                <metric.icon className={`h-5 w-5 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <PieChart />

      {stats && (
        <Card className="glass border-border/50 animate-slide-up stagger-5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Distribuição por Status</CardTitle>
                <CardDescription>
                  Visualização percentual dos leads por categoria
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-400">
                <ArrowUpRight className="h-4 w-4" />
                <span>Performance positiva</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    <span className="text-sm font-medium">Novos</span>
                  </div>
                  <span className="text-sm font-semibold">{stats.novos}</span>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500 transition-all duration-500"
                    style={{ width: `${(stats.novos / stats.total) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {((stats.novos / stats.total) * 100).toFixed(1)}% do total
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                    <span className="text-sm font-medium">Em Atendimento</span>
                  </div>
                  <span className="text-sm font-semibold">{stats.em_atendimento}</span>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${(stats.em_atendimento / stats.total) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {((stats.em_atendimento / stats.total) * 100).toFixed(1)}% do total
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <span className="text-sm font-medium">Convertidos</span>
                  </div>
                  <span className="text-sm font-semibold">{stats.convertidos}</span>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all duration-500"
                    style={{ width: `${(stats.convertidos / stats.total) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {((stats.convertidos / stats.total) * 100).toFixed(1)}% do total
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <span className="text-sm font-medium">Perdidos</span>
                  </div>
                  <span className="text-sm font-semibold">{stats.perdidos}</span>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 transition-all duration-500"
                    style={{ width: `${(stats.perdidos / stats.total) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {((stats.perdidos / stats.total) * 100).toFixed(1)}% do total
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
