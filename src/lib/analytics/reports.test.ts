import { describe, expect, it } from "vitest";
import {
  buildAnalyticsQuery,
  normalizeAnalyticsGroupedRow,
  normalizeAnalyticsLeadRow,
  normalizeAnalyticsTimeseriesPoint,
} from "./reports";

describe("buildAnalyticsQuery", () => {
  it("serializes only canonical analytics filters", () => {
    expect(
      buildAnalyticsQuery({
        date_from: "2026-04-01",
        date_to: "2026-04-30",
        canal_origem: "PORTAL",
        sistema_origem: "IMOVELWEB",
        campanha_origem: "meta-abril",
        tracked_codigo_ref: "TRACK1234",
        status: "NOVO",
        fase: "COLETA",
        corretor_id: "corretor-1",
        intervention_type: "HUMAN_TAKEOVER",
        limit: 20,
        offset: 40,
        search: "ignored",
      }).toString()
    ).toBe(
      "date_from=2026-04-01&date_to=2026-04-30&canal_origem=PORTAL&sistema_origem=IMOVELWEB&campanha_origem=meta-abril&tracked_codigo_ref=TRACK1234&status=NOVO&fase=COLETA&corretor_id=corretor-1&intervention_type=HUMAN_TAKEOVER&limit=20&offset=40"
    );
  });
});

describe("normalizeAnalyticsTimeseriesPoint", () => {
  it("maps canonical analytics timeseries fields", () => {
    expect(
      normalizeAnalyticsTimeseriesPoint({
        date: "2026-04-09",
        leads: 12,
        operational_conversions: 5,
        commercial_conversions: 2,
        human_takeovers: 3,
      })
    ).toEqual({
      date: "2026-04-09",
      leads: 12,
      operational_conversions: 5,
      commercial_conversions: 2,
      human_takeovers: 3,
    });
  });
});

describe("normalizeAnalyticsGroupedRow", () => {
  it("maps grouped analytics rows with scores and conversions", () => {
    expect(
      normalizeAnalyticsGroupedRow({
        key: "TRACK1234",
        label: "TRACK1234",
        total_leads: 9,
        leads_em_tratativa: 3,
        takeovers_humanos: 1,
        conversoes_operacionais: 4,
        conversoes_comerciais: 1,
        taxa_conversao_operacional: 0.44,
        taxa_conversao_comercial: 0.11,
        score_prontidao_medio: 72.5,
        score_potencial_medio: 61.3,
      })
    ).toEqual({
      key: "TRACK1234",
      label: "TRACK1234",
      total_leads: 9,
      leads_em_tratativa: 3,
      takeovers_humanos: 1,
      conversoes_operacionais: 4,
      conversoes_comerciais: 1,
      taxa_conversao_operacional: 0.44,
      taxa_conversao_comercial: 0.11,
      score_prontidao_medio: 72.5,
      score_potencial_medio: 61.3,
    });
  });
});

describe("normalizeAnalyticsLeadRow", () => {
  it("maps drill-down lead rows preserving canonical tracking fields", () => {
    expect(
      normalizeAnalyticsLeadRow({
        lead_id: "lead-1",
        telefone: "5565999999999",
        nome_completo: "Maria",
        canal_origem: "PORTAL",
        sistema_origem: "IMOVELWEB",
        campanha_origem: "meta-abril",
        tracked_codigo_ref: "TRACK1234",
        corretor_id: null,
        status: "NOVO",
        fase: "COLETA",
        intervention_type: "",
        qualification_summary: "Maria | interesse COMPRA",
        score_prontidao_operacional: 85,
        score_prontidao_bucket: "alto",
        score_potencial_comercial: 67,
        score_potencial_bucket: "medio",
        updated_at: "2026-04-09T10:00:00Z",
      })
    ).toEqual({
      lead_id: "lead-1",
      telefone: "5565999999999",
      nome_completo: "Maria",
      canal_origem: "PORTAL",
      sistema_origem: "IMOVELWEB",
      campanha_origem: "meta-abril",
      tracked_codigo_ref: "TRACK1234",
      corretor_id: null,
      status: "NOVO",
      fase: "COLETA",
      intervention_type: "",
      qualification_summary: "Maria | interesse COMPRA",
      score_prontidao_operacional: 85,
      score_prontidao_bucket: "alto",
      score_potencial_comercial: 67,
      score_potencial_bucket: "medio",
      updated_at: "2026-04-09T10:00:00Z",
    });
  });
});
