import {
  FollowupQueueFilters,
  OperationalQueueItem,
  OperationalStatus,
} from "@/types/dashboard";

type RawOperationalItem = Record<string, unknown>;

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asBoolean(value: unknown) {
  return value === true;
}

function asStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

export function normalizeOperationalQueueItem(
  raw: RawOperationalItem
): OperationalQueueItem {
  return {
    lead_id: asString(raw.lead_id),
    telefone: asString(raw.telefone),
    canal_origem: asString(raw.canal_origem),
    sistema_origem: asString(raw.sistema_origem),
    campanha_origem: asString(raw.campanha_origem),
    tracked_codigo_ref: asString(raw.tracked_codigo_ref),
    intervention_type: asString(raw.intervention_type),
    fase: asString(raw.fase),
    status: asString(raw.status),
    next_field: asString(raw.next_field),
    missing_fields: asStringArray(raw.missing_fields),
    confirmation_pending: asBoolean(raw.confirmation_pending),
    is_contaminated: asBoolean(raw.is_contaminated),
    recommended_action: asString(raw.recommended_action),
    qualification_summary: asString(raw.qualification_summary),
    last_bot_message: asString(raw.last_bot_message),
    last_lead_message: asString(raw.last_lead_message),
    last_message_direction: asString(raw.last_message_direction),
  };
}

export function normalizeOperationalStatus(
  raw: RawOperationalItem
): OperationalStatus {
  return normalizeOperationalQueueItem(raw);
}

export function buildFollowupQueueQuery(filters: FollowupQueueFilters) {
  const params = new URLSearchParams();

  if (filters.limit !== undefined) params.set("limit", String(filters.limit));
  if (filters.offset !== undefined) params.set("offset", String(filters.offset));
  if (filters.status) params.set("status", filters.status);
  if (filters.fase) params.set("fase", filters.fase);
  if (filters.em_follow_up !== undefined) {
    params.set("em_follow_up", String(filters.em_follow_up));
  }
  if (filters.tipo_interesse) params.set("tipo_interesse", filters.tipo_interesse);
  if (filters.has_nome !== undefined) params.set("has_nome", String(filters.has_nome));
  if (filters.has_email !== undefined) params.set("has_email", String(filters.has_email));
  if (filters.expired_only !== undefined) {
    params.set("expired_only", String(filters.expired_only));
  }
  if (filters.only_contaminated !== undefined) {
    params.set("only_contaminated", String(filters.only_contaminated));
  }
  if (filters.canal_origem) params.set("canal_origem", filters.canal_origem);
  if (filters.sistema_origem) params.set("sistema_origem", filters.sistema_origem);
  if (filters.triage_state) params.set("triage_state", filters.triage_state);

  return params;
}
