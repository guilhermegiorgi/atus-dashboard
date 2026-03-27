"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { api, Lead, StatsData } from "@/lib/api/client";

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leadsResponse, statsResponse] = await Promise.all([
          api.getLeads(),
          api.getLeadsStats()
        ]);

        if (leadsResponse.error) {
          setError(leadsResponse.error);
        } else if (leadsResponse.data) {
          const leadsData = (leadsResponse.data as { data?: Lead[] }).data || leadsResponse.data;
          setLeads(Array.isArray(leadsData) ? leadsData : []);
        }

        if (statsResponse.error) {
          console.error('Stats error:', statsResponse.error);
        } else if (statsResponse.data) {
          const statsData = (statsResponse.data as { data?: StatsData }).data || statsResponse.data;
          setStats(statsData as StatsData);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError("Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const total = stats?.total || leads.length;
  const novos = stats?.novos || leads.filter(l => l.status === 'NOVO').length;
  const converted = stats?.convertidos || leads.filter(l => l.status === 'CONVERTIDO').length;
  const conversionRate = total > 0 ? ((converted / total) * 100).toFixed(1) : '0';

  const statsCards = [
    {
      title: "Total Leads",
      value: total,
      description: "Todos os leads registrados",
      icon: Users,
      trend: "+12% este mês",
    },
    {
      title: "Leads Novos",
      value: novos,
      description: "Leads não contatados",
      icon: Clock,
      trend: "+5 novos hoje",
    },
    {
      title: "Convertidos",
      value: converted,
      description: "Leads que converteram",
      icon: CheckCircle,
      trend: "+3 esta semana",
    },
    {
      title: "Taxa de Conversão",
      value: `${conversionRate}%`,
      description: "De leads convertidos",
      icon: TrendingUp,
      trend: "+2.3% vs mês anterior",
    },
  ];

  const recentLeads = leads.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral dos seus leads e métricas
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {stat.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Leads Recentes</CardTitle>
          <CardDescription>
            Últimos 5 leads adicionados ao sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentLeads.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nenhum lead encontrado</p>
          ) : (
            <div className="space-y-4">
              {recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{lead.nome_completo || 'Sem nome'}</p>
                    <p className="text-sm text-muted-foreground">{lead.email || lead.telefone}</p>
                  </div>
                  <Badge variant={
                    lead.status === 'NOVO' ? 'secondary' :
                    lead.status === 'EM_ATENDIMENTO' ? 'default' :
                    lead.status === 'CONVERTIDO' ? 'outline' :
                    'destructive'
                  }>
                    {lead.status === 'NOVO' ? 'Novo' :
                     lead.status === 'EM_ATENDIMENTO' ? 'Em Atendimento' :
                     lead.status === 'CONVERTIDO' ? 'Convertido' :
                     lead.status === 'PERDIDO' ? 'Perdido' : lead.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
