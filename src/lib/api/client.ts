import {
  AnalyticsOverview,
  FlowMetrics,
  FollowupMetrics,
  LeadStats,
  SlaMetrics,
} from "@/types/dashboard";
import { ApiResult, PaginatedResponse } from "@/types/api";
import {
  Conversa,
  Corretor,
  Lead,
  LeadFilterOptions,
  LeadFormValues,
  LeadListFilters,
  Mensagem,
  Note,
  StatsData,
} from "@/types/leads";
import {
  buildInboundLeadPayload,
  buildLeadFiltersQuery,
  buildLeadUpdatePayload,
  normalizeLead,
} from "@/lib/api/leads";

const API_BASE_URL = "";

class AtusAPI {
  private getHeaders() {
    return {
      "Content-Type": "application/json",
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResult<T>> {
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
        data: payload === null ? undefined : (payload as T),
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

  async getPaginatedLeads(
    filters: LeadListFilters = {}
  ): Promise<ApiResult<PaginatedResponse<Lead>>> {
    const query = buildLeadFiltersQuery(filters);
    const response = await this.request<PaginatedResponse<Record<string, unknown>>>(
      `/api/internal/leads${query.size ? `?${query.toString()}` : ""}`
    );

    if (response.error || !response.data) {
      return {
        error: response.error,
        message: response.message,
      };
    }

    return {
      data: {
        data: response.data.data.map(normalizeLead),
        meta: response.data.meta,
      },
      message: response.message,
    };
  }

  async getLeads(filters: LeadFilterOptions = {}): Promise<ApiResult<Lead[]>> {
    const response = await this.getPaginatedLeads(filters);

    if (response.error || !response.data) {
      return {
        error: response.error,
        message: response.message,
      };
    }

    return {
      data: response.data.data,
      message: response.message,
    };
  }

  async getLeadById(id: string): Promise<ApiResult<Lead>> {
    const response = await this.request<{ data: Record<string, unknown> }>(
      `/api/internal/leads/${id}`
    );

    if (response.error || !response.data) {
      return {
        error: response.error,
        message: response.message,
      };
    }

    return {
      data: normalizeLead(response.data.data),
      message: response.message,
    };
  }

  async updateLead(id: string, values: LeadFormValues): Promise<ApiResult<Lead>> {
    const response = await this.request<{ data: Record<string, unknown> }>(
      `/api/internal/leads/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(buildLeadUpdatePayload(values)),
      }
    );

    if (response.error || !response.data) {
      return {
        error: response.error,
        message: response.message,
      };
    }

    return {
      data: normalizeLead(response.data.data),
      message: response.message,
    };
  }

  async deleteLead(id: string): Promise<ApiResult<void>> {
    return this.request<void>(`/api/internal/leads/${id}`, {
      method: "DELETE",
    });
  }

  async createLead(values: LeadFormValues): Promise<ApiResult<Lead>> {
    const response = await this.request<{ data: Record<string, unknown> }>(
      "/api/internal/inbound/leads",
      {
        method: "POST",
        body: JSON.stringify(buildInboundLeadPayload(values)),
      }
    );

    if (response.error || !response.data) {
      return {
        error: response.error,
        message: response.message,
      };
    }

    return {
      data: normalizeLead(response.data.data),
      message: response.message,
    };
  }

  async updateLeadPartial(
    id: string,
    data: Partial<Lead>
  ): Promise<ApiResult<Lead>> {
    const response = await this.request<{ data: Record<string, unknown> }>(
      `/api/internal/leads/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );

    if (response.error || !response.data) {
      return {
        error: response.error,
        message: response.message,
      };
    }

    return {
      data: normalizeLead(response.data.data),
      message: response.message,
    };
  }

  // Conversations & Messages
  async getLeadConversations(id: string): Promise<ApiResult<Conversa[]>> {
    return this.request<Conversa[]>(`/api/v1/leads/${id}/conversas`);
  }

  async getConversationMessages(conversaId: string, limit = 50, before?: string): Promise<ApiResult<{
    data: Mensagem[];
    total: number;
    has_more: boolean;
  }>> {
    const params = new URLSearchParams();
    params.append("limit", String(limit));
    if (before) params.append("before", before);
    return this.request(`/api/v1/conversas/${conversaId}/mensagens?${params.toString()}`);
  }

  async sendWhatsAppMessage(id: string, mensagem: string, followUp = false): Promise<ApiResult<{ success: boolean; message_id: string; status: string }>> {
    return this.request(`/api/v1/leads/${id}/send-message`, {
      method: "POST",
      body: JSON.stringify({ mensagem, follow_up: followUp }),
    });
  }

  // Follow-up Intervention
  async interveneLead(id: string, type: "HUMAN_TAKEOVER" | "PAUSED" | "URGENT", reason?: string): Promise<ApiResult<{ success: boolean; lead_id: string; status: string }>> {
    return this.request(`/api/v1/leads/${id}/intervene`, {
      method: "POST",
      body: JSON.stringify({ type, reason }),
    });
  }

  async releaseLeadFollowup(id: string): Promise<ApiResult<{ success: boolean; lead_id: string; status: string }>> {
    return this.request(`/api/v1/leads/${id}/release-followup`, {
      method: "POST",
    });
  }

  async getLeadFollowupStatus(id: string): Promise<ApiResult<{
    em_follow_up?: boolean;
    followup_rodadas?: number;
    followup_expira_em?: string | null;
    intervention_type?: string;
    active?: boolean;
    is_paused?: boolean;
  }>> {
    return this.request(`/api/v1/leads/${id}/follow-up-status`);
  }

  // Notes
  async getLeadNotes(id: string): Promise<ApiResult<Note[]>> {
    return this.request<Note[]>(`/api/v1/leads/${id}/notes`);
  }

  async createLeadNote(id: string, content: string, type: "observation" | "visit" | "follow_up" | "urgent"): Promise<ApiResult<Note>> {
    return this.request<Note>(`/api/v1/leads/${id}/notes`, {
      method: "POST",
      body: JSON.stringify({ content, type }),
    });
  }

  async updateLeadNote(noteId: string, content: string): Promise<ApiResult<Note>> {
    return this.request<Note>(`/api/v1/notes/${noteId}`, {
      method: "PUT",
      body: JSON.stringify({ content }),
    });
  }

  async deleteLeadNote(noteId: string): Promise<ApiResult<void>> {
    return this.request<void>(`/api/v1/notes/${noteId}`, {
      method: "DELETE",
    });
  }

  // Assignment
  async assignLead(id: string, corretorId: string | null, notes?: string): Promise<ApiResult<Lead>> {
    return this.updateLeadPartial(id, {
      corretor_id: corretorId,
      observacoes: notes,
    });
  }

  async updateLeadStatus(id: string, status: string, notes?: string): Promise<ApiResult<Lead>> {
    return this.updateLeadPartial(id, {
      status,
      observacoes: notes,
    });
  }

  async getLeadsStats(): Promise<ApiResult<StatsData>> {
    const response = await this.request<{ data: LeadStats }>("/api/internal/stats/leads");

    if (response.error || !response.data) {
      return {
        error: response.error,
        message: response.message,
      };
    }

    return {
      data: response.data.data,
      message: response.message,
    };
  }

  async getCorretores(): Promise<ApiResult<Corretor[]>> {
    const response = await this.request<{ data: Corretor[] }>("/api/v1/corretores");

    if (response.error || !response.data) {
      return {
        error: response.error,
        message: response.message,
      };
    }

    return {
      data: response.data.data,
      message: response.message,
    };
  }

  async createCorretor(data: Omit<Corretor, "id">): Promise<ApiResult<Corretor>> {
    const response = await this.request<{ data: Corretor }>("/api/v1/corretores", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (response.error || !response.data) {
      return {
        error: response.error,
        message: response.message,
      };
    }

    return {
      data: response.data.data,
      message: response.message,
    };
  }

  async updateCorretor(id: string, data: Partial<Corretor>): Promise<ApiResult<Corretor>> {
    const response = await this.request<{ data: Corretor }>(`/api/v1/corretores/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });

    if (response.error || !response.data) {
      return {
        error: response.error,
        message: response.message,
      };
    }

    return {
      data: response.data.data,
      message: response.message,
    };
  }

  async getLeadByPhone(telefone: string): Promise<ApiResult<Lead>> {
    return this.request<Lead>(`/api/mcp/lead/${telefone}`);
  }

  async getStats(): Promise<ApiResult<StatsData>> {
    return this.request<StatsData>("/api/mcp/stats");
  }

  async getLeadFlowMetrics(): Promise<ApiResult<FlowMetrics>> {
    const response = await this.request<{ data: FlowMetrics }>("/api/internal/metrics/flow");

    if (response.error || !response.data) {
      return {
        error: response.error,
        message: response.message,
      };
    }

    return {
      data: response.data.data,
      message: response.message,
    };
  }

  async getFollowupMetrics(): Promise<ApiResult<FollowupMetrics>> {
    const response = await this.request<{ data: FollowupMetrics }>(
      "/api/internal/metrics/followup"
    );

    if (response.error || !response.data) {
      return {
        error: response.error,
        message: response.message,
      };
    }

    return {
      data: response.data.data,
      message: response.message,
    };
  }

  async getSLAMetrics(): Promise<ApiResult<SlaMetrics>> {
    const response = await this.request<{ data: SlaMetrics }>("/api/internal/metrics/sla");

    if (response.error || !response.data) {
      return {
        error: response.error,
        message: response.message,
      };
    }

    return {
      data: response.data.data,
      message: response.message,
    };
  }

  async getAnalyticsOverview(): Promise<ApiResult<AnalyticsOverview>> {
    const response = await this.request<{ data: AnalyticsOverview }>(
      "/api/internal/analytics/overview"
    );

    if (response.error || !response.data) {
      return {
        error: response.error,
        message: response.message,
      };
    }

    return {
      data: response.data.data,
      message: response.message,
    };
  }
}

export const api = new AtusAPI();
export type { Lead, StatsData, Corretor, Conversa, ApiResult };
