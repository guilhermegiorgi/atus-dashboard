import { LeadHumanIntervention } from "@/types/dashboard";
import { Conversa, Mensagem } from "@/types/leads";

type RawValue = Record<string, unknown>;

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asNullableString(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function asBoolean(value: unknown) {
  return value === true;
}

function asNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function normalizeLeadHumanIntervention(
  raw: RawValue
): LeadHumanIntervention {
  return {
    lead_id: asString(raw.lead_id),
    telefone: asString(raw.telefone),
    intervention_type: asString(raw.intervention_type),
    conversation_state: asString(raw.conversation_state),
    intervention_at: asNullableString(raw.intervention_at),
    intervention_by: asNullableString(raw.intervention_by),
    em_follow_up: asBoolean(raw.em_follow_up),
  };
}

export function normalizeLeadConversation(raw: RawValue): Conversa {
  return {
    id: asString(raw.id),
    lead_id: asString(raw.lead_id),
    status: asString(raw.status),
    started_at: asString(raw.started_at),
    ended_at: asNullableString(raw.ended_at),
    message_count: asNumber(raw.message_count),
  };
}

export function normalizeLeadConversationMessage(raw: RawValue): Mensagem {
  return {
    id: asString(raw.id),
    conversa_id: asString(raw.conversa_id),
    tipo: (asString(raw.tipo) || "TEXTO") as Mensagem["tipo"],
    conteudo: asString(raw.conteudo),
    direcao: (asString(raw.direcao) || "ENTRADA") as Mensagem["direcao"],
    midia_url: asNullableString(raw.midia_url) ?? undefined,
    timestamp: asString(raw.timestamp),
  };
}
