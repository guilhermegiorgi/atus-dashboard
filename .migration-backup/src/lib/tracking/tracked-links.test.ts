import { describe, expect, it } from "vitest";
import {
  buildTrackedLinkPayload,
  buildTrackedLinksQuery,
  normalizeTrackedLink,
} from "./tracked-links";

describe("buildTrackedLinksQuery", () => {
  it("serializes only canonical tracked-links filters", () => {
    expect(
      buildTrackedLinksQuery({
        limit: 50,
        offset: 100,
        ativo: true,
        search: "ignored",
      }).toString()
    ).toBe("limit=50&offset=100&ativo=true");
  });
});

describe("normalizeTrackedLink", () => {
  it("maps tracked-link list and detail fields into a single dashboard shape", () => {
    expect(
      normalizeTrackedLink(
        {
          id: "link-1",
          nome: "Campanha Facebook",
          nome_campanha: "lancamento2026",
          source: "facebook",
          medium: "cpc",
          content: "banner_lateral",
          term: "imovel",
          codigo_ref: "TRACK1234",
          whatsapp_num: "5565999999999",
          whatsapp_msg: "Ola! Gostaria de saber mais",
          url_base: "https://site.com/oferta",
          clicks: 12,
          leads_convertidos: 3,
          ativo: true,
          expira_em: "2026-12-31T00:00:00Z",
          created_at: "2026-04-09T10:00:00Z",
          updated_at: "2026-04-09T10:05:00Z",
        },
        "https://chatbot.atusbr.com.br/track/TRACK1234"
      )
    ).toEqual({
      id: "link-1",
      nome: "Campanha Facebook",
      nome_campanha: "lancamento2026",
      source: "facebook",
      medium: "cpc",
      content: "banner_lateral",
      term: "imovel",
      codigo_ref: "TRACK1234",
      whatsapp_num: "5565999999999",
      whatsapp_msg: "Ola! Gostaria de saber mais",
      url_base: "https://site.com/oferta",
      clicks: 12,
      leads_convertidos: 3,
      ativo: true,
      expira_em: "2026-12-31T00:00:00Z",
      created_at: "2026-04-09T10:00:00Z",
      updated_at: "2026-04-09T10:05:00Z",
      link: "https://chatbot.atusbr.com.br/track/TRACK1234",
    });
  });
});

describe("buildTrackedLinkPayload", () => {
  it("keeps the tracked-link create contract aligned to the backend", () => {
    expect(
      buildTrackedLinkPayload({
        nome: " Campanha Facebook ",
        nome_campanha: " lancamento2026 ",
        source: " facebook ",
        medium: " cpc ",
        content: " banner_lateral ",
        term: " imovel ",
        whatsapp_num: " 5565999999999 ",
        whatsapp_msg: " Ola! Gostaria de saber mais ",
        url_base: " https://site.com/oferta ",
        expira_em: "2026-12-31",
      })
    ).toEqual({
      nome: "Campanha Facebook",
      nome_campanha: "lancamento2026",
      source: "facebook",
      medium: "cpc",
      content: "banner_lateral",
      term: "imovel",
      whatsapp_num: "5565999999999",
      whatsapp_msg: "Ola! Gostaria de saber mais",
      url_base: "https://site.com/oferta",
      expira_em: "2026-12-31",
    });
  });
});
