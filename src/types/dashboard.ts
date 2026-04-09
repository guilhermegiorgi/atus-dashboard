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

export interface OperationalQueueItem {
  lead_id: string;
  telefone: string;
  canal_origem: string;
  sistema_origem: string;
  campanha_origem: string;
  tracked_codigo_ref: string;
  intervention_type: string;
  fase: string;
  status: string;
  next_field: string;
  missing_fields: string[];
  confirmation_pending: boolean;
  is_contaminated: boolean;
  recommended_action: string;
  qualification_summary: string;
  last_bot_message: string;
  last_lead_message: string;
  last_message_direction: string;
}

export type OperationalStatus = OperationalQueueItem;

export interface LeadAction {
  id: string;
  lead_id: string;
  action: string;
  status: string;
  actor: string;
  details: string;
  created_at: string;
}

export interface FollowupQueueFilters {
  limit?: number;
  offset?: number;
  status?: string;
  fase?: string;
  em_follow_up?: boolean;
  tipo_interesse?: string;
  has_nome?: boolean;
  has_email?: boolean;
  expired_only?: boolean;
  only_contaminated?: boolean;
  canal_origem?: string;
  sistema_origem?: string;
  triage_state?: string;
  search?: string;
}
