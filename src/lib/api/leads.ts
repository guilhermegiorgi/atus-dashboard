import { Lead, LeadFormValues, LeadListFilters } from "@/types/leads";

type RawLead = Record<string, unknown>;

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asOptionalString(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function asNullableString(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function asOptionalNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function asBoolean(value: unknown) {
  return value === true;
}

function buildLegacyOrigin(raw: RawLead) {
  const explicitOrigin = asOptionalString(raw.origem);

  if (explicitOrigin) {
    return explicitOrigin;
  }

  const detailed = asOptionalString(raw.origem_detalhada);

  if (detailed) {
    return detailed;
  }

  return [asOptionalString(raw.canal_origem), asOptionalString(raw.sistema_origem)]
    .filter(Boolean)
    .join(" / ");
}

export function normalizeLead(raw: RawLead): Lead {
  const emFollowUp = asBoolean(raw.em_follow_up) || asBoolean(raw.em_followup);

  return {
    id: asString(raw.id),
    uuid: asOptionalString(raw.uuid) ?? asString(raw.id),
    telefone: asString(raw.telefone),
    nome_completo: asString(raw.nome_completo),
    estado_civil: asOptionalString(raw.estado_civil),
    email: asOptionalString(raw.email),
    aniversario: asNullableString(raw.aniversario),
    tem_entrada: asBoolean(raw.tem_entrada),
    entrada: asOptionalNumber(raw.entrada),
    renda_comprovada: asOptionalNumber(raw.renda_comprovada),
    renda_comprovada_conjuge: asOptionalNumber(raw.renda_comprovada_conjuge),
    fgts: asOptionalNumber(raw.fgts),
    fgts_conjuge: asOptionalNumber(raw.fgts_conjuge),
    tem_carteira_assinada: asBoolean(raw.tem_carteira_assinada),
    tipo_interesse: asOptionalString(raw.tipo_interesse),
    localizacao: asOptionalString(raw.localizacao),
    fixa_preco_min: asOptionalNumber(raw.fixa_preco_min),
    fixa_preco_max: asOptionalNumber(raw.fixa_preco_max),
    tipo_imovel: asOptionalString(raw.tipo_imovel),
    qtd_quartos: asOptionalNumber(raw.qtd_quartos),
    qtd_banheiros: asOptionalNumber(raw.qtd_banheiros),
    observacoes: asOptionalString(raw.observacoes),
    origem: buildLegacyOrigin(raw),
    canal_origem: asOptionalString(raw.canal_origem),
    sistema_origem: asOptionalString(raw.sistema_origem),
    campanha_origem: asOptionalString(raw.campanha_origem),
    origem_detalhada: asOptionalString(raw.origem_detalhada),
    external_lead_id: asOptionalString(raw.external_lead_id),
    resumo_qualificacao: asOptionalString(raw.resumo_qualificacao),
    codigo_ref: asOptionalString(raw.codigo_ref),
    tracked_codigo_ref: asOptionalString(raw.tracked_codigo_ref),
    link_click_id: asNullableString(raw.link_click_id),
    conversation_state: asOptionalString(raw.conversation_state),
    em_follow_up: emFollowUp,
    em_followup: emFollowUp,
    followup_rodadas: asOptionalNumber(raw.followup_rodadas),
    followup_expira_em: asNullableString(raw.followup_expira_em),
    intervention_type: asOptionalString(raw.intervention_type),
    intervention_at: asOptionalString(raw.intervention_at),
    resetado_em: asNullableString(raw.resetado_em),
    status: asString(raw.status),
    corretor_id: asNullableString(raw.corretor_id),
    primeiro_contato: asOptionalString(raw.primeiro_contato),
    ultimo_contato: asOptionalString(raw.ultimo_contato),
    conversao_data: asNullableString(raw.conversao_data),
    created_at: asString(raw.created_at),
    updated_at: asString(raw.updated_at),
  };
}

export function buildLeadFiltersQuery(filters: LeadListFilters) {
  const params = new URLSearchParams();

  if (filters.status) {
    params.set("status", filters.status);
  }

  if (filters.fase) {
    params.set("fase", filters.fase);
  }

  if (filters.em_follow_up !== undefined) {
    params.set("em_follow_up", String(filters.em_follow_up));
  }

  if (filters.tipo_interesse) {
    params.set("tipo_interesse", filters.tipo_interesse);
  }

  if (filters.has_nome !== undefined) {
    params.set("has_nome", String(filters.has_nome));
  }

  if (filters.has_email !== undefined) {
    params.set("has_email", String(filters.has_email));
  }

  if (filters.canal_origem) {
    params.set("canal_origem", filters.canal_origem);
  }

  if (filters.sistema_origem) {
    params.set("sistema_origem", filters.sistema_origem);
  }

  if (filters.limit !== undefined) {
    params.set("limit", String(filters.limit));
  }

  if (filters.offset !== undefined) {
    params.set("offset", String(filters.offset));
  }

  return params;
}

export function buildInboundLeadPayload(values: LeadFormValues) {
  return {
    canal_origem: "INTERNO",
    sistema_origem: "DASHBOARD",
    nome: values.nome_completo.trim(),
    telefone: values.telefone.trim(),
    email: values.email.trim(),
    tipo_interesse: values.tipo_interesse.trim(),
    campanha_origem: values.campanha_origem?.trim() || undefined,
    origem_detalhada: "cadastro_manual",
    mensagem_inicial: values.mensagem_inicial?.trim() || undefined,
  };
}

export function buildLeadUpdatePayload(values: LeadFormValues) {
  return {
    nome_completo: values.nome_completo.trim(),
    email: values.email.trim(),
    estado_civil: values.estado_civil?.trim() || undefined,
    aniversario: values.aniversario?.trim() || undefined,
    tipo_interesse: values.tipo_interesse.trim(),
    renda_comprovada: values.renda_comprovada ?? 0,
    renda_comprovada_conjuge: values.renda_comprovada_conjuge ?? 0,
    fgts: values.fgts ?? 0,
    fgts_conjuge: values.fgts_conjuge ?? 0,
    tem_entrada: values.tem_entrada ?? false,
    entrada: values.entrada ?? 0,
    tem_carteira_assinada: values.tem_carteira_assinada ?? false,
    status: values.status,
    observacoes: values.observacoes?.trim() || undefined,
  };
}
