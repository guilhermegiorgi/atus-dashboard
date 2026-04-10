import { describe, expect, it } from "vitest";
import {
  normalizeLeadConversation,
  normalizeLeadConversationMessage,
  normalizeLeadHumanIntervention,
} from "./detail";

describe("normalizeLeadHumanIntervention", () => {
  it("maps the legacy human intervention payload while preserving canonical conversation_state", () => {
    expect(
      normalizeLeadHumanIntervention({
        lead_id: "lead-1",
        telefone: "5565999999999",
        intervention_type: "HUMAN_TAKEOVER",
        conversation_state: "TRIAGE_HUMAN",
        intervention_at: "2026-04-06T18:00:00Z",
        intervention_by: "user-1",
        em_follow_up: true,
      })
    ).toEqual({
      lead_id: "lead-1",
      telefone: "5565999999999",
      intervention_type: "HUMAN_TAKEOVER",
      conversation_state: "TRIAGE_HUMAN",
      intervention_at: "2026-04-06T18:00:00Z",
      intervention_by: "user-1",
      em_follow_up: true,
    });
  });
});

describe("normalizeLeadConversation", () => {
  it("maps canonical conversation list fields", () => {
    expect(
      normalizeLeadConversation({
        id: "conv-1",
        lead_id: "lead-1",
        status: "ATIVA",
        started_at: "2026-04-09T10:00:00Z",
        ended_at: null,
        message_count: 4,
      })
    ).toEqual({
      id: "conv-1",
      lead_id: "lead-1",
      status: "ATIVA",
      started_at: "2026-04-09T10:00:00Z",
      ended_at: null,
      message_count: 4,
    });
  });
});

describe("normalizeLeadConversationMessage", () => {
  it("accepts the mensagens payload and keeps ordering fields intact", () => {
    expect(
      normalizeLeadConversationMessage({
        id: "msg-1",
        conversa_id: "conv-1",
        tipo: "TEXTO",
        conteudo: "Ola",
        direcao: "ENTRADA",
        timestamp: "2026-04-09T10:01:00Z",
        midia_url: "",
      })
    ).toEqual({
      id: "msg-1",
      conversa_id: "conv-1",
      tipo: "TEXTO",
      conteudo: "Ola",
      direcao: "ENTRADA",
      timestamp: "2026-04-09T10:01:00Z",
      midia_url: undefined,
    });
  });
});
