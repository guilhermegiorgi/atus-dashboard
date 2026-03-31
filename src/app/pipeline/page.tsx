"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api, Lead } from "@/lib/api/client";
import { Clock, ArrowRight, CheckCircle2, AlertCircle, TrendingUp, Users, Target } from "lucide-react";

export default function PipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await api.getLeads();
      
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setLeads(Array.isArray(response.data) ? response.data : []);
      }
    } catch {
      setError("Erro ao carregar leads");
    } finally {
      setLoading(false);
    }
  };

  const stages = leads.length > 0 ? [
    {
      name: "Novos",
      status: "NOVO",
      icon: Clock,
      color: "yellow",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/30",
      textColor: "text-yellow-400",
      progressClass: "bg-yellow-500",
      count: leads.filter((lead: Lead) => lead.status === "NOVO").length,
    },
    {
      name: "Em Atendimento",
      status: "EM_ATENDIMENTO",
      icon: AlertCircle,
      color: "blue",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
      textColor: "text-blue-400",
      progressClass: "bg-blue-500",
      count: leads.filter((lead: Lead) => lead.status === "EM_ATENDIMENTO").length,
    },
    {
      name: "Convertidos",
      status: "CONVERTIDO",
      icon: CheckCircle2,
      color: "green",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/30",
      textColor: "text-green-400",
      progressClass: "bg-green-500",
      count: leads.filter((lead: Lead) => lead.status === "CONVERTIDO").length,
    },
    {
      name: "Perdidos",
      status: "PERDIDO",
      icon: TrendingUp,
      color: "red",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/30",
      textColor: "text-red-400",
      progressClass: "bg-red-500",
      count: leads.filter((lead: Lead) => lead.status === "PERDIDO").length,
    },
  ] : [];

  const conversionRate = leads.length > 0 
    ? ((leads.filter((lead: Lead) => lead.status === "CONVERTIDO").length / leads.length) * 100).toFixed(1)
    : "0.0";

  const totalValue = leads.reduce((sum: number, lead: Lead) => {
    if (lead.status !== "CONVERTIDO") {
      return sum;
    }

    return sum + Math.max(lead.fixa_preco_max || 0, lead.fixa_preco_min || 0, 0);
  }, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
          <p className="text-muted-foreground">Carregando pipeline...</p>
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

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pipeline</h1>
        <p className="text-muted-foreground">
          Acompanhe o progresso dos seus leads pelo funil de vendas
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="glass border-border/50 animate-slide-up">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taxa de Conversão
            </CardTitle>
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Target className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Percentual de conversão
            </p>
          </CardContent>
        </Card>

        <Card className="glass border-border/50 animate-slide-up stagger-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valor em Conversão
            </CardTitle>
            <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {totalValue > 0
                ? `R$ ${totalValue.toLocaleString("pt-BR")}`
                : "Sem valor informado"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Soma do potencial informado nos leads convertidos
            </p>
          </CardContent>
        </Card>

        <Card className="glass border-border/50 animate-slide-up stagger-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Leads
            </CardTitle>
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{leads.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Leads no pipeline
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stages.map((stage, index) => (
            <div key={stage.name} className="relative">
              <Card 
                className={`glass ${stage.borderColor} hover:${stage.borderColor.replace('/30', '/50')} transition-all duration-300 animate-slide-up`}
                style={{ animationDelay: `${(index + 3) * 100}ms` }}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <div className={`h-8 w-8 rounded-lg ${stage.bgColor} flex items-center justify-center`}>
                        <stage.icon className={`h-4 w-4 ${stage.textColor}`} />
                      </div>
                      {stage.name}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold mb-3">{stage.count}</div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full ${stage.progressClass} transition-all duration-500`}
                      style={{
                        width: `${leads.length > 0 ? (stage.count / leads.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {leads.length > 0 ? ((stage.count / leads.length) * 100).toFixed(1) : 0}% do total
                  </p>
                </CardContent>
              </Card>
              {index < stages.length - 1 && (
                <div className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10">
                  <div className="h-8 w-8 rounded-full bg-background border border-border/50 flex items-center justify-center">
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {stages.map((stage, index) => (
          <Card 
            key={stage.name}
            className={`glass ${stage.borderColor} animate-slide-up`}
            style={{ animationDelay: `${(index + 7) * 100}ms` }}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className={`h-8 w-8 rounded-lg ${stage.bgColor} flex items-center justify-center`}>
                  <stage.icon className={`h-4 w-4 ${stage.textColor}`} />
                </div>
                {stage.name}
              </CardTitle>
              <CardDescription>
                {stage.count} lead{stage.count !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stage.count === 0 ? (
                <div className="text-center py-8">
                  <stage.icon className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">Nenhum lead nesta etapa</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {leads
                    .filter(lead => lead.status === stage.status)
                    .slice(0, 5)
                    .map(lead => (
                      <div
                        key={lead.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-full ${stage.bgColor} flex items-center justify-center text-sm font-semibold ${stage.textColor}`}>
                            {(lead.nome_completo || 'SN').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{lead.nome_completo || 'Sem nome'}</div>
                            <div className="text-xs text-muted-foreground">
                              {lead.email || lead.telefone || '-'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    ))}
                  {stage.count > 5 && (
                    <p className="text-xs text-muted-foreground text-center pt-2">
                      +{stage.count - 5} leads não mostrados
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
