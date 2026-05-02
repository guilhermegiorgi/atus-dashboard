import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ConversationsPage from "./page";

const { apiMock } = vi.hoisted(() => ({
  apiMock: {
    getInboxConversations: vi.fn(),
    getCorretores: vi.fn(),
    getInboxConversationDetail: vi.fn(),
    sendInboxMessage: vi.fn(),
    assignInboxConversation: vi.fn(),
    updateInboxConversationState: vi.fn(),
    returnInboxConversationToBot: vi.fn(),
  },
}));

vi.mock("@/lib/api/client", () => ({
  api: apiMock,
}));

describe("ConversationsPage", () => {
  it("auto-selects the first inbox conversation so the operator can work immediately", async () => {
    apiMock.getInboxConversations.mockResolvedValue({
      data: {
        data: [
          {
            lead_id: "lead-1",
            telefone: "5565999999999",
            nome_completo: "Ana Paula",
            conversation_state: "TRIAGE_HUMAN",
            owner_user_name: "Triagem",
            owner_user_type: "admin",
            assigned_corretor_id: null,
            assigned_by: "",
            assigned_at: null,
            returned_to_bot_at: null,
            canal_origem: "WHATSAPP",
            sistema_origem: "ATUSBOT",
            status: "NOVO",
            fase: "TRIAGEM",
            qualification_summary: "Triagem qualificada",
            last_message_preview: "Preciso de ajuda com financiamento",
            last_message_direction: "ENTRADA",
            updated_at: "2026-04-10T11:00:00Z",
          },
          {
            lead_id: "lead-2",
            telefone: "5565988888888",
            nome_completo: "Bruno Costa",
            conversation_state: "HUMAN_STANDBY",
            owner_user_name: "Carla",
            owner_user_type: "broker",
            assigned_corretor_id: "corretor-2",
            assigned_by: "Triagem",
            assigned_at: "2026-04-10T10:30:00Z",
            returned_to_bot_at: null,
            canal_origem: "PORTAL",
            sistema_origem: "IMOVELWEB",
            status: "EM_ATENDIMENTO",
            fase: "PROPOSTA",
            qualification_summary: "Cliente em negociação",
            last_message_preview: "Vou responder depois",
            last_message_direction: "SAIDA",
            updated_at: "2026-04-10T11:05:00Z",
          },
        ],
        meta: { total: 2, limit: 20, offset: 0 },
      },
    });
    apiMock.getCorretores.mockResolvedValue({
      data: [{ id: "corretor-2", nome: "Carla Broker" }],
    });
    apiMock.getInboxConversationDetail.mockResolvedValue({
      data: {
        lead_id: "lead-1",
        telefone: "5565999999999",
        nome_completo: "Ana Paula",
        email: "ana@example.com",
        conversation_state: "TRIAGE_HUMAN",
        owner_user_name: "Triagem",
        owner_user_type: "admin",
        assigned_corretor_id: null,
        assigned_by: "",
        assigned_at: null,
        returned_to_bot_at: null,
        canal_origem: "WHATSAPP",
        sistema_origem: "ATUSBOT",
        status: "NOVO",
        fase: "TRIAGEM",
        qualification_summary: "Triagem qualificada",
        last_message_preview: "Preciso de ajuda com financiamento",
        last_message_direction: "ENTRADA",
        updated_at: "2026-04-10T11:00:00Z",
        tracked_codigo_ref: "TRACK-ANA",
        link_click_id: "click-1",
        messages: [
          {
            id: "msg-1",
            content: "Posso assumir essa conversa agora?",
            direction: "SAIDA",
            timestamp: "2026-04-10T11:01:00Z",
            actor_name: "Dashboard",
            actor_type: "admin",
          },
        ],
        operational_status: null,
      },
    });

    render(<ConversationsPage />);

    await waitFor(() => {
      expect(apiMock.getInboxConversationDetail).toHaveBeenCalledWith("lead-1");
      expect(screen.getByText(/TRACK-ANA/)).toBeInTheDocument();
      expect(screen.getAllByText("Triagem qualificada").length).toBeGreaterThan(0);
      expect(screen.getByText("Posso assumir essa conversa agora?")).toBeInTheDocument();
    });
  });

  it("keeps the inbox visible when corretores lookup fails", async () => {
    apiMock.getInboxConversations.mockResolvedValue({
      data: {
        data: [
          {
            lead_id: "lead-1",
            telefone: "5565999999999",
            nome_completo: "Ana Paula",
            conversation_state: "TRIAGE_HUMAN",
            owner_user_name: "Triagem",
            owner_user_type: "admin",
            assigned_corretor_id: null,
            assigned_by: "",
            assigned_at: null,
            returned_to_bot_at: null,
            canal_origem: "WHATSAPP",
            sistema_origem: "ATUSBOT",
            status: "NOVO",
            fase: "TRIAGEM",
            qualification_summary: "Triagem qualificada",
            last_message_preview: "Preciso de ajuda com financiamento",
            last_message_direction: "ENTRADA",
            updated_at: "2026-04-10T11:00:00Z",
          },
        ],
        meta: { total: 1, limit: 20, offset: 0 },
      },
    });
    apiMock.getCorretores.mockResolvedValue({
      error: "servico indisponivel",
    });
    apiMock.getInboxConversationDetail.mockResolvedValue({
      data: {
        lead_id: "lead-1",
        telefone: "5565999999999",
        nome_completo: "Ana Paula",
        email: "",
        conversation_state: "TRIAGE_HUMAN",
        owner_user_name: "Triagem",
        owner_user_type: "admin",
        assigned_corretor_id: null,
        assigned_by: "",
        assigned_at: null,
        returned_to_bot_at: null,
        canal_origem: "WHATSAPP",
        sistema_origem: "ATUSBOT",
        status: "NOVO",
        fase: "TRIAGEM",
        qualification_summary: "Triagem qualificada",
        last_message_preview: "Preciso de ajuda com financiamento",
        last_message_direction: "ENTRADA",
        updated_at: "2026-04-10T11:00:00Z",
        tracked_codigo_ref: "TRACK-ANA",
        link_click_id: null,
        messages: [],
        operational_status: null,
      },
    });

    render(<ConversationsPage />);

    await waitFor(() => {
      expect(screen.getByText("Ana Paula")).toBeInTheDocument();
      expect(screen.queryByText("Erro ao carregar")).not.toBeInTheDocument();
    });
  });
});
