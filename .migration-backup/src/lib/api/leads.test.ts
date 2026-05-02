import { describe, expect, it } from "vitest";
import {
  buildInboundLeadPayload,
  buildLeadFiltersQuery,
  buildLeadUpdatePayload,
  normalizeLead,
} from "./leads";

describe("normalizeLead", () => {
  it("normalizes em_followup into em_follow_up", () => {
    const lead = normalizeLead({
      id: "lead-1",
      telefone: "5565999999999",
      nome_completo: "Maria",
      status: "NOVO",
      fase: "COLETA",
      em_followup: true,
      tracked_codigo_ref: "TRACK1234",
      created_at: "2026-04-09T10:00:00Z",
      updated_at: "2026-04-09T10:00:00Z",
    });

    expect(lead.em_follow_up).toBe(true);
  });
});

describe("buildLeadFiltersQuery", () => {
  it("serializes only canonical filters", () => {
    const query = buildLeadFiltersQuery({
      status: "NOVO",
      canal_origem: "PORTAL",
      sistema_origem: "IMOVELWEB",
      limit: 50,
      offset: 100,
      origem: "should-be-ignored",
      search: "should-be-ignored",
    });

    expect(query.toString()).toBe(
      "status=NOVO&canal_origem=PORTAL&sistema_origem=IMOVELWEB&limit=50&offset=100"
    );
  });
});

describe("buildInboundLeadPayload", () => {
  it("maps create form values to canonical inbound payload", () => {
    expect(
      buildInboundLeadPayload({
        nome_completo: "Maria Silva",
        telefone: "(65) 99999-0000",
        email: "maria@email.com",
        tipo_interesse: "COMPRA",
        campanha_origem: "manual-dashboard",
        mensagem_inicial: "Cadastro manual da operação",
      })
    ).toEqual({
      canal_origem: "INTERNO",
      sistema_origem: "DASHBOARD",
      nome: "Maria Silva",
      telefone: "(65) 99999-0000",
      email: "maria@email.com",
      tipo_interesse: "COMPRA",
      campanha_origem: "manual-dashboard",
      origem_detalhada: "cadastro_manual",
      mensagem_inicial: "Cadastro manual da operação",
    });
  });
});

describe("buildLeadUpdatePayload", () => {
  it("drops fields that are not part of PUT /api/v1/leads/:id", () => {
    expect(
      buildLeadUpdatePayload({
        nome_completo: "Maria Silva",
        email: "maria@email.com",
        tipo_interesse: "COMPRA",
        status: "EM_ATENDIMENTO",
        campanha_origem: "should-not-go",
      })
    ).toEqual({
      nome_completo: "Maria Silva",
      email: "maria@email.com",
      estado_civil: undefined,
      aniversario: undefined,
      tipo_interesse: "COMPRA",
      renda_comprovada: 0,
      renda_comprovada_conjuge: 0,
      fgts: 0,
      fgts_conjuge: 0,
      tem_entrada: false,
      entrada: 0,
      tem_carteira_assinada: false,
      status: "EM_ATENDIMENTO",
      observacoes: undefined,
    });
  });
});
