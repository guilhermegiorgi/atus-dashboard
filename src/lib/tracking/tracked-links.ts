import {
  CreateTrackedLinkValues,
  TrackedLink,
  TrackedLinksFilters,
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

function asBoolean(value: unknown) {
  return value === true;
}

function trimOrUndefined(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function buildTrackedLinksQuery(filters: TrackedLinksFilters) {
  const params = new URLSearchParams();

  if (filters.limit !== undefined) params.set("limit", String(filters.limit));
  if (filters.offset !== undefined) params.set("offset", String(filters.offset));
  if (filters.ativo !== undefined) params.set("ativo", String(filters.ativo));

  return params;
}

export function normalizeTrackedLink(raw: RawValue, link?: string): TrackedLink {
  return {
    id: asString(raw.id),
    nome: asString(raw.nome),
    nome_campanha: asString(raw.nome_campanha),
    source: asString(raw.source),
    medium: asString(raw.medium),
    content: asString(raw.content),
    term: asString(raw.term),
    codigo_ref: asString(raw.codigo_ref),
    whatsapp_num: asString(raw.whatsapp_num),
    whatsapp_msg: asString(raw.whatsapp_msg),
    url_base: asString(raw.url_base),
    clicks: asNumber(raw.clicks),
    leads_convertidos: asNumber(raw.leads_convertidos),
    ativo: asBoolean(raw.ativo),
    expira_em: asNullableString(raw.expira_em),
    created_at: asString(raw.created_at),
    updated_at: asString(raw.updated_at),
    link,
  };
}

export function buildTrackedLinkPayload(values: CreateTrackedLinkValues) {
  return {
    nome: values.nome.trim(),
    nome_campanha: trimOrUndefined(values.nome_campanha),
    source: trimOrUndefined(values.source),
    medium: trimOrUndefined(values.medium),
    content: trimOrUndefined(values.content),
    term: trimOrUndefined(values.term),
    whatsapp_num: values.whatsapp_num.trim(),
    whatsapp_msg: trimOrUndefined(values.whatsapp_msg),
    url_base: trimOrUndefined(values.url_base),
    expira_em: trimOrUndefined(values.expira_em),
  };
}
