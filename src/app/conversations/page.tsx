"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { api } from "@/lib/api/client";
import { Corretor } from "@/types/leads";
import {
  InboxConversationDetail,
  InboxConversationFilters,
  InboxConversationSummary,
} from "@/types/dashboard";
import { getOffsetForPage } from "@/lib/leads/query-state";
import {
  ArrowRight,
  Bot,
  MessageSquare,
  RotateCcw,
  Send,
  ShieldAlert,
  UserRound,
} from "lucide-react";

const PAGE_SIZE = 20;
const ACTOR_NAME = "Dashboard";
const ACTOR_TYPE = "admin";
const INBOX_STATES = [
  "TRIAGE_HUMAN",
  "ASSIGNED_TO_BROKER",
  "HUMAN_ACTIVE",
  "HUMAN_STANDBY",
  "RETURNED_TO_BOT",
  "CLOSED",
] as const;

function stateTone(state: string) {
  switch (state) {
    case "TRIAGE_HUMAN":
      return "border-amber-500/20 bg-amber-500/10 text-amber-300";
    case "ASSIGNED_TO_BROKER":
      return "border-blue-500/20 bg-blue-500/10 text-blue-300";
    case "HUMAN_ACTIVE":
      return "border-green-500/20 bg-green-500/10 text-green-400";
    case "HUMAN_STANDBY":
      return "border-zinc-500/20 bg-zinc-500/10 text-zinc-300";
    case "RETURNED_TO_BOT":
      return "border-primary/20 bg-primary/10 text-primary";
    case "CLOSED":
      return "border-red-500/20 bg-red-500/10 text-red-300";
    default:
      return "border-border/50 bg-secondary/30 text-foreground";
  }
}

export default function ConversationsPage() {
  const [filters, setFilters] = useState<InboxConversationFilters>({
    limit: PAGE_SIZE,
    offset: 0,
  });
  const [conversations, setConversations] = useState<InboxConversationSummary[]>([]);
  const [meta, setMeta] = useState({ total: 0, limit: PAGE_SIZE, offset: 0 });
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] =
    useState<InboxConversationDetail | null>(null);
  const [corretores, setCorretores] = useState<Corretor[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [introduceActor, setIntroduceActor] = useState(true);
  const [assignedCorretorId, setAssignedCorretorId] = useState("");
  const [assignNote, setAssignNote] = useState("");
  const [stateValue, setStateValue] = useState("HUMAN_STANDBY");
  const [stateReason, setStateReason] = useState("");
  const [returnReason, setReturnReason] = useState("");

  const requestFingerprint = JSON.stringify(filters);

  const loadInbox = useCallback(async (currentFilters: InboxConversationFilters) => {
    setLoading(true);
    setError(null);

    const [listResult, corretoresResult] = await Promise.all([
      api.getInboxConversations(currentFilters),
      api.getCorretores(),
    ]);

    const firstError = listResult.error ?? corretoresResult.error ?? null;

    if (firstError || !listResult.data) {
      setError(firstError ?? "Erro ao carregar inbox humana");
      setLoading(false);
      return;
    }

    setConversations(listResult.data.data);
    setMeta(listResult.data.meta);
    setCorretores(corretoresResult.data ?? []);
    setLoading(false);
  }, []);

  const loadConversationDetail = useCallback(async (leadId: string) => {
    setDetailLoading(true);
    const detailResult = await api.getInboxConversationDetail(leadId);

    if (detailResult.error || !detailResult.data) {
      setError(detailResult.error ?? "Erro ao carregar detalhe da inbox");
      setDetailLoading(false);
      return;
    }

    setSelectedConversation(detailResult.data);
    setAssignedCorretorId(detailResult.data.assigned_corretor_id ?? "");
    setStateValue(
      detailResult.data.conversation_state === "ASSIGNED_TO_BROKER"
        ? "HUMAN_ACTIVE"
        : detailResult.data.conversation_state || "HUMAN_STANDBY"
    );
    setDetailLoading(false);
  }, []);

  useEffect(() => {
    void loadInbox(filters);
  }, [filters, loadInbox, requestFingerprint]);

  useEffect(() => {
    if (!selectedLeadId) {
      setSelectedConversation(null);
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
      [
        item.nome_completo,
        item.telefone,
        item.owner_user_name,
        item.qualification_summary,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalized))
    );
  }, [conversations, search]);

  const totalPages = Math.max(1, Math.ceil(meta.total / meta.limit));
  const currentPage = Math.floor(meta.offset / meta.limit) + 1;

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

    const result = await api.sendInboxMessage(selectedLeadId, {
      message: message.trim(),
      actor_name: ACTOR_NAME,
      actor_type: ACTOR_TYPE,
      introduce_actor: introduceActor,
    });

    if (result.error) {
      setError(result.error);
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

    const result = await api.assignInboxConversation(selectedLeadId, {
      assigned_corretor_id: assignedCorretorId,
      assigned_by: ACTOR_NAME,
      note: assignNote || undefined,
    });

    if (result.error) {
      setError(result.error);
      return;
    }

    await refreshSelectedConversation();
  }

  async function handleStateChange() {
    if (!selectedLeadId) {
      return;
    }

    const result = await api.updateInboxConversationState(selectedLeadId, {
      state: stateValue,
      actor_name: ACTOR_NAME,
      reason: stateReason || undefined,
    });

    if (result.error) {
      setError(result.error);
      return;
    }

    setStateReason("");
    await refreshSelectedConversation();
  }

  async function handleReturnToBot() {
    if (!selectedLeadId) {
      return;
    }

    const result = await api.returnInboxConversationToBot(selectedLeadId, {
      actor_name: ACTOR_NAME,
      reason: returnReason || undefined,
    });

    if (result.error) {
      setError(result.error);
      return;
    }

    setReturnReason("");
    await refreshSelectedConversation();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
          <p className="text-muted-foreground">Carregando inbox humana...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive text-center">
          <p className="font-semibold">Erro ao carregar</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inbox Humana</h1>
        <p className="text-muted-foreground">
          Atendimento humano no mesmo numero do bot, dirigido por conversation_state
        </p>
      </div>

      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle>Filtros da Inbox</CardTitle>
          <CardDescription>Consumo canonico de /api/v1/inbox/conversations</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Input
            placeholder="Busca local na pagina"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Input
            placeholder="conversation_state"
            value={filters.state ?? ""}
            onChange={(event) =>
              setFilters({ ...filters, state: event.target.value || undefined, offset: 0 })
            }
          />
          <Input
            placeholder="owner_user_name"
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
            placeholder="assigned_corretor_id"
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
            placeholder="canal_origem"
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
            placeholder="sistema_origem"
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
            placeholder="status"
            value={filters.status ?? ""}
            onChange={(event) =>
              setFilters({ ...filters, status: event.target.value || undefined, offset: 0 })
            }
          />
          <Input
            placeholder="fase"
            value={filters.fase ?? ""}
            onChange={(event) =>
              setFilters({ ...filters, fase: event.target.value || undefined, offset: 0 })
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

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="glass border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Conversas</CardTitle>
                <CardDescription>
                  Pagina {currentPage} de {totalPages}
                </CardDescription>
              </div>
              <Badge variant="secondary">{meta.total} conversas</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {visibleConversations.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                Nenhuma conversa encontrada.
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-border/50">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lead</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Ultima mensagem</TableHead>
                      <TableHead className="text-right">Selecionar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleConversations.map((item) => (
                      <TableRow
                        key={item.lead_id}
                        className={item.lead_id === selectedLeadId ? "bg-secondary/30" : ""}
                      >
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">
                              {item.nome_completo || item.telefone}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {item.telefone}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {item.qualification_summary || "Sem resumo"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={stateTone(item.conversation_state)}>
                            {item.conversation_state || "-"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div>{item.owner_user_name || "-"}</div>
                            <div className="text-xs text-muted-foreground">
                              {item.owner_user_type || "-"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div>{item.last_message_preview || "-"}</div>
                            <div className="text-xs text-muted-foreground">
                              {item.last_message_direction || "-"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            onClick={() => setSelectedLeadId(item.lead_id)}
                          >
                            Abrir
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <Pagination className="mt-6 justify-end">
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

        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle>Detalhe da Conversa</CardTitle>
            <CardDescription>
              {selectedConversation
                ? selectedConversation.nome_completo || selectedConversation.telefone
                : "Selecione uma conversa para operar a inbox"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedLeadId ? (
              <div className="py-12 text-muted-foreground">Nenhuma conversa selecionada.</div>
            ) : detailLoading ? (
              <div className="py-12 text-muted-foreground">Carregando detalhe da conversa...</div>
            ) : !selectedConversation ? (
              <div className="py-12 text-muted-foreground">Sem detalhe carregado.</div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className={stateTone(selectedConversation.conversation_state)}>
                    {selectedConversation.conversation_state}
                  </Badge>
                  <Badge variant="outline">{selectedConversation.status || "-"}</Badge>
                  <Badge variant="outline">{selectedConversation.fase || "-"}</Badge>
                  {selectedConversation.assigned_corretor_id && (
                    <Badge variant="outline">
                      Corretor: {selectedConversation.assigned_corretor_id}
                    </Badge>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-border/50 p-4">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                      Origem e tracking
                    </div>
                    <div className="mt-2 space-y-1 text-sm">
                      <div>Canal: {selectedConversation.canal_origem || "-"}</div>
                      <div>Sistema: {selectedConversation.sistema_origem || "-"}</div>
                      <div>Tracked ref: {selectedConversation.tracked_codigo_ref || "-"}</div>
                      <div>Link click ID: {selectedConversation.link_click_id || "-"}</div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-border/50 p-4">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                      Owner
                    </div>
                    <div className="mt-2 space-y-1 text-sm">
                      <div>Nome: {selectedConversation.owner_user_name || "-"}</div>
                      <div>Tipo: {selectedConversation.owner_user_type || "-"}</div>
                      <div>Atribuido por: {selectedConversation.assigned_by || "-"}</div>
                    </div>
                  </div>
                </div>

                {selectedConversation.operational_status && (
                  <div className="rounded-xl border border-border/50 p-4">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                      Resumo operacional
                    </div>
                    <div className="mt-2 space-y-1 text-sm">
                      <div>
                        Acao recomendada:{" "}
                        {selectedConversation.operational_status.recommended_action || "-"}
                      </div>
                      <div>
                        Campos faltantes:{" "}
                        {selectedConversation.operational_status.missing_fields.join(", ") || "-"}
                      </div>
                      <div>
                        Ultimo bot: {selectedConversation.operational_status.last_bot_message || "-"}
                      </div>
                    </div>
                  </div>
                )}

                <div className="rounded-xl border border-border/50 p-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                    <MessageSquare className="h-4 w-4" />
                    Mensagens
                  </div>
                  <div className="mt-4 space-y-3 max-h-72 overflow-y-auto">
                    {selectedConversation.messages.length > 0 ? (
                      selectedConversation.messages.map((item) => (
                        <div
                          key={item.id || `${item.timestamp}-${item.content}`}
                          className={`rounded-xl p-3 ${
                            item.direction === "SAIDA"
                              ? "bg-primary/10 border border-primary/20"
                              : "bg-secondary/40 border border-border/50"
                          }`}
                        >
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {item.direction === "SAIDA" ? (
                              <Bot className="h-3 w-3" />
                            ) : (
                              <UserRound className="h-3 w-3" />
                            )}
                            <span>{item.actor_name || item.actor_type || item.direction}</span>
                            <span>·</span>
                            <span>
                              {item.timestamp
                                ? new Date(item.timestamp).toLocaleString("pt-BR")
                                : "-"}
                            </span>
                          </div>
                          <div className="mt-2 text-sm">{item.content || "-"}</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground">Nenhuma mensagem retornada pelo detalhe.</div>
                    )}
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-xl border border-border/50 p-4 space-y-3">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                      Enviar mensagem humana
                    </div>
                    <textarea
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="Digite a mensagem da equipe humana..."
                    />
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={introduceActor}
                        onChange={(event) => setIntroduceActor(event.target.checked)}
                      />
                      Introduzir atendente nesta mensagem
                    </label>
                    <Button onClick={() => void handleSendMessage()}>
                      <Send className="mr-2 h-4 w-4" />
                      Enviar mensagem
                    </Button>
                  </div>

                  <div className="rounded-xl border border-border/50 p-4 space-y-3">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                      Atribuir para corretor
                    </div>
                    <select
                      value={assignedCorretorId}
                      onChange={(event) => setAssignedCorretorId(event.target.value)}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="">Selecione um corretor</option>
                      {corretores.map((corretor) => (
                        <option key={corretor.id} value={corretor.id}>
                          {corretor.nome}
                        </option>
                      ))}
                    </select>
                    <Input
                      placeholder="Nota de atribuicao"
                      value={assignNote}
                      onChange={(event) => setAssignNote(event.target.value)}
                    />
                    <Button variant="outline" onClick={() => void handleAssignConversation()}>
                      Atribuir conversa
                    </Button>
                  </div>

                  <div className="rounded-xl border border-border/50 p-4 space-y-3">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                      Alterar estado da conversa
                    </div>
                    <select
                      value={stateValue}
                      onChange={(event) => setStateValue(event.target.value)}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      {INBOX_STATES.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                    <Input
                      placeholder="Motivo da mudanca"
                      value={stateReason}
                      onChange={(event) => setStateReason(event.target.value)}
                    />
                    <Button variant="outline" onClick={() => void handleStateChange()}>
                      Atualizar estado
                    </Button>
                  </div>

                  <div className="rounded-xl border border-border/50 p-4 space-y-3">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                      Devolver ao bot
                    </div>
                    <Input
                      placeholder="Motivo do retorno ao bot"
                      value={returnReason}
                      onChange={(event) => setReturnReason(event.target.value)}
                    />
                    <Button variant="outline" onClick={() => void handleReturnToBot()}>
                      <ShieldAlert className="mr-2 h-4 w-4" />
                      Return to bot
                    </Button>
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
