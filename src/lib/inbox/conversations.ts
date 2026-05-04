import {
  InboxConversationDetail,
  InboxConversationFilters,
  InboxConversationSummary,
  InboxMessage,
} from "@/types/dashboard";
import { normalizeOperationalStatus } from "@/lib/pipeline/queue";

type RawValue = Record<string, unknown>;

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asNullableString(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((v): v is string => typeof v === "string")
    : [];
}

function baseSummary(raw: RawValue): InboxConversationSummary {
  return {
    lead_id: asString(raw.lead_id),
    telefone: asString(raw.telefone),
    nome_completo: asString(raw.nome_completo),
    conversation_state: asString(raw.conversation_state),
    owner_user_name: asString(raw.owner_user_name),
    owner_user_type: asString(raw.owner_user_type),
    assigned_corretor_id: asNullableString(raw.assigned_corretor_id),
    assigned_by: asString(raw.assigned_by),
    assigned_at: asNullableString(raw.assigned_at),
    returned_to_bot_at: asNullableString(raw.returned_to_bot_at),
    canal_origem: asString(raw.canal_origem),
    sistema_origem: asString(raw.sistema_origem),
    status: asString(raw.status),
    fase: asString(raw.fase),
    qualification_summary: asString(raw.qualification_summary),
    last_message_preview: asString(raw.last_message_preview),
    last_message_direction: asString(raw.last_message_direction),
    tags: asStringArray(raw.tags),
    updated_at: asString(raw.updated_at),
  };
}

function normalizeInboxMessage(raw: unknown): InboxMessage {
  const item = typeof raw === "object" && raw ? (raw as RawValue) : {};
  const metadata =
    typeof item.metadata === "object" && item.metadata
      ? (item.metadata as RawValue)
      : {};

  return {
    id: asString(item.id),
    content: asString(item.content || item.conteudo || item.message),
    direction: asString(item.direction || item.direcao),
    timestamp: asString(item.timestamp),
    actor_name: asString(item.actor_name || metadata.actor_name),
    actor_type: asString(item.actor_type || metadata.actor_type),
    tipo_msg: asString(item.tipo_msg || item.tipo) || undefined,
    midia_url: asString(item.midia_url || item.media_url) || undefined,
  };
}

export function normalizeInboxConversationSummary(
  raw: RawValue,
): InboxConversationSummary {
  return baseSummary(raw);
}

export function normalizeInboxConversationDetail(
  raw: RawValue,
): InboxConversationDetail {
  const lead =
    typeof raw.lead === "object" && raw.lead ? (raw.lead as RawValue) : {};
  const operational =
    typeof raw.operational_status === "object" && raw.operational_status
      ? (raw.operational_status as RawValue)
      : null;
  const messages = Array.isArray(raw.messages) ? raw.messages : [];

  return {
    ...baseSummary({ ...lead, ...raw }),
    email: asString(lead.email || raw.email),
    tracked_codigo_ref: asString(
      lead.tracked_codigo_ref || raw.tracked_codigo_ref,
    ),
    link_click_id: asNullableString(lead.link_click_id || raw.link_click_id),
    messages: messages.map(normalizeInboxMessage),
    operational_status: operational
      ? normalizeOperationalStatus(operational)
      : null,
  };
}

export function buildInboxConversationsQuery(
  filters: InboxConversationFilters,
) {
  const params = new URLSearchParams();

  if (filters.state) params.set("state", filters.state);
  if (filters.owner_user_name) {
    params.set("owner_user_name", filters.owner_user_name);
  }
  if (filters.assigned_corretor_id) {
    params.set("assigned_corretor_id", filters.assigned_corretor_id);
  }
  if (filters.canal_origem) params.set("canal_origem", filters.canal_origem);
  if (filters.sistema_origem) {
    params.set("sistema_origem", filters.sistema_origem);
  }
  if (filters.status) params.set("status", filters.status);
  if (filters.fase) params.set("fase", filters.fase);
  if (filters.limit !== undefined) params.set("limit", String(filters.limit));
  if (filters.offset !== undefined)
    params.set("offset", String(filters.offset));

  return params;
}
