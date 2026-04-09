export const LEAD_STATUSES = ["NOVO", "EM_ATENDIMENTO", "CONVERTIDO", "PERDIDO", "AGUARDANDO_RETORNO"] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export interface ApiResponseMeta {
  total: number;
  limit: number;
  offset: number;
}

export interface ApiResponse<T> {
  data?: T;
  meta?: ApiResponseMeta;
  error?: string;
  message?: string;
}

export interface Lead {
  id: string;
  uuid: string;
  telefone: string;
  nome_completo: string;
  estado_civil: string;
  email: string;
  aniversario: string | null;
  tem_entrada: boolean;
  entrada: number;
  renda_comprovada: number;
  renda_comprovada_conjuge: number;
  fgts: number;
  fgts_conjuge: number;
  tem_carteira_assinada: boolean;
  tipo_interesse: string;
  localizacao: string;
  fixa_preco_min: number;
  fixa_preco_max: number;
  tipo_imovel: string;
  qtd_quartos: number;
  qtd_banheiros: number;
  observacoes: string;
  origem: string;
  codigo_ref: string;
  link_click_id: string | null;
  em_follow_up: boolean;
  followup_rodadas: number;
  followup_expira_em: string | null;
  intervention_type?: string;
  intervention_at?: string;
  resetado_em?: string | null;
  status: LeadStatus | string;
  corretor_id: string | null;
  primeiro_contato: string;
  ultimo_contato: string;
  conversao_data: string | null;
  created_at: string;
  updated_at: string;
  conversas?: Conversa[];
  corretor?: Corretor;
  comunicacoes?: LeadCommunication[];
  atribuicoes?: LeadAssignment[];
  followups?: LeadFollowup[];
}

export interface StatsData {
  total: number;
  novos: number;
  em_atendimento: number;
  convertidos: number;
  perdidos: number;
}

export interface Conversa {
  id: string;
  lead_id: string;
  status: string;
  started_at: string;
  ended_at: string | null;
  message_count: number;
}

export interface Mensagem {
  id: string;
  conversa_id: string;
  tipo: "TEXTO" | "IMAGEM" | "AUDIO" | "VIDEO" | "DOCUMENTO";
  conteudo: string;
  direcao: "ENTRADA" | "SAIDA";
  midia_url?: string;
  timestamp: string;
}

export interface Note {
  id: string;
  lead_id: string;
  content: string;
  author_id: string;
  author_name: string;
  created_at: string;
  type: "observation" | "visit" | "follow_up" | "urgent";
}

export interface Corretor {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  especialidade: string;
}

export interface LeadFormValues {
  nome_completo: string;
  telefone: string;
  email: string;
  status: LeadStatus;
  localizacao: string;
  origem: string;
  tipo_interesse: string;
  renda_comprovada: number;
  observacoes: string;
}

export interface LeadFilterOptions {
  status?: LeadStatus;
  origem?: string;
  corretor_id?: string;
  dateFrom?: string;
  dateTo?: string;
  minRenda?: number;
  maxRenda?: number;
  temEntrada?: boolean;
  temCarteira?: boolean;
  search?: string;
  sortBy?: "created_at" | "updated_at" | "nome_completo" | "renda_comprovada" | "ultimo_contato";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface LeadCommunication {
  id: string;
  lead_id: string;
  type: "email" | "whatsapp" | "sms" | "meeting" | "note";
  direction: "inbound" | "outbound";
  subject?: string;
  content: string;
  scheduled_at?: string;
  completed_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface LeadAssignment {
  id: string;
  lead_id: string;
  corretor_id: string;
  assigned_at: string;
  assigned_by?: string;
  status: "active" | "completed" | "transferred";
  notes?: string;
}

export interface LeadFollowup {
  id: string;
  lead_id: string;
  type: "email" | "whatsapp" | "meeting";
  scheduled_at: string;
  completed_at?: string;
  notes?: string;
  status: "pending" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
}

export interface LeadOperationalStatus {
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

export interface HumanInterventionStatus {
  lead_id: string;
  telefone: string;
  intervention_type: string;
  conversation_state: string;
  intervention_at: string | null;
  intervention_by: string | null;
  em_follow_up: boolean;
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
  updated_at: string;
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
  clicks: number;
  leads_convertidos: number;
  ativo: boolean;
  created_at: string;
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
  score_prontidao_bucket: "baixo" | "medio" | "alto";
  score_potencial_comercial: number;
  score_potencial_bucket: "baixo" | "medio" | "alto";
  updated_at: string;
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