import { describe, expect, it } from "vitest";
import {
  buildInboxConversationsQuery,
  normalizeInboxConversationSummary,
} from "./conversations";

describe("normalizeInboxConversationSummary", () => {
  it("maps canonical inbox summary fields", () => {
    expect(
      normalizeInboxConversationSummary({
        lead_id: "lead-1",
        telefone: "5565999999999",
        nome_completo: "Maria",
        conversation_state: "TRIAGE_HUMAN",
        owner_user_name: "Pedro",
        owner_user_type: "broker",
        assigned_corretor_id: "corretor-1",
        assigned_by: "guilherme",
        assigned_at: "2026-04-09T10:00:00Z",
        returned_to_bot_at: null,
        canal_origem: "PORTAL",
        sistema_origem: "IMOVELWEB",
        status: "NOVO",
        fase: "COLETA",
        qualification_summary: "Maria | interesse COMPRA",
        last_message_preview: "Vou seguir por aqui",
        last_message_direction: "SAIDA",
        updated_at: "2026-04-09T10:10:00Z",
      })
    ).toEqual({
      lead_id: "lead-1",
      telefone: "5565999999999",
      nome_completo: "Maria",
      conversation_state: "TRIAGE_HUMAN",
      owner_user_name: "Pedro",
      owner_user_type: "broker",
      assigned_corretor_id: "corretor-1",
      assigned_by: "guilherme",
      assigned_at: "2026-04-09T10:00:00Z",
      returned_to_bot_at: null,
      canal_origem: "PORTAL",
      sistema_origem: "IMOVELWEB",
      status: "NOVO",
      fase: "COLETA",
      qualification_summary: "Maria | interesse COMPRA",
      last_message_preview: "Vou seguir por aqui",
      last_message_direction: "SAIDA",
      updated_at: "2026-04-09T10:10:00Z",
    });
  });
});

describe("buildInboxConversationsQuery", () => {
  it("serializes only canonical inbox filters", () => {
    expect(
      buildInboxConversationsQuery({
        state: "TRIAGE_HUMAN",
        owner_user_name: "Pedro",
        assigned_corretor_id: "corretor-1",
        canal_origem: "PORTAL",
        sistema_origem: "IMOVELWEB",
        status: "NOVO",
        fase: "COLETA",
        limit: 20,
        offset: 40,
        search: "ignored",
      }).toString()
    ).toBe(
      "state=TRIAGE_HUMAN&owner_user_name=Pedro&assigned_corretor_id=corretor-1&canal_origem=PORTAL&sistema_origem=IMOVELWEB&status=NOVO&fase=COLETA&limit=20&offset=40"
    );
  });
});
