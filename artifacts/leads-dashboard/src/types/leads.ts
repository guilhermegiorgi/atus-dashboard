import type { LeadStats } from "@/types/dashboard";

export const LEAD_STATUSES = [
  "NOVO",
  "EM_ATENDIMENTO",
  "CONVERTIDO",
  "PERDIDO",
  "AGUARDANDO_RETORNO",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export interface Lead {
  id: string;
  uuid?: string;
  telefone: string;
  nome_completo: string;
  estado_civil?: string;
  email?: string;
  aniversario: string | null;
  tem_entrada?: boolean;
  entrada?: number;
  renda_comprovada?: number;
  renda_comprovada_conjuge?: number;
  fgts?: number;
  fgts_conjuge?: number;
  tem_carteira_assinada?: boolean;
  tipo_interesse?: string;
  localizacao?: string;
  fixa_preco_min?: number;
  fixa_preco_max?: number;
  tipo_imovel?: string;
  qtd_quartos?: number;
  qtd_banheiros?: number;
  observacoes?: string;
  origem?: string;
  canal_origem?: string;
  sistema_origem?: string;
  campanha_origem?: string;
  origem_detalhada?: string;
  external_lead_id?: string;
  resumo_qualificacao?: string;
  fase?: string;
  codigo_ref?: string;
  tracked_codigo_ref?: string;
  link_click_id?: string | null;
  conversation_state?: string;
  em_follow_up: boolean;
  em_followup?: boolean;
  followup_rodadas?: number;
  followup_expira_em?: string | null;
  intervention_type?: string;
  intervention_at?: string;
  resetado_em?: string | null;
  status: LeadStatus | string;
  corretor_id?: string | null;
  primeiro_contato?: string;
  ultimo_contato?: string;
  conversao_data?: string | null;
  created_at: string;
  updated_at: string;
  conversas?: Conversa[];
  corretor?: Corretor;
  comunicacoes?: LeadCommunication[];
  atribuicoes?: LeadAssignment[];
  followups?: LeadFollowup[];
}

export type StatsData = LeadStats;

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
  status?: LeadStatus;
  localizacao?: string;
  origem?: string;
  tipo_interesse: string;
  campanha_origem?: string;
  mensagem_inicial?: string;
  estado_civil?: string;
  aniversario?: string;
  renda_comprovada?: number;
  renda_comprovada_conjuge?: number;
  fgts?: number;
  fgts_conjuge?: number;
  tem_entrada?: boolean;
  entrada?: number;
  tem_carteira_assinada?: boolean;
  observacoes?: string;
}

export interface LeadListFilters {
  status?: LeadStatus;
  fase?: string;
  em_follow_up?: boolean;
  tipo_interesse?: string;
  has_nome?: boolean;
  has_email?: boolean;
  canal_origem?: string;
  sistema_origem?: string;
  limit?: number;
  offset?: number;
  search?: string;
  origem?: string;
  corretor_id?: string;
  dateFrom?: string;
  dateTo?: string;
  minRenda?: number;
  maxRenda?: number;
  temEntrada?: boolean;
  temCarteira?: boolean;
  sortBy?:
    | "created_at"
    | "updated_at"
    | "nome_completo"
    | "renda_comprovada"
    | "ultimo_contato";
  sortOrder?: "asc" | "desc";
  page?: number;
}

export type LeadFilterOptions = LeadListFilters;

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

// ============ TAGS ============
export interface Tag {
  id: string;
  name: string;
  color: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateTagValues {
  name: string;
  color?: string;
}

export interface UpdateTagValues {
  name?: string;
  color?: string;
}

// ============ USERS ============
export type UserRole = "owner" | "admin" | "corretor" | "viewer";
export type UserStatus = "active" | "inactive";

export interface User {
  id: string;
  email: string;
  nome: string;
  telefone?: string;
  role: UserRole;
  ativo: boolean;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateUserValues {
  email: string;
  nome: string;
  telefone?: string;
  role: UserRole;
  senha: string;
}

export interface UpdateUserValues {
  nome?: string;
  email?: string;
  telefone?: string;
  role?: UserRole;
  ativo?: boolean;
}

export interface UpdateUserStatusValues {
  ativo: boolean;
}

export interface UserNotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  notification_types: {
    new_lead: boolean;
    lead_conversion: boolean;
    follow_up_reminder: boolean;
    intervention_alert: boolean;
  };
}

// ============ FEATURE FLAGS (Lead) ============
export interface LeadFlag {
  nome: string;
  valor: boolean;
  descricao?: string;
  lead_id?: string;
  updated_at?: string;
}

export interface SetLeadFlagValues {
  enabled: boolean;
}

// ============ FEATURE FLAGS (Global) ============
export interface GlobalFlag {
  nome: string;
  valor: boolean;
  descricao?: string;
  updated_at?: string;
}

export interface SetGlobalFlagValues {
  value: boolean;
  descricao?: string;
}
