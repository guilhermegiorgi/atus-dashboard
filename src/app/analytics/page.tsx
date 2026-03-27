"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { api, StatsData } from "@/lib/api/client";

export default function AnalyticsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.getLeadsStats();
        console.log('Stats API Response:', response);
        
        if (response.error) {
          setError(response.error);
        } else if (response.data) {
          // Verificar formato da resposta
          const statsData = (response.data as any).data || response.data;
          console.log('Stats data:', statsData);
          setStats(statsData);
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError("Erro ao carregar estatísticas");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const metrics = stats ? [
    {
      title: "Total de Leads",
      value: stats.total,
      description: "Todos os leads registrados",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Novos",
      value: stats.novos,
      description: "Leads não contatados",
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      title: "Em Atendimento",
      value: stats.em_atendimento,
      description: "Leads em andamento",
      icon: AlertCircle,
      color: "text-orange-600",
    },
    {
      title: "Convertidos",
      value: stats.convertidos,
      description: "Leads que converteram",
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      title: "Perdidos",
      value: stats.perdidos,
      description: "Leads perdidos",
      icon: XCircle,
      color: "text-red-600",
    },
    {
      title: "Taxa de Conversão",
      value: `${((stats.convertidos / stats.total) * 100).toFixed(1)}%`,
      description: "De leads convertidos",
      icon: TrendingUp,
      color: "text-purple-600",
    },
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive">Erro: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Estatísticas detalhadas dos leads e conversões
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {metrics.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Conversion Rate Card */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Taxa de Conversão por Etapa</CardTitle>
            <CardDescription>
              Distribuição de leads por status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Novos</span>
                  <span className="font-medium">{stats.novos}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500 transition-all"
                    style={{
                      width: `${(stats.novos / stats.total) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Em Atendimento</span>
                  <span className="font-medium">{stats.em_atendimento}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 transition-all"
                    style={{
                      width: `${(stats.em_atendimento / stats.total) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Convertidos</span>
                  <span className="font-medium">{stats.convertidos}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{
                      width: `${(stats.convertidos / stats.total) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Perdidos</span>
                  <span className="font-medium">{stats.perdidos}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 transition-all"
                    style={{
                      width: `${(stats.perdidos / stats.total) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}