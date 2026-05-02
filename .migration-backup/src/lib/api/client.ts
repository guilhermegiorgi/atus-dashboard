import {
  AnalyticsFilters,
  AnalyticsGroupedRow,
  AnalyticsLeadRow,
  AnalyticsOverview,
  AnalyticsTimeseriesPoint,
  CreateTrackedLinkValues,
  FlowMetrics,
  FollowupMetrics,
  FollowupQueueFilters,
  InboxConversationDetail,
  InboxConversationFilters,
  InboxConversationSummary,
  LeadHumanIntervention,
  LeadAction,
  LeadStats,
  LinkStats,
  OperationalQueueItem,
  OperationalStatus,
  SlaMetrics,
  TrackedLink,
  TrackedLinksFilters,
  UpdateTrackedLinkValues,
  LeadResetResult,
  LeadResetValues,
} from "@/types/dashboard";
import { ApiResult, PaginatedResponse } from "@/types/api";
import {
  Conversa,
  Corretor,
  Lead,
  LeadFilterOptions,
  LeadFormValues,
  LeadListFilters,
  LeadFlag,
  GlobalFlag,
  Mensagem,
  Note,
  StatsData,
  Tag,
  CreateTagValues,
  UpdateTagValues,
  User,
  CreateUserValues,
  UpdateUserValues,
  UpdateUserStatusValues,
  UserNotificationSettings,
  SetLeadFlagValues,
  SetGlobalFlagValues,
} from "@/types/leads";
import {
  buildInboundLeadPayload,
  buildLeadFiltersQuery,
  buildLeadUpdatePayload,
  normalizeLead,
} from "@/lib/api/leads";
import {
  normalizeLeadConversation,
  normalizeLeadConversationMessage,
  normalizeLeadHumanIntervention,
} from "@/lib/leads/detail";
import {
  buildFollowupQueueQuery,
  normalizeOperationalQueueItem,
  normalizeOperationalStatus,
} from "@/lib/pipeline/queue";
import {
  buildAnalyticsQuery,
  normalizeAnalyticsGroupedRow,
  normalizeAnalyticsLeadRow,
  normalizeAnalyticsTimeseriesPoint,
} from "@/lib/analytics/reports";
import {
  buildInboxConversationsQuery,
  normalizeInboxConversationDetail,
  normalizeInboxConversationSummary,
} from "@/lib/inbox/conversations";
import {
  buildTrackedLinkPayload,
  buildTrackedLinksQuery,
  normalizeTrackedLink,
} from "@/lib/tracking/tracked-links";

function buildRequestUrl(endpoint: string) {
  if (/^https?:\/\//.test(endpoint)) {
    return endpoint;
  }

  return endpoint;
}

class AtusAPI {
  private getHeaders(options: RequestInit) {
    const headers = new Headers(options.headers);

    if (options.body !== undefined && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResult<T>> {
    try {
      const url = buildRequestUrl(endpoint);
      const headers = this.getHeaders(options);
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
    filters: LeadListFilters = {},
  ): Promise<ApiResult<PaginatedResponse<Lead>>> {
    const query = buildLeadFiltersQuery(filters);
    const response = await this.request<
      PaginatedResponse<Record<string, unknown>>
    >(`/api/internal/leads${query.size ? `?${query.toString()}` : ""}`);

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
      `/api/internal/leads/${id}`,
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

  async updateLead(
    id: string,
    values: LeadFormValues,
  ): Promise<ApiResult<Lead>> {
    const response = await this.request<{ data: Record<string, unknown> }>(
      `/api/internal/leads/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(buildLeadUpdatePayload(values)),
      },
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
      },
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
    data: Partial<Lead>,
  ): Promise<ApiResult<Lead>> {
    const response = await this.request<{ data: Record<string, unknown> }>(
      `/api/internal/leads/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
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
    const response = await this.request<{ data: Record<string, unknown>[] }>(
      `/api/internal/leads/${id}/conversas`,
    );

    if (response.error || !response.data) {
      return {
        error: response.error,
        message: response.message,
      };
    }

    return {
      data: response.data.data.map(normalizeLeadConversation),
      message: response.message,
    };
  }

  async getConversationMessages(
    conversaId: string,
    limit = 50,
    before?: string,
  ): Promise<
    ApiResult<{
      data: Mensagem[];
      total: number;
      has_more: boolean;
    }>
  > {
    const params = new URLSearchParams();
    params.append("limit", String(limit));
    if (before) params.append("before", before);
    const response = await this.request<{
      data: Record<string, unknown>[];
      total?: number;
      has_more?: boolean;
    }>(`/api/internal/conversas/${conversaId}/mensagens?${params.toString()}`);

    if (response.error || !response.data) {
      return {
        error: response.error,
        message: response.message,
      };
    }

    return {
      data: {
        data: response.data.data.map(normalizeLeadConversationMessage),
        total: response.data.total ?? response.data.data.length,
        has_more: response.data.has_more ?? false,
      },
      message: response.message,
    };
  }

  async getLeadHumanIntervention(
    id: string,
  ): Promise<ApiResult<LeadHumanIntervention>> {
    const response = await this.request<{ data: Record<string, unknown> }>(
      `/api/internal/leads/${id}/human-intervention`,
    );

    if (response.error || !response.data) {
      return {
        error: response.error,
        message: response.message,
      };
    }

    return {
      data: normalizeLeadHumanIntervention(response.data.data),
      message: response.message,
    };
  }

  async sendWhatsAppMessage(
    id: string,
    mensagem: string,
    followUp = false,
  ): Promise<
    ApiResult<{ success: boolean; message_id: string; status: string }>
  > {
    return this.request(`/api/v1/leads/${id}/send-message`, {
      method: "POST",
      body: JSON.stringify({ mensagem, follow_up: followUp }),
    });
  }

  // Follow-up Intervention
  async interveneLead(
    id: string,
    type: "HUMAN_TAKEOVER" | "PAUSED" | "URGENT",
    reason?: string,
  ): Promise<ApiResult<{ success: boolean; lead_id: string; status: string }>> {
    return this.request(`/api/v1/leads/${id}/intervene`, {
      method: "POST",
      body: JSON.stringify({ type, reason }),
    });
  }

  async releaseLeadFollowup(
    id: string,
  ): Promise<ApiResult<{ success: boolean; lead_id: string; status: string }>> {
    return this.request(`/api/v1/leads/${id}/release-followup`, {
      method: "POST",
    });
  }

  async getLeadFollowupStatus(id: string): Promise<
    ApiResult<{
      em_follow_up?: boolean;
      followup_rodadas?: number;
      followup_expira_em?: string | null;
      intervention_type?: string;
      active?: boolean;
      is_paused?: boolean;
    }>
  > {
    return this.request(`/api/v1/leads/${id}/follow-up-status`);
  }

  // Notes
  async getLeadNotes(id: string): Promise<ApiResult<Note[]>> {
    return this.request<Note[]>(`/api/v1/leads/${id}/notes`);
  }

  async createLeadNote(
    id: string,
    content: string,
    type: "observation" | "visit" | "follow_up" | "urgent",
  ): Promise<ApiResult<Note>> {
    return this.request<Note>(`/api/v1/leads/${id}/notes`, {
      method: "POST",
      body: JSON.stringify({ content, type }),
    });
  }

  async updateLeadNote(
    noteId: string,
    content: string,
  ): Promise<ApiResult<Note>> {
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
  async assignLead(
    id: string,
    corretorId: string | null,
    notes?: string,
  ): Promise<ApiResult<Lead>> {
    return this.updateLeadPartial(id, {
      corretor_id: corretorId,
      observacoes: notes,
    });
  }

  async updateLeadStatus(
    id: string,
    status: string,
    notes?: string,
  ): Promise<ApiResult<Lead>> {
    return this.updateLeadPartial(id, {
      status,
      observacoes: notes,
    });
  }

  async getLeadsStats(): Promise<ApiResult<StatsData>> {
    const response = await this.request<{ data: LeadStats }>(
      "/api/internal/stats/leads",
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

  async getCorretores(): Promise<ApiResult<Corretor[]>> {
    const response = await this.request<{ data: Corretor[] }>(
      "/api/v1/corretores",
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

  async createCorretor(
    data: Omit<Corretor, "id">,
  ): Promise<ApiResult<Corretor>> {
    const response = await this.request<{ data: Corretor }>(
      "/api/v1/corretores",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
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

  async updateCorretor(
    id: string,
    data: Partial<Corretor>,
  ): Promise<ApiResult<Corretor>> {
    const response = await this.request<{ data: Corretor }>(
      `/api/v1/corretores/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
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

  async getLeadByPhone(telefone: string): Promise<ApiResult<Lead>> {
    return this.request<Lead>(`/api/mcp/lead/${telefone}`);
  }

  async getStats(): Promise<ApiResult<StatsData>> {
    return this.request<StatsData>("/api/mcp/stats");
  }

  async getLeadFlowMetrics(): Promise<ApiResult<FlowMetrics>> {
    const response = await this.request<{ data: FlowMetrics }>(
      "/api/internal/metrics/flow",
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

  async getFollowupMetrics(): Promise<ApiResult<FollowupMetrics>> {
    const response = await this.request<{ data: FollowupMetrics }>(
      "/api/internal/metrics/followup",
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

  async getFollowupQueue(
    filters: FollowupQueueFilters = {},
  ): Promise<ApiResult<PaginatedResponse<OperationalQueueItem>>> {
    const query = buildFollowupQueueQuery(filters);
    const response = await this.request<
      PaginatedResponse<Record<string, unknown>>
    >(
      `/api/internal/leads/followup-queue${query.size ? `?${query.toString()}` : ""}`,
    );

    if (response.error || !response.data) {
      return {
        error: response.error,
        message: response.message,
      };
    }

    return {
      data: {
        data: response.data.data.map(normalizeOperationalQueueItem),
        meta: response.data.meta,
      },
      message: response.message,
    };
  }

  async getLeadOperationalStatus(
    id: string,
  ): Promise<ApiResult<OperationalStatus>> {
    const response = await this.request<{ data: Record<string, unknown> }>(
      `/api/internal/leads/${id}/operational-status`,
    );

    if (response.error || !response.data) {
      return {
        error: response.error,
        message: response.message,
      };
    }

    return {
      data: normalizeOperationalStatus(response.data.data),
      message: response.message,
    };
  }

  async getLeadActions(
    id: string,
    limit = 20,
    offset = 0,
  ): Promise<ApiResult<PaginatedResponse<LeadAction>>> {
    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
    });
    const response = await this.request<PaginatedResponse<LeadAction>>(
      `/api/internal/leads/${id}/actions?${params.toString()}`,
    );

    if (response.error || !response.data) {
      return {
        error: response.error,
        message: response.message,
      };
    }

    return {
      data: response.data,
      message: response.message,
    };
  }

  async getInboxConversations(
    filters: InboxConversationFilters = {},
  ): Promise<ApiResult<PaginatedResponse<InboxConversationSummary>>> {
    const query = buildInboxConversationsQuery(filters);
    const response = await this.request<
      PaginatedResponse<Record<string, unknown>>
    >(
      `/api/internal/inbox/conversations${query.size ? `?${query.toString()}` : ""}`,
    );

    if (response.error || !response.data) {
      return {
        error: response.error,
        message: response.message,
      };
    }

    return {
      data: {
        data: response.data.data.map(normalizeInboxConversationSummary),
        meta: response.data.meta,
      },
      message: response.message,
    };
  }

  async getInboxConversationDetail(
    leadId: string,
  ): Promise<ApiResult<InboxConversationDetail>> {
    const response = await this.request<{ data: Record<string, unknown> }>(
      `/api/internal/inbox/conversations/${leadId}`,
    );

    if (response.error || !response.data) {
      return {
        error: response.error,
        message: response.message,
      };
    }

    return {
      data: normalizeInboxConversationDetail(response.data.data),
      message: response.message,
    };
  }

  async sendInboxMessage(
    leadId: string,
    body: {
      message: string;
      actor_name: string;
      actor_type: string;
      introduce_actor?: boolean;
    },
  ): Promise<ApiResult<{ success: boolean }>> {
    return this.request(
      `/api/internal/inbox/conversations/${leadId}/messages`,
      {
        method: "POST",
        body: JSON.stringify(body),
      },
    );
  }

  // Send Media (WhatsApp)
  async sendWhatsAppMedia(
    phone: string,
    mediaType: "image" | "audio" | "document",
    mediaBase64: string,
    options?: { fileName?: string; caption?: string },
  ): Promise<ApiResult<{ success: boolean; id: string }>> {
    return this.request(`/api/v1/whatsapp/send-media`, {
      method: "POST",
      body: JSON.stringify({
        Phone: phone,
        ...(mediaType === "image" && {
          Image: mediaBase64,
          Caption: options?.caption,
        }),
        ...(mediaType === "audio" && { Audio: mediaBase64 }),
        ...(mediaType === "document" && {
          Document: mediaBase64,
          FileName: options?.fileName,
          Caption: options?.caption,
        }),
      }),
    });
  }

  async sendWhatsAppImage(
    phone: string,
    imageBase64: string,
    caption?: string,
  ): Promise<ApiResult<{ success: boolean; id: string }>> {
    return this.sendWhatsAppMedia(phone, "image", imageBase64, { caption });
  }

  async sendWhatsAppAudio(
    phone: string,
    audioBase64: string,
  ): Promise<ApiResult<{ success: boolean; id: string }>> {
    return this.sendWhatsAppMedia(phone, "audio", audioBase64);
  }

  async sendWhatsAppDocument(
    phone: string,
    documentBase64: string,
    fileName: string,
    caption?: string,
  ): Promise<ApiResult<{ success: boolean; id: string }>> {
    return this.sendWhatsAppMedia(phone, "document", documentBase64, {
      fileName,
      caption,
    });
  }

  async assignInboxConversation(
    leadId: string,
    body: {
      assigned_corretor_id: string;
      assigned_by: string;
      note?: string;
    },
  ): Promise<ApiResult<{ success: boolean }>> {
    return this.request(`/api/internal/inbox/conversations/${leadId}/assign`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async updateInboxConversationState(
    leadId: string,
    body: {
      state: string;
      actor_name: string;
      reason?: string;
    },
  ): Promise<ApiResult<{ success: boolean }>> {
    return this.request(`/api/internal/inbox/conversations/${leadId}/state`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async returnInboxConversationToBot(
    leadId: string,
    body: {
      actor_name: string;
      reason?: string;
    },
  ): Promise<ApiResult<{ success: boolean }>> {
    return this.request(
      `/api/internal/inbox/conversations/${leadId}/return-to-bot`,
      {
        method: "POST",
        body: JSON.stringify(body),
      },
    );
  }

  async getSLAMetrics(): Promise<ApiResult<SlaMetrics>> {
    const response = await this.request<{ data: SlaMetrics }>(
      "/api/internal/metrics/sla",
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

  async getAnalyticsOverview(
    filters: AnalyticsFilters = {},
  ): Promise<ApiResult<AnalyticsOverview>> {
    const query = buildAnalyticsQuery(filters);
    const response = await this.request<{ data: AnalyticsOverview }>(
      `/api/internal/analytics/overview${query.size ? `?${query.toString()}` : ""}`,
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

  async getAnalyticsTimeseries(
    filters: AnalyticsFilters = {},
  ): Promise<ApiResult<AnalyticsTimeseriesPoint[]>> {
    const query = buildAnalyticsQuery(filters);
    const response = await this.request<{ data: Record<string, unknown>[] }>(
      `/api/internal/analytics/timeseries${query.size ? `?${query.toString()}` : ""}`,
    );

    if (response.error || !response.data) {
      return {
        error: response.error,
        message: response.message,
      };
    }

    return {
      data: response.data.data.map(normalizeAnalyticsTimeseriesPoint),
      message: response.message,
    };
  }

  async getAnalyticsSources(
    filters: AnalyticsFilters = {},
  ): Promise<ApiResult<AnalyticsGroupedRow[]>> {
    const query = buildAnalyticsQuery(filters);
    const response = await this.request<{ data: Record<string, unknown>[] }>(
      `/api/internal/analytics/sources${query.size ? `?${query.toString()}` : ""}`,
    );

    if (response.error || !response.data) {
      return {
        error: response.error,
        message: response.message,
      };
    }

    return {
      data: response.data.data.map(normalizeAnalyticsGroupedRow),
      message: response.message,
    };
  }

  async getAnalyticsCampaigns(
    filters: AnalyticsFilters = {},
  ): Promise<ApiResult<AnalyticsGroupedRow[]>> {
    const query = buildAnalyticsQuery(filters);
    const response = await this.request<{ data: Record<string, unknown>[] }>(
      `/api/internal/analytics/campaigns${query.size ? `?${query.toString()}` : ""}`,
    );

    if (response.error || !response.data) {
      return {
        error: response.error,
        message: response.message,
      };
    }

    return {
      data: response.data.data.map(normalizeAnalyticsGroupedRow),
      message: response.message,
    };
  }

  async getAnalyticsCorretors(
    filters: AnalyticsFilters = {},
  ): Promise<ApiResult<AnalyticsGroupedRow[]>> {
    const query = buildAnalyticsQuery(filters);
    const response = await this.request<{ data: Record<string, unknown>[] }>(
      `/api/internal/analytics/corretors${query.size ? `?${query.toString()}` : ""}`,
    );

    if (response.error || !response.data) {
      return {
        error: response.error,
        message: response.message,
      };
    }

    return {
      data: response.data.data.map(normalizeAnalyticsGroupedRow),
      message: response.message,
    };
  }

  async getAnalyticsLeads(
    filters: AnalyticsFilters = {},
  ): Promise<ApiResult<PaginatedResponse<AnalyticsLeadRow>>> {
    const query = buildAnalyticsQuery(filters);
    const response = await this.request<
      PaginatedResponse<Record<string, unknown>>
    >(
      `/api/internal/analytics/leads${query.size ? `?${query.toString()}` : ""}`,
    );

    if (response.error || !response.data) {
      return {
        error: response.error,
        message: response.message,
      };
    }

    return {
      data: {
        data: response.data.data.map(normalizeAnalyticsLeadRow),
        meta: response.data.meta,
      },
      message: response.message,
    };
  }

  async getAnalyticsRankingOrigins(
    filters: AnalyticsFilters = {},
  ): Promise<ApiResult<AnalyticsGroupedRow[]>> {
    const query = buildAnalyticsQuery(filters);
    const response = await this.request<{ data: Record<string, unknown>[] }>(
      `/api/internal/analytics/rankings/origins${query.size ? `?${query.toString()}` : ""}`,
    );

    if (response.error || !response.data) {
      return {
        error: response.error,
        message: response.message,
      };
    }

    return {
      data: response.data.data.map(normalizeAnalyticsGroupedRow),
      message: response.message,
    };
  }

  async getAnalyticsRankingCampaigns(
    filters: AnalyticsFilters = {},
  ): Promise<ApiResult<AnalyticsGroupedRow[]>> {
    const query = buildAnalyticsQuery(filters);
    const response = await this.request<{ data: Record<string, unknown>[] }>(
      `/api/internal/analytics/rankings/campaigns${query.size ? `?${query.toString()}` : ""}`,
    );

    if (response.error || !response.data) {
      return {
        error: response.error,
        message: response.message,
      };
    }

    return {
      data: response.data.data.map(normalizeAnalyticsGroupedRow),
      message: response.message,
    };
  }

  async getAnalyticsRankingCorretors(
    filters: AnalyticsFilters = {},
  ): Promise<ApiResult<AnalyticsGroupedRow[]>> {
    const query = buildAnalyticsQuery(filters);
    const response = await this.request<{ data: Record<string, unknown>[] }>(
      `/api/internal/analytics/rankings/corretors${query.size ? `?${query.toString()}` : ""}`,
    );

    if (response.error || !response.data) {
      return {
        error: response.error,
        message: response.message,
      };
    }

    return {
      data: response.data.data.map(normalizeAnalyticsGroupedRow),
      message: response.message,
    };
  }

  async getAnalyticsRankingTriageReady(
    filters: AnalyticsFilters = {},
  ): Promise<ApiResult<PaginatedResponse<AnalyticsLeadRow>>> {
    const query = buildAnalyticsQuery(filters);
    const response = await this.request<
      PaginatedResponse<Record<string, unknown>>
    >(
      `/api/internal/analytics/rankings/triage-ready${query.size ? `?${query.toString()}` : ""}`,
    );

    if (response.error || !response.data) {
      return {
        error: response.error,
        message: response.message,
      };
    }

    return {
      data: {
        data: response.data.data.map(normalizeAnalyticsLeadRow),
        meta: response.data.meta,
      },
      message: response.message,
    };
  }

  async getAnalyticsRankingLeadScores(
    filters: AnalyticsFilters = {},
  ): Promise<ApiResult<PaginatedResponse<AnalyticsLeadRow>>> {
    const query = buildAnalyticsQuery(filters);
    const response = await this.request<
      PaginatedResponse<Record<string, unknown>>
    >(
      `/api/internal/analytics/rankings/lead-scores${query.size ? `?${query.toString()}` : ""}`,
    );

    if (response.error || !response.data) {
      return {
        error: response.error,
        message: response.message,
      };
    }

    return {
      data: {
        data: response.data.data.map(normalizeAnalyticsLeadRow),
        meta: response.data.meta,
      },
      message: response.message,
    };
  }

  async getTrackedLinks(
    filters: TrackedLinksFilters = {},
  ): Promise<ApiResult<TrackedLink[]>> {
    const query = buildTrackedLinksQuery(filters);
    const response = await this.request<{ data: Record<string, unknown>[] }>(
      `/api/internal/tracked-links${query.size ? `?${query.toString()}` : ""}`,
    );

    if (response.error || !response.data) {
      return {
        error: response.error,
        message: response.message,
      };
    }

    return {
      data: response.data.data.map((item) => normalizeTrackedLink(item)),
      message: response.message,
    };
  }

  async getTrackedLink(id: string): Promise<ApiResult<TrackedLink>> {
    const response = await this.request<{
      data: Record<string, unknown>;
      link?: string;
    }>(`/api/internal/tracked-links/${id}`);

    if (response.error || !response.data) {
      return {
        error: response.error,
        message: response.message,
      };
    }

    return {
      data: normalizeTrackedLink(response.data.data, response.data.link),
      message: response.message,
    };
  }

  async createTrackedLink(
    values: CreateTrackedLinkValues,
  ): Promise<ApiResult<TrackedLink>> {
    const response = await this.request<{
      data: Record<string, unknown>;
      link?: string;
    }>("/api/internal/tracked-links", {
      method: "POST",
      body: JSON.stringify(buildTrackedLinkPayload(values)),
    });

    if (response.error || !response.data) {
      return {
        error: response.error,
        message: response.message,
      };
    }

    return {
      data: normalizeTrackedLink(response.data.data, response.data.link),
      message: response.message,
    };
  }

  // ============ TAGS ============
  async getTags(limit = 50, offset = 0): Promise<ApiResult<Tag[]>> {
    const response = await this.request<{ data: Tag[] }>(
      `/api/v1/tags?limit=${limit}&offset=${offset}`,
    );
    return {
      data: response.data?.data || [],
      error: response.error,
      message: response.message,
    };
  }

  async getTag(id: string): Promise<ApiResult<Tag>> {
    const response = await this.request<{ data: Tag }>(`/api/v1/tags/${id}`);
    return {
      data: response.data?.data,
      error: response.error,
      message: response.message,
    };
  }

  async createTag(values: CreateTagValues): Promise<ApiResult<Tag>> {
    const response = await this.request<{ data: Tag }>("/api/v1/tags", {
      method: "POST",
      body: JSON.stringify(values),
    });
    return {
      data: response.data?.data,
      error: response.error,
      message: response.message,
    };
  }

  async updateTag(
    id: string,
    values: UpdateTagValues,
  ): Promise<ApiResult<Tag>> {
    const response = await this.request<{ data: Tag }>(`/api/v1/tags/${id}`, {
      method: "PUT",
      body: JSON.stringify(values),
    });
    return {
      data: response.data?.data,
      error: response.error,
      message: response.message,
    };
  }

  async deleteTag(id: string): Promise<ApiResult<void>> {
    const response = await this.request(`/api/v1/tags/${id}`, {
      method: "DELETE",
    });
    return {
      error: response.error,
      message: response.message,
    };
  }

  // ============ LEAD TAGS ============
  async getLeadTags(leadId: string): Promise<ApiResult<Tag[]>> {
    const response = await this.request<{ data: Tag[] }>(
      `/api/v1/leads/${leadId}/tags`,
    );
    return {
      data: response.data?.data || [],
      error: response.error,
      message: response.message,
    };
  }

  async addLeadTags(
    leadId: string,
    tagIds: string[],
  ): Promise<ApiResult<void>> {
    const response = await this.request(`/api/v1/leads/${leadId}/tags`, {
      method: "POST",
      body: JSON.stringify({ tag_ids: tagIds }),
    });
    return {
      error: response.error,
      message: response.message,
    };
  }

  async removeLeadTag(leadId: string, tagId: string): Promise<ApiResult<void>> {
    const response = await this.request(
      `/api/v1/leads/${leadId}/tags/${tagId}`,
      {
        method: "DELETE",
      },
    );
    return {
      error: response.error,
      message: response.message,
    };
  }

  // ============ LEAD FLAGS ============
  async getLeadFlags(leadId: string): Promise<ApiResult<LeadFlag[]>> {
    const response = await this.request<{ data: LeadFlag[] }>(
      `/api/v1/leads/${leadId}/flags`,
    );
    return {
      data: response.data?.data || [],
      error: response.error,
      message: response.message,
    };
  }

  async setLeadFlag(
    leadId: string,
    flagName: string,
    values: SetLeadFlagValues,
  ): Promise<ApiResult<void>> {
    const response = await this.request(
      `/api/v1/leads/${leadId}/flags/${flagName}`,
      {
        method: "PUT",
        body: JSON.stringify(values),
      },
    );
    return {
      error: response.error,
      message: response.message,
    };
  }

  async removeLeadFlag(
    leadId: string,
    flagName: string,
  ): Promise<ApiResult<void>> {
    const response = await this.request(
      `/api/v1/leads/${leadId}/flags/${flagName}`,
      {
        method: "DELETE",
      },
    );
    return {
      error: response.error,
      message: response.message,
    };
  }

  // ============ GLOBAL FLAGS ============
  async getGlobalFlags(): Promise<ApiResult<GlobalFlag[]>> {
    const response = await this.request<{ data: GlobalFlag[] }>(
      "/api/v1/flags",
    );
    return {
      data: response.data?.data || [],
      error: response.error,
      message: response.message,
    };
  }

  async setGlobalFlag(
    flagName: string,
    values: SetGlobalFlagValues,
  ): Promise<ApiResult<void>> {
    const response = await this.request(`/api/v1/flags/${flagName}`, {
      method: "PUT",
      body: JSON.stringify(values),
    });
    return {
      error: response.error,
      message: response.message,
    };
  }

  async removeGlobalFlag(flagName: string): Promise<ApiResult<void>> {
    const response = await this.request(`/api/v1/flags/${flagName}`, {
      method: "DELETE",
    });
    return {
      error: response.error,
      message: response.message,
    };
  }

  // ============ USERS ============
  async getUsers(
    limit = 20,
    offset = 0,
    role?: string,
    ativo?: boolean,
  ): Promise<ApiResult<User[]>> {
    let url = `/api/v1/users?limit=${limit}&offset=${offset}`;
    if (role) url += `&role=${role}`;
    if (ativo !== undefined) url += `&ativo=${ativo}`;
    const response = await this.request<{ data: User[] }>(url);
    return {
      data: response.data?.data || [],
      error: response.error,
      message: response.message,
    };
  }

  async getUser(id: string): Promise<ApiResult<User>> {
    const response = await this.request<{ data: User }>(`/api/v1/users/${id}`);
    return {
      data: response.data?.data,
      error: response.error,
      message: response.message,
    };
  }

  async createUser(values: CreateUserValues): Promise<ApiResult<User>> {
    const response = await this.request<{ data: User }>("/api/v1/users", {
      method: "POST",
      body: JSON.stringify(values),
    });
    return {
      data: response.data?.data,
      error: response.error,
      message: response.message,
    };
  }

  async updateUser(
    id: string,
    values: UpdateUserValues,
  ): Promise<ApiResult<User>> {
    const response = await this.request<{ data: User }>(`/api/v1/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(values),
    });
    return {
      data: response.data?.data,
      error: response.error,
      message: response.message,
    };
  }

  async deleteUser(id: string): Promise<ApiResult<void>> {
    const response = await this.request(`/api/v1/users/${id}`, {
      method: "DELETE",
    });
    return {
      error: response.error,
      message: response.message,
    };
  }

  async updateUserStatus(
    id: string,
    values: UpdateUserStatusValues,
  ): Promise<ApiResult<User>> {
    const response = await this.request<{ data: User }>(
      `/api/v1/users/${id}/status`,
      {
        method: "PUT",
        body: JSON.stringify(values),
      },
    );
    return {
      data: response.data?.data,
      error: response.error,
      message: response.message,
    };
  }

  async getUserNotifications(
    id: string,
  ): Promise<ApiResult<UserNotificationSettings>> {
    const response = await this.request<{ data: UserNotificationSettings }>(
      `/api/v1/users/${id}/notifications`,
    );
    return {
      data: response.data?.data,
      error: response.error,
      message: response.message,
    };
  }

  async updateUserNotifications(
    id: string,
    values: Partial<UserNotificationSettings>,
  ): Promise<ApiResult<void>> {
    const response = await this.request(`/api/v1/users/${id}/notifications`, {
      method: "PUT",
      body: JSON.stringify(values),
    });
    return {
      error: response.error,
      message: response.message,
    };
  }

  // ============ TRACKED LINKS - UPDATE/DELETE ============
  async updateTrackedLink(
    id: string,
    values: UpdateTrackedLinkValues,
  ): Promise<ApiResult<TrackedLink>> {
    const response = await this.request<{ data: Record<string, unknown> }>(
      `/api/v1/tracked-links/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(values),
      },
    );

    if (response.error || !response.data) {
      return {
        error: response.error,
        message: response.message,
      };
    }

    return {
      data: normalizeTrackedLink(response.data.data),
      message: response.message,
    };
  }

  async deleteTrackedLink(id: string): Promise<ApiResult<void>> {
    const response = await this.request(`/api/v1/tracked-links/${id}`, {
      method: "DELETE",
    });
    return {
      error: response.error,
      message: response.message,
    };
  }

  async getTrackedLinkStats(
    id: string,
    since?: string,
  ): Promise<ApiResult<LinkStats>> {
    let url = `/api/v1/tracked-links/${id}/stats`;
    if (since) url += `?since=${since}`;
    const response = await this.request<{ data: LinkStats }>(url);
    return {
      data: response.data?.data,
      error: response.error,
      message: response.message,
    };
  }

  // ============ LEAD RESET ============
  async resetLead(
    id: string,
    values?: LeadResetValues,
  ): Promise<ApiResult<LeadResetResult>> {
    const response = await this.request<{ data: LeadResetResult }>(
      `/api/v1/leads/${id}/reset`,
      {
        method: "POST",
        body: values ? JSON.stringify(values) : undefined,
      },
    );
    return {
      data: response.data?.data,
      error: response.error,
      message: response.message,
    };
  }
}

export const api = new AtusAPI();
export type {
  Lead,
  StatsData,
  Corretor,
  Conversa,
  ApiResult,
  Tag,
  User,
  LeadFlag,
  GlobalFlag,
  LinkStats,
  TrackedLink,
  LeadResetResult,
};
