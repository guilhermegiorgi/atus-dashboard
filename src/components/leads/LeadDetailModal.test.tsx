import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LeadDetailModal } from "./LeadDetailModal";
import type { Lead } from "@/types/leads";

const { apiMock } = vi.hoisted(() => ({
  apiMock: {
    getLeadOperationalStatus: vi.fn(),
    getLeadActions: vi.fn(),
    getLeadHumanIntervention: vi.fn(),
    getLeadConversations: vi.fn(),
    getConversationMessages: vi.fn(),
  },
}));

vi.mock("@/lib/api/client", () => ({
  api: apiMock,
}));

const lead: Lead = {
  id: "lead-1",
  telefone: "5565999999999",
  nome_completo: "Maria Silva",
  aniversario: null,
  em_follow_up: true,
  status: "NOVO",
  created_at: "2026-04-09T10:00:00Z",
  updated_at: "2026-04-09T10:00:00Z",
};

describe("LeadDetailModal", () => {
  it("loads canonical lead detail blocks when opened", async () => {
    apiMock.getLeadOperationalStatus.mockResolvedValue({
      data: {
        lead_id: "lead-1",
        telefone: "5565999999999",
        canal_origem: "PORTAL",
        sistema_origem: "IMOVELWEB",
        campanha_origem: "meta-abril",
        tracked_codigo_ref: "TRACK1234",
        intervention_type: "HUMAN_TAKEOVER",
        fase: "COLETA",
        status: "NOVO",
        next_field: "estado_civil",
        missing_fields: ["estado_civil"],
        confirmation_pending: false,
        is_contaminated: false,
        recommended_action: "start_followup",
        qualification_summary: "Maria | interesse COMPRA",
        last_bot_message: "Qual seu estado civil?",
        last_lead_message: "Casada",
        last_message_direction: "ENTRADA",
      },
    });
    apiMock.getLeadActions.mockResolvedValue({
      data: {
        data: [
          {
            id: "action-1",
            lead_id: "lead-1",
            action: "START_FOLLOWUP",
            status: "SUCCESS",
            actor: "mcp",
            details: "{\"telefone\":\"5565999999999\"}",
            created_at: "2026-04-09T11:00:00Z",
          },
        ],
        meta: { total: 1, limit: 20, offset: 0 },
      },
    });
    apiMock.getLeadHumanIntervention.mockResolvedValue({
      data: {
        lead_id: "lead-1",
        telefone: "5565999999999",
        intervention_type: "HUMAN_TAKEOVER",
        conversation_state: "TRIAGE_HUMAN",
        intervention_at: "2026-04-09T11:30:00Z",
        intervention_by: "user-1",
        em_follow_up: true,
      },
    });
    apiMock.getLeadConversations.mockResolvedValue({
      data: [
        {
          id: "conv-1",
          lead_id: "lead-1",
          status: "ATIVA",
          started_at: "2026-04-09T10:10:00Z",
          ended_at: null,
          message_count: 2,
        },
      ],
    });
    apiMock.getConversationMessages.mockResolvedValue({
      data: {
        data: [
          {
            id: "msg-1",
            conversa_id: "conv-1",
            tipo: "TEXTO",
            conteudo: "Ola, preciso de ajuda",
            direcao: "ENTRADA",
            timestamp: "2026-04-09T10:11:00Z",
          },
        ],
        total: 1,
        has_more: false,
      },
    });

    render(
      <LeadDetailModal lead={lead} open onClose={() => {}} onEdit={() => {}} />
    );

    await waitFor(() => {
    expect(screen.getByText("Estado operacional")).toBeInTheDocument();
      expect(screen.getByText("start_followup")).toBeInTheDocument();
      expect(screen.getByText("TRIAGE_HUMAN")).toBeInTheDocument();
      expect(screen.getByText("START_FOLLOWUP")).toBeInTheDocument();
      expect(screen.getByText("Ola, preciso de ajuda")).toBeInTheDocument();
    });
  });
});
