import {
  AnalyticsOverview,
  FollowupMetrics,
  LeadStats,
  SlaMetrics,
} from "@/types/dashboard";

type Input = {
  stats: LeadStats;
  overview: AnalyticsOverview;
  followup: FollowupMetrics;
  sla: SlaMetrics;
};

export function buildHomeViewModel({ stats, overview, followup, sla }: Input) {
  const totalSla = sla.dentro_do_sla + sla.fora_do_sla;

  return {
    heroCards: [
      {
        title: "Total de Leads",
        value: overview.total_leads || stats.total,
        description: "Base total sob monitoramento",
      },
      {
        title: "Leads Novos",
        value: overview.novos_leads || stats.novos,
        description: "Entradas recentes no funil",
      },
      {
        title: "Conversoes Operacionais",
        value: overview.conversoes_operacionais,
        description: "Leads prontos para triagem e distribuicao",
      },
      {
        title: "Conversoes Comerciais",
        value: `${(overview.taxa_conversao_comercial * 100).toFixed(1)}%`,
        description: `${overview.conversoes_comerciais} convertidos`,
      },
    ],
    followupCards: [
      {
        title: "Follow-ups Ativos",
        value: followup.active_followups,
      },
      {
        title: "Expirados",
        value: followup.expired_followups,
      },
      {
        title: "Respostas Hoje",
        value: followup.followup_responses_today,
      },
      {
        title: "Contaminados",
        value: followup.contaminated_leads,
      },
    ],
    slaSummary: {
      compliance:
        totalSla > 0
          ? `${((sla.dentro_do_sla / totalSla) * 100).toFixed(1)}%`
          : "0.0%",
      averageResponse: `${sla.tempo_medio_resposta_min} min`,
    },
  };
}
