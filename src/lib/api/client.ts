import {
  ApiResponse,
  Conversa,
  Corretor,
  Lead,
  LeadFormValues,
  StatsData,
} from "@/types/leads";

const API_BASE_URL = "";

class AtusAPI {
  private getHeaders() {
    return {
      "Content-Type": "application/json",
    };
  }

  private extractData<T>(payload: unknown): T {
    if (payload && typeof payload === "object" && "data" in payload) {
      return (payload as { data: T }).data;
    }

    return payload as T;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const headers = {
        ...this.getHeaders(),
        ...(options.headers || {}),
      };
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const raw = await response.text();
      const payload = raw ? JSON.parse(raw) : null;

      if (!response.ok) {
        return {
          error:
            (payload &&
              typeof payload === "object" &&
              ((payload as { error?: string }).error ||
                (payload as { message?: string }).message)) ||
            "Erro na requisição",
        };
      }

      return {
        data: payload === null ? undefined : this.extractData<T>(payload),
        message:
          payload && typeof payload === "object" && "message" in payload
            ? (payload as { message?: string }).message
            : undefined,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  async getLeads(status?: string): Promise<ApiResponse<Lead[]>> {
    const params = status ? `?status=${status}` : "";
    return this.request<Lead[]>(`/api/v1/leads${params}`);
  }

  async getLeadById(id: string): Promise<ApiResponse<Lead>> {
    return this.request<Lead>(`/api/v1/leads/${id}`);
  }

  async updateLead(id: string, data: Partial<Lead>): Promise<ApiResponse<Lead>> {
    return this.request<Lead>(`/api/v1/leads/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteLead(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/v1/leads/${id}`, {
      method: "DELETE",
    });
  }

  async getLeadConversations(id: string): Promise<ApiResponse<Conversa[]>> {
    return this.request<Conversa[]>(`/api/v1/leads/${id}/conversas`);
  }

  async getLeadsStats(): Promise<ApiResponse<StatsData>> {
    return this.request<StatsData>("/api/v1/stats/leads");
  }

  async getCorretores(): Promise<ApiResponse<Corretor[]>> {
    return this.request<Corretor[]>("/api/v1/corretores");
  }

  async createCorretor(data: Omit<Corretor, "id">): Promise<ApiResponse<Corretor>> {
    return this.request<Corretor>("/api/v1/corretores", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateCorretor(id: string, data: Partial<Corretor>): Promise<ApiResponse<Corretor>> {
    return this.request<Corretor>(`/api/v1/corretores/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async getLeadByPhone(telefone: string): Promise<ApiResponse<Lead>> {
    return this.request<Lead>(`/api/mcp/lead/${telefone}`);
  }

  async createLead(data: LeadFormValues): Promise<ApiResponse<Lead>> {
    return this.request<Lead>("/api/mcp/lead", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getStats(): Promise<ApiResponse<StatsData>> {
    return this.request<StatsData>("/api/mcp/stats");
  }
}

export const api = new AtusAPI();
export type { Lead, StatsData, Corretor, Conversa, ApiResponse };
