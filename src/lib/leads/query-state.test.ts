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
        canal_origem: "PORTAL",
        sistema_origem: "IMOVELWEB",
        search: "Maria",
        minRenda: 1000,
      })
    ).toEqual({
      status: "NOVO",
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
});
