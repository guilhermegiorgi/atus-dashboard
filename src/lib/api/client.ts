const API_BASE_URL = '';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'atus-mcp-api-key-2026';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

interface Lead {
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
}

interface StatsData {
  total: number;
  novos: number;
  em_atendimento: number;
  convertidos: number;
  perdidos: number;
}

interface Corretor {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  especialidade: string;
}

interface Conversa {
  id: string;
  lead_id: string;
  mensagem: string;
  resposta: string;
  created_at: string;
}

class AtusAPI {
  private getHeaders() {
    return {
      'x-api-key': API_KEY,
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || data.message || 'Erro na requisição',
        };
      }

      return { data };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  // Leads
  async getLeads(status?: string): Promise<ApiResponse<Lead[]>> {
    const params = status ? `?status=${status}` : '';
    return this.request<Lead[]>(`/api/v1/leads${params}`);
  }

  async getLeadById(id: string): Promise<ApiResponse<Lead>> {
    return this.request<Lead>(`/api/v1/leads/${id}`);
  }

  async updateLead(id: string, data: Partial<Lead>): Promise<ApiResponse<Lead>> {
    return this.request<Lead>(`/api/v1/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteLead(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/v1/leads/${id}`, {
      method: 'DELETE',
    });
  }

  async getLeadConversations(id: string): Promise<ApiResponse<Conversa[]>> {
    return this.request<Conversa[]>(`/api/v1/leads/${id}/conversas`);
  }

  // Stats
  async getLeadsStats(): Promise<ApiResponse<StatsData>> {
    return this.request<StatsData>('/api/v1/stats/leads');
  }

  // Corretores
  async getCorretores(): Promise<ApiResponse<Corretor[]>> {
    return this.request<Corretor[]>('/api/v1/corretores');
  }

  async createCorretor(data: Omit<Corretor, 'id'>): Promise<ApiResponse<Corretor>> {
    return this.request<Corretor>('/api/v1/corretores', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCorretor(id: string, data: Partial<Corretor>): Promise<ApiResponse<Corretor>> {
    return this.request<Corretor>(`/api/v1/corretores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // MCP
  async getLeadByPhone(telefone: string): Promise<ApiResponse<Lead>> {
    return this.request<Lead>(`/api/mcp/lead-phone/${telefone}`);
  }

  async createLead(data: Omit<Lead, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Lead>> {
    return this.request<Lead>('/mcp/lead', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getStats(): Promise<ApiResponse<StatsData>> {
    return this.request<StatsData>('/mcp/stats');
  }
}

export const api = new AtusAPI();
export type { Lead, StatsData, Corretor, Conversa, ApiResponse };