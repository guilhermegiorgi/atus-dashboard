"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { api } from "@/lib/api/client";
import { Lead } from "@/types/leads";
import {
  AnalyticsOverview,
  FollowupMetrics,
  LeadStats,
  SlaMetrics,
} from "@/types/dashboard";
import { buildHomeViewModel } from "@/lib/dashboard/home-view-model";

const EMPTY_STATS: LeadStats = {
  total: 0,
  novos: 0,
  em_atendimento: 0,
  convertidos: 0,
  perdidos: 0,
};

const EMPTY_OVERVIEW: AnalyticsOverview = {
  total_leads: 0,
  novos_leads: 0,
  leads_em_tratativa: 0,
  takeovers_humanos: 0,
  leads_com_tracking: 0,
  conversoes_operacionais: 0,
  conversoes_comerciais: 0,
  taxa_conversao_operacional: 0,
  taxa_conversao_comercial: 0,
};

const EMPTY_FOLLOWUP: FollowupMetrics = {
  expired_followups: 0,
  active_followups: 0,
  followups_sent_today: 0,
  followup_responses_today: 0,
  stuck_followups: 0,
  contaminated_leads: 0,
  sent_last_7_days: 0,
  responses_last_7_days: 0,
};

const EMPTY_SLA: SlaMetrics = {
  dentro_do_sla: 0,
  fora_do_sla: 0,
  tempo_medio_resposta_min: 0,
  por_origem: {},
};

export default function DashboardPage() {
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats>(EMPTY_STATS);
  const [overview, setOverview] = useState<AnalyticsOverview>(EMPTY_OVERVIEW);
  const [followup, setFollowup] = useState<FollowupMetrics>(EMPTY_FOLLOWUP);
  const [sla, setSla] = useState<SlaMetrics>(EMPTY_SLA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError(null);

      const [leadList, statsResult, followupResult, slaResult, overviewResult] =
        await Promise.all([
          api.getPaginatedLeads({ limit: 5, offset: 0 }),
          api.getLeadsStats(),
          api.getFollowupMetrics(),
          api.getSLAMetrics(),
          api.getAnalyticsOverview(),
        ]);

      const firstError =
        leadList.error ??
        statsResult.error ??
        followupResult.error ??
        slaResult.error ??
        overviewResult.error ??
        null;

      if (firstError) {
        setError(firstError);
        setLoading(false);
        return;
      }

      setRecentLeads(
        (leadList.data?.data ?? []).slice().sort((a, b) => {
          return (
            new Date(b.updated_at || b.created_at).getTime() -
            new Date(a.updated_at || a.created_at).getTime()
          );
        })
      );
      setStats(statsResult.data ?? EMPTY_STATS);
      setFollowup(followupResult.data ?? EMPTY_FOLLOWUP);
      setSla(slaResult.data ?? EMPTY_SLA);
      setOverview(overviewResult.data ?? EMPTY_OVERVIEW);
      setLoading(false);
    }

    void loadDashboard();
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

  const model = buildHomeViewModel({ stats, overview, followup, sla });

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visao executiva do AtusBot com metricas reais do backend
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {model.heroCards.map((card, index) => (
          <Card
            key={card.title}
            className="glass border-border/50 hover:border-primary/30 transition-all duration-300 animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass border-border/50 animate-slide-up">
          <CardHeader>
            <CardTitle>Follow-up Operacional</CardTitle>
            <CardDescription>Indicadores reais entregues pelo backend</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {model.followupCards.map((card) => (
              <div key={card.title} className="rounded-xl border border-border/50 p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  {card.title}
                </div>
                <div className="mt-2 text-2xl font-semibold">{card.value}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass border-border/50 animate-slide-up stagger-4">
          <CardHeader>
            <CardTitle>SLA</CardTitle>
            <CardDescription>Conformidade e tempo medio de resposta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-border/50 p-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Conformidade
              </div>
              <div className="mt-2 text-2xl font-semibold">{model.slaSummary.compliance}</div>
            </div>
            <div className="rounded-xl border border-border/50 p-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Tempo Medio
              </div>
              <div className="mt-2 text-2xl font-semibold">{model.slaSummary.averageResponse}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass border-border/50 animate-slide-up stagger-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Leads Recentes</CardTitle>
              <CardDescription>
                Primeira pagina paginada do endpoint canonico de leads
              </CardDescription>
            </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              {overview.total_leads} total
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
                      {(lead.nome_completo || "SN").charAt(0).toUpperCase()}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{lead.nome_completo || "Sem nome"}</p>
                      <p className="text-xs text-muted-foreground">
                        {lead.email || lead.telefone || "Sem contato"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {lead.tracked_codigo_ref || lead.campanha_origem || "Sem campanha"}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                    {lead.status}
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
