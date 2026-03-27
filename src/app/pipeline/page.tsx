"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api, Lead } from "@/lib/api/client";
import { Clock, ArrowRight, CheckCircle2, AlertCircle, TrendingUp, Users } from "lucide-react";

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
      console.log('API Response:', response);
      
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        const leadsData = Array.isArray(response.data) ? response.data : (response.data as { data?: Lead[] }).data || [];
        console.log('Leads data:', leadsData);
        setLeads(leadsData);
      }
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError("Erro ao carregar leads");
    } finally {
      setLoading(false);
    }
  };

  const stages = leads.length > 0 ? [
    {
      name: "Novos",
      status: "NOVO",
      icon: <Clock className="h-5 w-5" />,
      color: "bg-yellow-500",
      count: leads.filter(l => l.status === "NOVO").length,
      value: leads.filter(l => l.status === "NOVO").length,
    },
    {
      name: "Em Atendimento",
      status: "EM_ATENDIMENTO",
      icon: <AlertCircle className="h-5 w-5" />,
      color: "bg-orange-500",
      count: leads.filter(l => l.status === "EM_ATENDIMENTO").length,
      value: leads.filter(l => l.status === "EM_ATENDIMENTO").length,
    },
    {
      name: "Convertidos",
      status: "CONVERTIDO",
      icon: <CheckCircle2 className="h-5 w-5" />,
      color: "bg-green-500",
      count: leads.filter(l => l.status === "CONVERTIDO").length,
      value: leads.filter(l => l.status === "CONVERTIDO").length,
    },
    {
      name: "Perdidos",
      status: "PERDIDO",
      icon: <TrendingUp className="h-5 w-5 rotate-180" />,
      color: "bg-red-500",
      count: leads.filter(l => l.status === "PERDIDO").length,
      value: leads.filter(l => l.status === "PERDIDO").length,
    },
  ] : [];

  const conversionRate = leads.length > 0 
    ? ((leads.filter(l => l.status === "CONVERTIDO").length / leads.length) * 100).toFixed(1)
    : "0.0";

  const totalValue = leads.reduce((sum, lead) => {
    // Se o lead estiver convertido, assumimos um valor médio de R$ 50.000
    // Futuramente isso pode vir da API
    return sum + (lead.status === "CONVERTIDO" ? 50000 : 0);
  }, 0);

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
        <h1 className="text-3xl font-bold tracking-tight">Pipeline</h1>
        <p className="text-muted-foreground">
          Visualize o progresso dos leads pelo funil de vendas
        </p>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Conversão
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              De leads convertidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Valor em Conversão
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {(totalValue / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs text-muted-foreground">
              Total de leads convertidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Leads
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads.length}</div>
            <p className="text-xs text-muted-foreground">
              Leads no pipeline
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Visualization */}
      <div className="grid gap-4 md:grid-cols-4">
        {stages.map((stage, index) => (
          <Card key={stage.name} className="relative">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                {stage.icon}
                {stage.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-2">{stage.count}</div>
              <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full ${stage.color} transition-all`}
                  style={{
                    width: `${leads.length > 0 ? (stage.count / leads.length) * 100 : 0}%`,
                  }}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                {leads.length > 0 && ((stage.count / leads.length) * 100).toFixed(1)}% do total
              </div>
            </CardContent>
            {index < stages.length - 1 && (
              <ArrowRight className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 h-6 w-6 text-muted-foreground rotate-0 md:rotate-0 lg:hidden xl:block" />
            )}
          </Card>
        ))}
      </div>

      {/* Lead List by Stage */}
      {stages.map((stage) => (
        <Card key={stage.name}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {stage.icon}
              {stage.name}
            </CardTitle>
            <CardDescription>
              {stage.count} lead{stage.count !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stage.count === 0 ? (
              <div className="text-center py-4 text-muted-foreground text-sm">
                Nenhum lead nesta etapa
              </div>
            ) : (
              <div className="space-y-2">
                {leads
                  .filter(lead => lead.status === stage.status)
                  .map(lead => (
                    <div
                      key={lead.id}
                      className="flex items-center justify-between border-b pb-2 last:border-0"
                    >
                      <div>
                        <div className="font-medium">{lead.nome_completo}</div>
                        <div className="text-sm text-muted-foreground">
                          {lead.email}
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}