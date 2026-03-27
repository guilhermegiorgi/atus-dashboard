"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, Clock, CheckCircle, ArrowUpRight, ArrowDownRight } from "lucide-react";
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
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
          <p className="text-muted-foreground">Carregando dados...</p>
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

  const total = stats?.total || leads.length;
  const novos = stats?.novos || leads.filter(l => l.status === 'NOVO').length;
  const converted = stats?.convertidos || leads.filter(l => l.status === 'CONVERTIDO').length;
  const conversionRate = total > 0 ? ((converted / total) * 100).toFixed(1) : '0';

  const statsCards = [
    {
      title: "Total de Leads",
      value: total,
      description: "Leads registrados no sistema",
      icon: Users,
      trend: "+12% este mês",
      trendUp: true,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Leads Novos",
      value: novos,
      description: "Aguardando primeiro contato",
      icon: Clock,
      trend: "+5 hoje",
      trendUp: true,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
    },
    {
      title: "Convertidos",
      value: converted,
      description: "Leads que fecharam negócio",
      icon: CheckCircle,
      trend: "+3 esta semana",
      trendUp: true,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Taxa de Conversão",
      value: `${conversionRate}%`,
      description: "Média de conversão",
      icon: TrendingUp,
      trend: "+2.3% vs mês anterior",
      trendUp: true,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  const recentLeads = leads.slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral dos seus leads e métricas de desempenho
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => (
          <Card 
            key={stat.title} 
            className="glass border-border/50 hover:border-primary/30 transition-all duration-300 animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`h-10 w-10 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
              <div className="flex items-center gap-1 mt-2">
                {stat.trendUp ? (
                  <ArrowUpRight className="h-3 w-3 text-green-400" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-400" />
                )}
                <span className={`text-xs ${stat.trendUp ? 'text-green-400' : 'text-red-400'}`}>
                  {stat.trend}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass border-border/50 animate-slide-up stagger-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Leads Recentes</CardTitle>
              <CardDescription>
                Últimos leads adicionados ao sistema
              </CardDescription>
            </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              {leads.length} total
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {recentLeads.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Nenhum lead encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentLeads.map((lead, index) => (
                <div 
                  key={lead.id} 
                  className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors border border-transparent hover:border-border/50 animate-slide-up"
                  style={{ animationDelay: `${(index + 5) * 50}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-orange-600/20 flex items-center justify-center text-primary font-semibold">
                      {(lead.nome_completo || 'SN').charAt(0).toUpperCase()}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{lead.nome_completo || 'Sem nome'}</p>
                      <p className="text-xs text-muted-foreground">
                        {lead.email || lead.telefone || 'Sem contato'}
                      </p>
                    </div>
                  </div>
                  <Badge variant={
                    lead.status === 'NOVO' ? 'default' :
                    lead.status === 'EM_ATENDIMENTO' ? 'secondary' :
                    lead.status === 'CONVERTIDO' ? 'outline' :
                    'destructive'
                  } className={
                    lead.status === 'NOVO' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                    lead.status === 'EM_ATENDIMENTO' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                    lead.status === 'CONVERTIDO' ? 'bg-green-500/20 text-green-400 border-green-500/30' : ''
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
