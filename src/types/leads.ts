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
  em_followup: boolean;
  followup_rodadas: number;
  followup_expira_em: string | null;
  status: string;
  corretor_id: string | null;
  primeiro_contato: string;
  ultimo_contato: string;
  conversao_data: string | null;
  created_at: string;
  updated_at: string;
  conversas: Conversa[];
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
  started_at: string;
  ended_at: string | null;
  status: string;
  contexto: string;
  created_at: string;
  updated_at: string;
}