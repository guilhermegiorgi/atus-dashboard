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

export interface AnalyticsFilters {
  date_from?: string;
  date_to?: string;
  canal_origem?: string;
  sistema_origem?: string;
  campanha_origem?: string;
  tracked_codigo_ref?: string;
  status?: string;
  fase?: string;
  corretor_id?: string;
  intervention_type?: string;
  limit?: number;
  offset?: number;
  search?: string;
}

export interface AnalyticsTimeseriesPoint {
  date: string;
  leads: number;
  operational_conversions: number;
  commercial_conversions: number;
  human_takeovers: number;
}

export interface AnalyticsGroupedRow {
  key: string;
  label: string;
  total_leads: number;
  leads_em_tratativa: number;
  takeovers_humanos: number;
  conversoes_operacionais: number;
  conversoes_comerciais: number;
  taxa_conversao_operacional: number;
  taxa_conversao_comercial: number;
  score_prontidao_medio: number;
  score_potencial_medio: number;
}

export interface AnalyticsLeadRow {
  lead_id: string;
  telefone: string;
  nome_completo: string;
  canal_origem: string;
  sistema_origem: string;
  campanha_origem: string;
  tracked_codigo_ref: string;
  corretor_id: string | null;
  status: string;
  fase: string;
  intervention_type: string;
  qualification_summary: string;
  score_prontidao_operacional: number;
  score_prontidao_bucket: string;
  score_potencial_comercial: number;
  score_potencial_bucket: string;
  updated_at: string;
}

export interface TrackedLinksFilters {
  limit?: number;
  offset?: number;
  ativo?: boolean;
  search?: string;
}

export interface TrackedLink {
  id: string;
  nome: string;
  nome_campanha: string;
  source: string;
  medium: string;
  content: string;
  term: string;
  codigo_ref: string;
  whatsapp_num: string;
  whatsapp_msg: string;
  url_base: string;
  clicks: number;
  leads_convertidos: number;
  ativo: boolean;
  expira_em: string | null;
  created_at: string;
  updated_at: string;
  link?: string;
}

export interface CreateTrackedLinkValues {
  nome: string;
  nome_campanha?: string;
  source?: string;
  medium?: string;
  content?: string;
  term?: string;
  whatsapp_num: string;
  whatsapp_msg?: string;
  url_base?: string;
  expira_em?: string;
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

export interface InboxConversationSummary {
  lead_id: string;
  telefone: string;
  nome_completo: string;
  conversation_state: string;
  owner_user_name: string;
  owner_user_type: string;
  assigned_corretor_id: string | null;
  assigned_by: string;
  assigned_at: string | null;
  returned_to_bot_at: string | null;
  canal_origem: string;
  sistema_origem: string;
  status: string;
  fase: string;
  qualification_summary: string;
  last_message_preview: string;
  last_message_direction: string;
  tags: string[];
  updated_at: string;
}

export interface InboxConversationFilters {
  state?: string;
  owner_user_name?: string;
  assigned_corretor_id?: string;
  canal_origem?: string;
  sistema_origem?: string;
  status?: string;
  fase?: string;
  limit?: number;
  offset?: number;
  search?: string;
}

export interface InboxMessage {
  id: string;
  content: string;
  direction: string;
  timestamp: string;
  actor_name: string;
  actor_type: string;
  tipo_msg?: string;
  midia_url?: string;
}

export interface InboxConversationDetail extends InboxConversationSummary {
  email: string;
  tracked_codigo_ref: string;
  link_click_id: string | null;
  messages: InboxMessage[];
  operational_status?: OperationalStatus | null;
}

export interface LeadHumanIntervention {
  lead_id: string;
  telefone: string;
  intervention_type: string;
  conversation_state: string;
  intervention_at: string | null;
  intervention_by: string | null;
  em_follow_up: boolean;
}

// ============ TRACKED LINK STATS ============
export interface LinkStats {
  link_id: string;
  link_name: string;
  total_clicks: number;
  unique_visitors: number;
  leads_generated: number;
  conversion_rate: number;
  clicks_by_date: Array<{
    date: string;
    clicks: number;
    leads: number;
  }>;
  top_sources: Array<{
    source: string;
    clicks: number;
    leads: number;
  }>;
  devices: {
    mobile: string;
    desktop: string;
    tablet: string;
  };
}

export interface UpdateTrackedLinkValues {
  nome?: string;
  nome_campanha?: string;
  source?: string;
  medium?: string;
  content?: string;
  term?: string;
  whatsapp_num?: string;
  whatsapp_msg?: string;
  url_base?: string;
  ativo?: boolean;
  expira_em?: string;
}

// ============ LEAD RESET ============
export interface LeadResetResult {
  success: boolean;
  lead_id: string;
  previous_status: string;
  new_status: string;
}

export interface LeadResetValues {
  reason?: string;
}
