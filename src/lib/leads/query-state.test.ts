import { describe, expect, it } from "vitest";
import {
  buildCanonicalLeadFilters,
  getOffsetForPage,
  searchWithinPage,
} from "./query-state";

describe("buildCanonicalLeadFilters", () => {
  it("drops unsupported filters and keeps canonical ones", () => {
    expect(
      buildCanonicalLeadFilters({
        status: "NOVO",
        em_follow_up: true,
        canal_origem: "PORTAL",
        sistema_origem: "IMOVELWEB",
        search: "Maria",
        minRenda: 1000,
      })
    ).toEqual({
      status: "NOVO",
      em_follow_up: true,
      canal_origem: "PORTAL",
      sistema_origem: "IMOVELWEB",
    });
  });
});

describe("getOffsetForPage", () => {
  it("converts page numbers to canonical offset", () => {
    expect(getOffsetForPage(3, 25)).toBe(50);
  });
});

describe("searchWithinPage", () => {
  it("filters only the current loaded page client-side", () => {
    const result = searchWithinPage(
      [
        {
          id: "1",
          nome_completo: "Maria Silva",
          telefone: "5565",
          status: "NOVO",
          created_at: "",
          updated_at: "",
          aniversario: null,
          em_follow_up: false,
        },
        {
          id: "2",
          nome_completo: "Carlos Souza",
          telefone: "5566",
          status: "NOVO",
          created_at: "",
          updated_at: "",
          aniversario: null,
          em_follow_up: false,
        },
      ],
      "maria"
    );

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("matches canonical multichannel and tracking fields on the loaded page", () => {
    const result = searchWithinPage(
      [
        {
          id: "1",
          nome_completo: "Maria Silva",
          telefone: "5565",
          status: "NOVO",
          created_at: "",
          updated_at: "",
          aniversario: null,
          em_follow_up: false,
          resumo_qualificacao: "Maria | interesse COMPRA | canal PORTAL",
          tracked_codigo_ref: "TRACK1234",
          external_lead_id: "ext-01",
        },
        {
          id: "2",
          nome_completo: "Carlos Souza",
          telefone: "5566",
          status: "NOVO",
          created_at: "",
          updated_at: "",
          aniversario: null,
          em_follow_up: false,
          resumo_qualificacao: "Carlos | interesse ALUGUEL",
          tracked_codigo_ref: "TRACK9999",
          external_lead_id: "ext-02",
        },
      ],
      "track1234"
    );

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });
});
