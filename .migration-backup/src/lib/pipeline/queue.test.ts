import { describe, expect, it } from "vitest";
import {
  buildFollowupQueueQuery,
  normalizeOperationalQueueItem,
} from "./queue";

describe("normalizeOperationalQueueItem", () => {
  it("maps backend fields into operational queue rows", () => {
    expect(
      normalizeOperationalQueueItem({
        lead_id: "lead-1",
        telefone: "5565999999999",
        canal_origem: "PORTAL",
        sistema_origem: "IMOVELWEB",
        campanha_origem: "meta-abril",
        tracked_codigo_ref: "TRACK1234",
        intervention_type: "",
        fase: "COLETA",
        status: "NOVO",
        next_field: "email",
        missing_fields: ["email"],
        confirmation_pending: false,
        is_contaminated: true,
        recommended_action: "reset_then_followup",
        qualification_summary: "Maria Silva | interesse COMPRA",
        last_bot_message: "Qual seu email?",
        last_lead_message: "Ainda nao tenho",
        last_message_direction: "ENTRADA",
      })
    ).toEqual({
      lead_id: "lead-1",
      telefone: "5565999999999",
      canal_origem: "PORTAL",
      sistema_origem: "IMOVELWEB",
      campanha_origem: "meta-abril",
      tracked_codigo_ref: "TRACK1234",
      intervention_type: "",
      fase: "COLETA",
      status: "NOVO",
      next_field: "email",
      missing_fields: ["email"],
      confirmation_pending: false,
      is_contaminated: true,
      recommended_action: "reset_then_followup",
      qualification_summary: "Maria Silva | interesse COMPRA",
      last_bot_message: "Qual seu email?",
      last_lead_message: "Ainda nao tenho",
      last_message_direction: "ENTRADA",
    });
  });
});

describe("buildFollowupQueueQuery", () => {
  it("serializes only canonical queue filters", () => {
    expect(
      buildFollowupQueueQuery({
        limit: 20,
        offset: 40,
        expired_only: true,
        only_contaminated: false,
        canal_origem: "PORTAL",
        sistema_origem: "IMOVELWEB",
        triage_state: "human_takeover_active",
        search: "ignored",
      }).toString()
    ).toBe(
      "limit=20&offset=40&expired_only=true&only_contaminated=false&canal_origem=PORTAL&sistema_origem=IMOVELWEB&triage_state=human_takeover_active"
    );
  });
});
