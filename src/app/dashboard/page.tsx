"use client";

import { useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  ArrowUpRight,
  Clock,
  AlertTriangle,
  RefreshCcw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api/client";
import { Lead } from "@/types/leads";
import {
  AnalyticsOverview,
  FollowupMetrics,
  LeadStats,
  SlaMetrics,
} from "@/types/dashboard";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { FunnelChart } from "@/components/dashboard/FunnelChart";
import { CorretorRanking } from "@/components/dashboard/CorretorRanking";

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

  const loadDashboard = async () => {
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
      }),
    );
    setStats(statsResult.data ?? EMPTY_STATS);
    setFollowup(followupResult.data ?? EMPTY_FOLLOWUP);
    setSla(slaResult.data ?? EMPTY_SLA);
    setOverview(overviewResult.data ?? EMPTY_OVERVIEW);
    setLoading(false);
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  const totalSla = sla.dentro_do_sla + sla.fora_do_sla;
  const slaCompliance =
    totalSla > 0
      ? `${((sla.dentro_do_sla / totalSla) * 100).toFixed(1)}%`
      : "0.0%";

  const conversionRate =
    overview.total_leads > 0
      ? Math.round(
          (overview.conversoes_comerciais / overview.total_leads) * 100,
        )
      : 0;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-5 w-5 rounded-full border-2 border-dd-border-subtle border-t-dd-on-muted animate-spin" />
          <p className="text-xs text-dd-on-muted">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 mx-auto text-dd-accent-red mb-2" />
          <p className="text-sm text-dd-accent-red">{error}</p>
          <button
            onClick={loadDashboard}
            className="mt-3 text-xs text-dd-on-muted hover:text-dd-on-surface underline"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-dd-primary overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-dd-border-subtle px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-dd-on-primary tracking-tight">
              Dashboard
            </h1>
            <p className="text-[11px] text-dd-on-muted mt-0.5">
              Visao geral do funil de leads
            </p>
          </div>
          <button
            onClick={loadDashboard}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-dd-border-subtle text-dd-muted hover:text-dd-on-surface hover:bg-dd-surface-overlay transition-colors"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 h-0 overflow-y-auto px-6 py-5 space-y-5">
        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard
            title="Total de Leads"
            value={overview.total_leads || stats.total}
            icon={Users}
            color="blue"
            description="Base total monitorada"
          />
          <KpiCard
            title="Leads Novos"
            value={overview.novos_leads || stats.novos}
            icon={UserPlus}
            color="green"
            description="Entradas recentes no funil"
          />
          <KpiCard
            title="Conversoes"
            value={overview.conversoes_comerciais}
            icon={ArrowUpRight}
            color="orange"
            description={`${conversionRate}% taxa de conversao`}
          />
          <KpiCard
            title="SLA"
            value={slaCompliance}
            icon={Clock}
            color={
              totalSla > 0 && sla.dentro_do_sla / totalSla >= 0.8
                ? "green"
                : "red"
            }
            description={`${sla.tempo_medio_resposta_min}min tempo medio`}
          />
        </div>

        {/* Middle Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Funnel */}
          <div className="rounded-lg border border-dd-border-subtle bg-dd-surface-raised p-4">
            <h3 className="text-xs font-medium text-dd-on-primary mb-4">
              Funil de Conversao
            </h3>
            <FunnelChart
              steps={[
                {
                  label: "Total",
                  value: stats.total,
                  color: "bg-dd-accent-blue",
                },
                {
                  label: "Novos",
                  value: stats.novos,
                  color: "bg-dd-accent-purple",
                },
                {
                  label: "Em Atendimento",
                  value: stats.em_atendimento,
                  color: "bg-dd-accent-orange",
                },
                {
                  label: "Convertidos",
                  value: stats.convertidos,
                  color: "bg-dd-accent-green",
                },
              ]}
            />
          </div>

          {/* Follow-up */}
          <div className="rounded-lg border border-dd-border-subtle bg-dd-surface-raised p-4">
            <h3 className="text-xs font-medium text-dd-on-primary mb-4">
              Follow-up
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: "Ativos",
                  value: followup.active_followups,
                  color: "text-dd-accent-green",
                },
                {
                  label: "Expirados",
                  value: followup.expired_followups,
                  color: "text-dd-accent-red",
                },
                {
                  label: "Enviados hoje",
                  value: followup.followups_sent_today,
                  color: "text-dd-accent-blue",
                },
                {
                  label: "Respostas hoje",
                  value: followup.followup_responses_today,
                  color: "text-dd-accent-orange",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-md border border-dd-border-subtle p-3"
                >
                  <p className="text-[10px] uppercase tracking-wider text-dd-on-muted">
                    {item.label}
                  </p>
                  <p className={`text-lg font-semibold mt-1 ${item.color}`}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Corretor Ranking placeholder */}
          <div className="rounded-lg border border-dd-border-subtle bg-dd-surface-raised p-4">
            <h3 className="text-xs font-medium text-dd-on-primary mb-4">
              Performance por Corretor
            </h3>
            <CorretorRanking
              data={Object.entries(sla.por_origem).map(([nome, vals]) => ({
                nome,
                leads: vals.dentro + vals.fora,
                conversoes: vals.dentro,
                taxa:
                  vals.dentro + vals.fora > 0
                    ? (vals.dentro / (vals.dentro + vals.fora)) * 100
                    : 0,
              }))}
            />
          </div>
        </div>

        {/* Recent Leads */}
        <div className="rounded-lg border border-dd-border-subtle bg-dd-surface-raised p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-medium text-dd-on-primary">
              Leads Recentes
            </h3>
            <Badge
              variant="secondary"
              className="bg-dd-surface-overlay text-dd-on-muted border-dd-border-subtle text-[10px]"
            >
              {overview.total_leads} total
            </Badge>
          </div>

          {recentLeads.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-8 w-8 mx-auto text-dd-on-muted/40 mb-2" />
              <p className="text-xs text-dd-on-muted">Nenhum lead encontrado</p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between rounded-md px-3 py-2.5 hover:bg-dd-surface-overlay/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-dd-surface-overlay text-[11px] font-medium text-dd-on-muted">
                      {(lead.nome_completo || "SN").charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] text-dd-on-primary truncate">
                        {lead.nome_completo || "Sem nome"}
                      </p>
                      <p className="text-[11px] text-dd-on-muted truncate">
                        {lead.telefone || lead.email || "Sem contato"}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-dd-border-subtle bg-dd-surface-overlay/30 text-[10px] flex-shrink-0"
                  >
                    {lead.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
