"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api/client";
import { getOffsetForPage } from "@/lib/leads/query-state";
import {
  InboxConversationDetail,
  InboxConversationFilters,
  InboxConversationSummary,
} from "@/types/dashboard";
import { Corretor } from "@/types/leads";
import {
  ArrowRight,
  Bot,
  MessageSquare,
  RefreshCw,
  RotateCcw,
  Send,
  ShieldAlert,
  UserRound,
  Users,
} from "lucide-react";

const PAGE_SIZE = 20;
const ACTOR_NAME = "Dashboard";
const ACTOR_TYPE = "admin";
const INBOX_FILTER_STATES = [
  "TRIAGE_HUMAN",
  "ASSIGNED_TO_BROKER",
  "HUMAN_ACTIVE",
  "HUMAN_STANDBY",
  "RETURNED_TO_BOT",
  "CLOSED",
] as const;
const MUTABLE_INBOX_STATES = [
  "TRIAGE_HUMAN",
  "HUMAN_ACTIVE",
  "HUMAN_STANDBY",
  "CLOSED",
] as const;

function stateTone(state: string) {
  switch (state) {
    case "TRIAGE_HUMAN":
      return "border-dd-accent-orange/20 bg-dd-accent-orange/10 text-dd-accent-orange";
    case "ASSIGNED_TO_BROKER":
      return "border-dd-accent-blue/20 bg-dd-accent-blue/10 text-dd-accent-blue";
    case "HUMAN_ACTIVE":
      return "border-dd-accent-green/20 bg-dd-accent-green/10 text-dd-accent-green";
    case "HUMAN_STANDBY":
      return "border-dd-border-subtle bg-dd-surface-overlay/10 text-dd-on-surface";
    case "RETURNED_TO_BOT":
      return "border-primary/20 bg-primary/10 text-primary";
    case "CLOSED":
      return "border-dd-accent-red/20 bg-dd-accent-red/10 text-dd-accent-red";
    default:
      return "border-dd-border-subtle bg-dd-surface-overlay/10 text-foreground";
  }
}

function stateLabel(state: string) {
  switch (state) {
    case "TRIAGE_HUMAN":
      return "Triagem humana";
    case "ASSIGNED_TO_BROKER":
      return "Atribuida";
    case "HUMAN_ACTIVE":
      return "Humano ativo";
    case "HUMAN_STANDBY":
      return "Humano em espera";
    case "RETURNED_TO_BOT":
      return "Devolvida ao bot";
    case "CLOSED":
      return "Fechada";
    default:
      return state || "-";
  }
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";

  try {
    return new Date(value).toLocaleString("pt-BR");
  } catch {
    return value;
  }
}

function summarySearchText(item: InboxConversationSummary) {
  return [
    item.nome_completo,
    item.telefone,
    item.owner_user_name,
    item.owner_user_type,
    item.qualification_summary,
    item.last_message_preview,
    item.canal_origem,
    item.sistema_origem,
    item.status,
    item.fase,
    item.conversation_state,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export default function ConversationsPage() {
  const [filters, setFilters] = useState<InboxConversationFilters>({
    limit: PAGE_SIZE,
    offset: 0,
  });
  const [conversations, setConversations] = useState<
    InboxConversationSummary[]
  >([]);
  const [meta, setMeta] = useState({ total: 0, limit: PAGE_SIZE, offset: 0 });
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] =
    useState<InboxConversationDetail | null>(null);
  const [corretores, setCorretores] = useState<Corretor[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [corretoresError, setCorretoresError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [introduceActor, setIntroduceActor] = useState(true);
  const [assignedCorretorId, setAssignedCorretorId] = useState("");
  const [assignNote, setAssignNote] = useState("");
  const [stateValue, setStateValue] = useState("HUMAN_STANDBY");
  const [stateReason, setStateReason] = useState("");
  const [returnReason, setReturnReason] = useState("");

  const requestFingerprint = JSON.stringify(filters);

  const loadInbox = useCallback(
    async (currentFilters: InboxConversationFilters) => {
      setLoading(true);
      setPageError(null);

      const [listResult, corretoresResult] = await Promise.all([
        api.getInboxConversations(currentFilters),
        api.getCorretores(),
      ]);

      if (listResult.error || !listResult.data) {
        setPageError(listResult.error ?? "Erro ao carregar inbox humana");
        setLoading(false);
        return;
      }

      const nextConversations = listResult.data.data;
      setConversations(nextConversations);
      setMeta(listResult.data.meta);
      setCorretores(corretoresResult.data ?? []);
      setCorretoresError(corretoresResult.error ?? null);
      setSelectedLeadId((current) => {
        if (nextConversations.length === 0) {
          return null;
        }

        if (
          current &&
          nextConversations.some((item) => item.lead_id === current)
        ) {
          return current;
        }

        return nextConversations[0]?.lead_id ?? null;
      });
      setLoading(false);
    },
    [],
  );

  const loadConversationDetail = useCallback(async (leadId: string) => {
    setDetailLoading(true);
    setDetailError(null);

    const detailResult = await api.getInboxConversationDetail(leadId);

    if (detailResult.error || !detailResult.data) {
      setSelectedConversation(null);
      setDetailError(detailResult.error ?? "Erro ao carregar detalhe da inbox");
      setDetailLoading(false);
      return;
    }

    setSelectedConversation(detailResult.data);
    setAssignedCorretorId(detailResult.data.assigned_corretor_id ?? "");
    setStateValue(
      MUTABLE_INBOX_STATES.includes(
        detailResult.data
          .conversation_state as (typeof MUTABLE_INBOX_STATES)[number],
      )
        ? detailResult.data.conversation_state
        : "HUMAN_STANDBY",
    );
    setDetailLoading(false);
  }, []);

  useEffect(() => {
    void loadInbox(filters);
  }, [filters, loadInbox, requestFingerprint]);

  useEffect(() => {
    if (!selectedLeadId) {
      setSelectedConversation(null);
      setDetailError(null);
      return;
    }

    void loadConversationDetail(selectedLeadId);
  }, [selectedLeadId, loadConversationDetail]);

  const visibleConversations = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    if (!normalized) {
      return conversations;
    }

    return conversations.filter((item) =>
      summarySearchText(item).includes(normalized),
    );
  }, [conversations, search]);

  const selectedSummary = useMemo(
    () => conversations.find((item) => item.lead_id === selectedLeadId) ?? null,
    [conversations, selectedLeadId],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(meta.total / Math.max(meta.limit, 1)),
  );
  const currentPage = Math.floor(meta.offset / Math.max(meta.limit, 1)) + 1;

  async function refreshSelectedConversation() {
    if (selectedLeadId) {
      await loadConversationDetail(selectedLeadId);
    }

    await loadInbox(filters);
  }

  async function handleSendMessage() {
    if (!selectedLeadId || !message.trim()) {
      return;
    }

    setDetailError(null);

    const result = await api.sendInboxMessage(selectedLeadId, {
      message: message.trim(),
      actor_name: ACTOR_NAME,
      actor_type: ACTOR_TYPE,
      introduce_actor: introduceActor,
    });

    if (result.error) {
      setDetailError(result.error);
      return;
    }

    setMessage("");
    setIntroduceActor(false);
    await refreshSelectedConversation();
  }

  async function handleAssignConversation() {
    if (!selectedLeadId || !assignedCorretorId) {
      return;
    }

    setDetailError(null);

    const result = await api.assignInboxConversation(selectedLeadId, {
      assigned_corretor_id: assignedCorretorId,
      assigned_by: ACTOR_NAME,
      note: assignNote || undefined,
    });

    if (result.error) {
      setDetailError(result.error);
      return;
    }

    setAssignNote("");
    await refreshSelectedConversation();
  }

  async function handleStateChange() {
    if (!selectedLeadId) {
      return;
    }

    setDetailError(null);

    const result = await api.updateInboxConversationState(selectedLeadId, {
      state: stateValue,
      actor_name: ACTOR_NAME,
      reason: stateReason || undefined,
    });

    if (result.error) {
      setDetailError(result.error);
      return;
    }

    setStateReason("");
    await refreshSelectedConversation();
  }

  async function handleReturnToBot() {
    if (!selectedLeadId) {
      return;
    }

    setDetailError(null);

    const result = await api.returnInboxConversationToBot(selectedLeadId, {
      actor_name: ACTOR_NAME,
      reason: returnReason || undefined,
    });

    if (result.error) {
      setDetailError(result.error);
      return;
    }

    setReturnReason("");
    await refreshSelectedConversation();
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-dd-border-subtle border-t-dd-on-muted" />
          <p className="text-dd-on-muted text-xs">Carregando inbox...</p>
        </div>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center text-dd-accent-red">
          <p className="text-sm font-medium">Erro ao carregar</p>
          <p className="text-xs text-dd-on-muted mt-1">{pageError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-lg font-medium tracking-tight text-dd-on-primary">
            Inbox Humana
          </h1>
          <p className="text-xs text-dd-on-muted mt-0.5">
            Atendimento no mesmo numero do bot
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="secondary"
            className="bg-dd-surface-raised text-dd-on-surface border-dd-border-subtle text-[10px]"
          >
            {meta.total} na fila
          </Badge>
          <Badge
            variant="outline"
            className="border-dd-border-subtle text-dd-on-muted text-[10px]"
          >
            {visibleConversations.length} visiveis
          </Badge>
          {selectedSummary ? (
            <Badge
              variant="outline"
              className={stateTone(selectedSummary.conversation_state)}
            >
              {stateLabel(selectedSummary.conversation_state)}
            </Badge>
          ) : null}
          <Button
            variant="outline"
            onClick={() => void refreshSelectedConversation()}
            className="h-7 text-[10px]"
          >
            <RefreshCw className="mr-1.5 h-3 w-3" />
            Atualizar
          </Button>
        </div>
      </div>

      <Card className="card-premium">
        <CardHeader className="border-b border-dd-border-subtle pb-3">
          <CardTitle className="text-sm font-medium text-dd-on-primary">
            Filtros
          </CardTitle>
          <CardDescription className="text-dd-on-muted text-[10px]">
            Busca local sobre os resultados carregados
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 pt-4">
          <Input
            placeholder="Buscar por lead, telefone, owner ou mensagem"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <Select
            value={filters.state ?? "all"}
            onValueChange={(value) => {
              const nextState = value && value !== "all" ? value : undefined;

              setFilters({
                ...filters,
                state: nextState,
                offset: 0,
              });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Estado da conversa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os estados</SelectItem>
              {INBOX_FILTER_STATES.map((state) => (
                <SelectItem key={state} value={state}>
                  {stateLabel(state)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Owner (nome)"
            value={filters.owner_user_name ?? ""}
            onChange={(event) =>
              setFilters({
                ...filters,
                owner_user_name: event.target.value || undefined,
                offset: 0,
              })
            }
          />

          <Input
            placeholder="Corretor atribuido (id)"
            value={filters.assigned_corretor_id ?? ""}
            onChange={(event) =>
              setFilters({
                ...filters,
                assigned_corretor_id: event.target.value || undefined,
                offset: 0,
              })
            }
          />

          <Input
            placeholder="Canal de origem"
            value={filters.canal_origem ?? ""}
            onChange={(event) =>
              setFilters({
                ...filters,
                canal_origem: event.target.value || undefined,
                offset: 0,
              })
            }
          />

          <Input
            placeholder="Sistema de origem"
            value={filters.sistema_origem ?? ""}
            onChange={(event) =>
              setFilters({
                ...filters,
                sistema_origem: event.target.value || undefined,
                offset: 0,
              })
            }
          />

          <Input
            placeholder="Status do lead"
            value={filters.status ?? ""}
            onChange={(event) =>
              setFilters({
                ...filters,
                status: event.target.value || undefined,
                offset: 0,
              })
            }
          />

          <Input
            placeholder="Fase do lead"
            value={filters.fase ?? ""}
            onChange={(event) =>
              setFilters({
                ...filters,
                fase: event.target.value || undefined,
                offset: 0,
              })
            }
          />

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSearch("");
              setFilters({ limit: PAGE_SIZE, offset: 0 });
            }}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Limpar filtros
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <Card className="card-premium">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>Fila da Inbox</CardTitle>
                <CardDescription>
                  Pagina {currentPage} de {totalPages}
                </CardDescription>
              </div>
              <Badge variant="secondary">{meta.total}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {visibleConversations.length === 0 ? (
              <div className="rounded-xl border border-dashed border-dd-border-subtle px-4 py-12 text-center text-dd-on-muted">
                Nenhuma conversa encontrada para os filtros atuais.
              </div>
            ) : (
              <div className="space-y-3">
                {visibleConversations.map((item) => {
                  const isSelected = item.lead_id === selectedLeadId;

                  return (
                    <button
                      key={item.lead_id}
                      type="button"
                      onClick={() => setSelectedLeadId(item.lead_id)}
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        isSelected
                          ? "border-primary/40 bg-primary/5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]"
                          : "border-dd-border-subtle bg-background/40 hover:border-primary/20 hover:bg-dd-surface-overlay/10"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 space-y-1">
                          <div className="truncate font-medium">
                            {item.nome_completo || item.telefone}
                          </div>
                          <div className="text-xs text-dd-on-muted">
                            {item.telefone}
                          </div>
                        </div>
                        <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-dd-on-muted" />
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge
                          variant="outline"
                          className={stateTone(item.conversation_state)}
                        >
                          {stateLabel(item.conversation_state)}
                        </Badge>
                        <Badge variant="outline">{item.status || "-"}</Badge>
                        <Badge variant="outline">{item.fase || "-"}</Badge>
                      </div>

                      <div className="mt-3 space-y-2 text-xs text-dd-on-muted">
                        <div className="line-clamp-2">
                          {item.qualification_summary ||
                            "Sem resumo de qualificacao."}
                        </div>
                        <div className="line-clamp-2">
                          Ultima mensagem:{" "}
                          {item.last_message_preview || "Sem preview"}
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-1">
                          <span>Owner: {item.owner_user_name || "-"}</span>
                          <span>Canal: {item.canal_origem || "-"}</span>
                          <span>
                            Atualizada: {formatDateTime(item.updated_at)}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <Pagination className="justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    text="Anterior"
                    onClick={(event) => {
                      event.preventDefault();
                      if (currentPage === 1) return;
                      setFilters({
                        ...filters,
                        offset: getOffsetForPage(currentPage - 1, meta.limit),
                      });
                    }}
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>
                    {currentPage}
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    text="Proxima"
                    onClick={(event) => {
                      event.preventDefault();
                      if (currentPage >= totalPages) return;
                      setFilters({
                        ...filters,
                        offset: getOffsetForPage(currentPage + 1, meta.limit),
                      });
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardContent>
        </Card>

        <Card className="card-premium">
          <CardHeader>
            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <CardTitle>Operacao da Conversa</CardTitle>
                <CardDescription>
                  {selectedConversation
                    ? `${selectedConversation.nome_completo || selectedConversation.telefone}`
                    : "Selecione uma conversa para responder, atribuir ou devolver ao bot."}
                </CardDescription>
              </div>
              {selectedConversation ? (
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className={stateTone(
                      selectedConversation.conversation_state,
                    )}
                  >
                    {stateLabel(selectedConversation.conversation_state)}
                  </Badge>
                  <Badge variant="outline">
                    {selectedConversation.status || "-"}
                  </Badge>
                  <Badge variant="outline">
                    {selectedConversation.fase || "-"}
                  </Badge>
                </div>
              ) : null}
            </div>
          </CardHeader>
          <CardContent>
            {!selectedLeadId ? (
              <div className="rounded-xl border border-dashed border-dd-border-subtle px-4 py-12 text-dd-on-muted">
                Nenhuma conversa disponivel nesta pagina.
              </div>
            ) : detailLoading ? (
              <div className="py-12 text-dd-on-muted">
                Carregando detalhe da conversa...
              </div>
            ) : detailError ? (
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-6 text-sm text-destructive">
                {detailError}
              </div>
            ) : !selectedConversation ? (
              <div className="py-12 text-dd-on-muted">
                Sem detalhe carregado.
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="rounded-2xl border border-dd-border-subtle p-4">
                    <div className="text-xs uppercase tracking-wide text-dd-on-muted">
                      Lead
                    </div>
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="font-medium">
                        {selectedConversation.nome_completo ||
                          selectedConversation.telefone}
                      </div>
                      <div>
                        Telefone: {selectedConversation.telefone || "-"}
                      </div>
                      <div>Email: {selectedConversation.email || "-"}</div>
                      <div>
                        Atualizada:{" "}
                        {formatDateTime(selectedConversation.updated_at)}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-dd-border-subtle p-4">
                    <div className="text-xs uppercase tracking-wide text-dd-on-muted">
                      Origem e tracking
                    </div>
                    <div className="mt-3 space-y-2 text-sm">
                      <div>
                        Canal: {selectedConversation.canal_origem || "-"}
                      </div>
                      <div>
                        Sistema: {selectedConversation.sistema_origem || "-"}
                      </div>
                      <div>
                        Tracked ref:{" "}
                        {selectedConversation.tracked_codigo_ref || "-"}
                      </div>
                      <div>
                        Link click ID:{" "}
                        {selectedConversation.link_click_id || "-"}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-dd-border-subtle p-4">
                    <div className="text-xs uppercase tracking-wide text-dd-on-muted">
                      Ownership humano
                    </div>
                    <div className="mt-3 space-y-2 text-sm">
                      <div>
                        Owner: {selectedConversation.owner_user_name || "-"}
                      </div>
                      <div>
                        Tipo: {selectedConversation.owner_user_type || "-"}
                      </div>
                      <div>
                        Corretor:{" "}
                        {selectedConversation.assigned_corretor_id ||
                          "Nao atribuido"}
                      </div>
                      <div>
                        Atribuido por: {selectedConversation.assigned_by || "-"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-dd-border-subtle p-4">
                  <div className="text-xs uppercase tracking-wide text-dd-on-muted">
                    Resumo da conversa
                  </div>
                  <div className="mt-3 grid gap-3 lg:grid-cols-2">
                    <div className="rounded-xl bg-dd-surface-overlay/10 p-3 text-sm">
                      <div className="text-xs text-dd-on-muted">
                        Qualificacao
                      </div>
                      <div className="mt-1">
                        {selectedConversation.qualification_summary || "-"}
                      </div>
                    </div>
                    <div className="rounded-xl bg-dd-surface-overlay/10 p-3 text-sm">
                      <div className="text-xs text-dd-on-muted">
                        Ultimo preview
                      </div>
                      <div className="mt-1">
                        {selectedConversation.last_message_preview ||
                          "Sem preview"}
                      </div>
                    </div>
                  </div>
                </div>

                {selectedConversation.operational_status ? (
                  <div className="rounded-2xl border border-dd-border-subtle p-4">
                    <div className="text-xs uppercase tracking-wide text-dd-on-muted">
                      Resumo operacional
                    </div>
                    <div className="mt-3 grid gap-3 lg:grid-cols-3">
                      <div className="rounded-xl bg-dd-surface-overlay/10 p-3 text-sm">
                        <div className="text-xs text-dd-on-muted">
                          Acao recomendada
                        </div>
                        <div className="mt-1">
                          {selectedConversation.operational_status
                            .recommended_action || "-"}
                        </div>
                      </div>
                      <div className="rounded-xl bg-dd-surface-overlay/10 p-3 text-sm">
                        <div className="text-xs text-dd-on-muted">
                          Campos faltantes
                        </div>
                        <div className="mt-1">
                          {selectedConversation.operational_status.missing_fields.join(
                            ", ",
                          ) || "-"}
                        </div>
                      </div>
                      <div className="rounded-xl bg-dd-surface-overlay/10 p-3 text-sm">
                        <div className="text-xs text-dd-on-muted">
                          Ultima msg do bot
                        </div>
                        <div className="mt-1">
                          {selectedConversation.operational_status
                            .last_bot_message || "-"}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
                  <div className="rounded-2xl border border-dd-border-subtle p-4">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-dd-on-muted">
                      <MessageSquare className="h-4 w-4" />
                      Mensagens da conversa
                    </div>
                    <div className="mt-4 max-h-[520px] space-y-3 overflow-y-auto pr-1">
                      {selectedConversation.messages.length > 0 ? (
                        selectedConversation.messages.map((item) => {
                          const isOutgoing = item.direction === "SAIDA";

                          return (
                            <div
                              key={
                                item.id || `${item.timestamp}-${item.content}`
                              }
                              className={`flex ${isOutgoing ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-[85%] rounded-2xl border p-4 ${
                                  isOutgoing
                                    ? "border-primary/20 bg-primary/10"
                                    : "border-dd-border-subtle bg-dd-surface-overlay/10"
                                }`}
                              >
                                <div className="flex items-center gap-2 text-xs text-dd-on-muted">
                                  {isOutgoing ? (
                                    <Bot className="h-3 w-3" />
                                  ) : (
                                    <UserRound className="h-3 w-3" />
                                  )}
                                  <span>
                                    {item.actor_name ||
                                      item.actor_type ||
                                      item.direction}
                                  </span>
                                  <span>·</span>
                                  <span>{formatDateTime(item.timestamp)}</span>
                                </div>
                                <div className="mt-2 whitespace-pre-wrap text-sm">
                                  {item.content || "-"}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="rounded-xl border border-dashed border-dd-border-subtle px-4 py-10 text-center text-sm text-dd-on-muted">
                          Nenhuma mensagem retornada pelo detalhe desta
                          conversa.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-2xl border border-dd-border-subtle p-4">
                      <div className="text-xs uppercase tracking-wide text-dd-on-muted">
                        Responder como humano
                      </div>
                      <Textarea
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        className="mt-3 min-h-28"
                        placeholder="Digite a mensagem da equipe humana..."
                      />
                      <label className="mt-3 flex items-center gap-2 text-sm text-dd-on-muted">
                        <input
                          type="checkbox"
                          checked={introduceActor}
                          onChange={(event) =>
                            setIntroduceActor(event.target.checked)
                          }
                        />
                        Identificar o atendente nesta mensagem
                      </label>
                      <Button
                        className="mt-4 w-full"
                        onClick={() => void handleSendMessage()}
                        disabled={!message.trim()}
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Enviar mensagem
                      </Button>
                    </div>

                    <div className="rounded-2xl border border-dd-border-subtle p-4">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-dd-on-muted">
                        <Users className="h-4 w-4" />
                        Atribuicao para corretor
                      </div>
                      {corretoresError ? (
                        <div className="mt-3 rounded-xl border border-dd-accent-orange/20 bg-dd-accent-orange/10 px-3 py-2 text-xs text-dd-accent-orange">
                          Lista de corretores indisponivel agora:{" "}
                          {corretoresError}
                        </div>
                      ) : null}
                      <select
                        value={assignedCorretorId}
                        onChange={(event) =>
                          setAssignedCorretorId(event.target.value)
                        }
                        className="mt-3 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="">Selecione um corretor</option>
                        {corretores.map((corretor) => (
                          <option key={corretor.id} value={corretor.id}>
                            {corretor.nome}
                          </option>
                        ))}
                      </select>
                      <Input
                        className="mt-3"
                        placeholder="Nota da atribuicao"
                        value={assignNote}
                        onChange={(event) => setAssignNote(event.target.value)}
                      />
                      <Button
                        variant="outline"
                        className="mt-4 w-full"
                        onClick={() => void handleAssignConversation()}
                        disabled={
                          !assignedCorretorId || corretores.length === 0
                        }
                      >
                        Atribuir conversa
                      </Button>
                    </div>

                    <div className="rounded-2xl border border-dd-border-subtle p-4">
                      <div className="text-xs uppercase tracking-wide text-dd-on-muted">
                        Alterar estado humano
                      </div>
                      <Select
                        value={stateValue}
                        onValueChange={(value) =>
                          setStateValue(value || "HUMAN_STANDBY")
                        }
                      >
                        <SelectTrigger className="mt-3">
                          <SelectValue placeholder="Selecione o estado" />
                        </SelectTrigger>
                        <SelectContent>
                          {MUTABLE_INBOX_STATES.map((state) => (
                            <SelectItem key={state} value={state}>
                              {stateLabel(state)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        className="mt-3"
                        placeholder="Motivo da mudanca"
                        value={stateReason}
                        onChange={(event) => setStateReason(event.target.value)}
                      />
                      <Button
                        variant="outline"
                        className="mt-4 w-full"
                        onClick={() => void handleStateChange()}
                      >
                        Atualizar estado
                      </Button>
                    </div>

                    <div className="rounded-2xl border border-dd-border-subtle p-4">
                      <div className="text-xs uppercase tracking-wide text-dd-on-muted">
                        Encerrar atendimento humano
                      </div>
                      <Input
                        className="mt-3"
                        placeholder="Motivo do retorno ao bot"
                        value={returnReason}
                        onChange={(event) =>
                          setReturnReason(event.target.value)
                        }
                      />
                      <Button
                        variant="outline"
                        className="mt-4 w-full"
                        onClick={() => void handleReturnToBot()}
                      >
                        <ShieldAlert className="mr-2 h-4 w-4" />
                        Devolver ao bot
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
