export interface LeadStats {
  total: number;
  novos: number;
  em_atendimento: number;
  convertidos: number;
  perdidos: number;
}

export interface FlowMetrics {
  por_status: Record<string, number>;
  conversoes_semana: Array<{ dia: string; total: number }>;
  por_origem: Record<string, number>;
}

export interface FollowupMetrics {
  expired_followups: number;
  active_followups: number;
  followups_sent_today: number;
  followup_responses_today: number;
  stuck_followups: number;
  contaminated_leads: number;
  sent_last_7_days: number;
  responses_last_7_days: number;
}

export interface SlaMetrics {
  dentro_do_sla: number;
  fora_do_sla: number;
  tempo_medio_resposta_min: number;
  por_origem: Record<string, { dentro: number; fora: number }>;
}

export interface AnalyticsOverview {
  total_leads: number;
  novos_leads: number;
  leads_em_tratativa: number;
  takeovers_humanos: number;
  leads_com_tracking: number;
  conversoes_operacionais: number;
  conversoes_comerciais: number;
  taxa_conversao_operacional: number;
  taxa_conversao_comercial: number;
}
