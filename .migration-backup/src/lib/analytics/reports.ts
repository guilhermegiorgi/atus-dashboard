import {
  AnalyticsFilters,
  AnalyticsGroupedRow,
  AnalyticsLeadRow,
  AnalyticsTimeseriesPoint,
} from "@/types/dashboard";

type RawValue = Record<string, unknown>;

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asNullableString(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function asNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function buildAnalyticsQuery(filters: AnalyticsFilters) {
  const params = new URLSearchParams();

  if (filters.date_from) params.set("date_from", filters.date_from);
  if (filters.date_to) params.set("date_to", filters.date_to);
  if (filters.canal_origem) params.set("canal_origem", filters.canal_origem);
  if (filters.sistema_origem) {
    params.set("sistema_origem", filters.sistema_origem);
  }
  if (filters.campanha_origem) {
    params.set("campanha_origem", filters.campanha_origem);
  }
  if (filters.tracked_codigo_ref) {
    params.set("tracked_codigo_ref", filters.tracked_codigo_ref);
  }
  if (filters.status) params.set("status", filters.status);
  if (filters.fase) params.set("fase", filters.fase);
  if (filters.corretor_id) params.set("corretor_id", filters.corretor_id);
  if (filters.intervention_type) {
    params.set("intervention_type", filters.intervention_type);
  }
  if (filters.limit !== undefined) params.set("limit", String(filters.limit));
  if (filters.offset !== undefined) params.set("offset", String(filters.offset));

  return params;
}

export function normalizeAnalyticsTimeseriesPoint(
  raw: RawValue
): AnalyticsTimeseriesPoint {
  return {
    date: asString(raw.date),
    leads: asNumber(raw.leads),
    operational_conversions: asNumber(raw.operational_conversions),
    commercial_conversions: asNumber(raw.commercial_conversions),
    human_takeovers: asNumber(raw.human_takeovers),
  };
}

export function normalizeAnalyticsGroupedRow(raw: RawValue): AnalyticsGroupedRow {
  return {
    key: asString(raw.key),
    label: asString(raw.label),
    total_leads: asNumber(raw.total_leads),
    leads_em_tratativa: asNumber(raw.leads_em_tratativa),
    takeovers_humanos: asNumber(raw.takeovers_humanos),
    conversoes_operacionais: asNumber(raw.conversoes_operacionais),
    conversoes_comerciais: asNumber(raw.conversoes_comerciais),
    taxa_conversao_operacional: asNumber(raw.taxa_conversao_operacional),
    taxa_conversao_comercial: asNumber(raw.taxa_conversao_comercial),
    score_prontidao_medio: asNumber(raw.score_prontidao_medio),
    score_potencial_medio: asNumber(raw.score_potencial_medio),
  };
}

export function normalizeAnalyticsLeadRow(raw: RawValue): AnalyticsLeadRow {
  return {
    lead_id: asString(raw.lead_id),
    telefone: asString(raw.telefone),
    nome_completo: asString(raw.nome_completo),
    canal_origem: asString(raw.canal_origem),
    sistema_origem: asString(raw.sistema_origem),
    campanha_origem: asString(raw.campanha_origem),
    tracked_codigo_ref: asString(raw.tracked_codigo_ref),
    corretor_id: asNullableString(raw.corretor_id),
    status: asString(raw.status),
    fase: asString(raw.fase),
    intervention_type: asString(raw.intervention_type),
    qualification_summary: asString(raw.qualification_summary),
    score_prontidao_operacional: asNumber(raw.score_prontidao_operacional),
    score_prontidao_bucket: asString(raw.score_prontidao_bucket),
    score_potencial_comercial: asNumber(raw.score_potencial_comercial),
    score_potencial_bucket: asString(raw.score_potencial_bucket),
    updated_at: asString(raw.updated_at),
  };
}
