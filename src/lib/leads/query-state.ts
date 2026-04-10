import { Lead, LeadListFilters } from "@/types/leads";

export function getOffsetForPage(page: number, limit: number) {
  return Math.max(page - 1, 0) * limit;
}

export function buildCanonicalLeadFilters(
  filters: Record<string, unknown> | (LeadListFilters & { search?: string })
): LeadListFilters {
  const rawFilters = filters as Record<string, unknown>;

  return {
    status:
      typeof rawFilters.status === "string"
        ? (rawFilters.status as LeadListFilters["status"])
        : undefined,
    fase: typeof rawFilters.fase === "string" ? rawFilters.fase : undefined,
    em_follow_up:
      typeof rawFilters.em_follow_up === "boolean"
        ? rawFilters.em_follow_up
        : undefined,
    tipo_interesse:
      typeof rawFilters.tipo_interesse === "string"
        ? rawFilters.tipo_interesse
        : undefined,
    has_nome:
      typeof rawFilters.has_nome === "boolean" ? rawFilters.has_nome : undefined,
    has_email:
      typeof rawFilters.has_email === "boolean"
        ? rawFilters.has_email
        : undefined,
    canal_origem:
      typeof rawFilters.canal_origem === "string"
        ? rawFilters.canal_origem
        : undefined,
    sistema_origem:
      typeof rawFilters.sistema_origem === "string"
        ? rawFilters.sistema_origem
        : undefined,
  };
}

export function searchWithinPage(leads: Lead[], query: string) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return leads;
  }

  return leads.filter((lead) => {
    return [lead.nome_completo, lead.telefone, lead.email]
      .concat([
        lead.tipo_interesse,
        lead.canal_origem,
        lead.sistema_origem,
        lead.campanha_origem,
        lead.external_lead_id,
        lead.resumo_qualificacao,
        lead.tracked_codigo_ref,
        lead.link_click_id ?? undefined,
        lead.conversation_state,
        lead.intervention_type,
      ])
      .filter(Boolean)
      .some((value) => value!.toLowerCase().includes(normalized));
  });
}
