"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { X, Edit, Send, UserCheck, UserX, RotateCcw } from "lucide-react";
import { api } from "@/lib/api/client";
import { Conversa, Lead, Mensagem, Tag } from "@/types/leads";
import { TagManager } from "./TagManager";
import {
  LeadAction,
  LeadHumanIntervention,
  OperationalStatus,
} from "@/types/dashboard";

interface LeadDetailPanelProps {
  lead: Lead;
  onClose: () => void;
  onEdit: (lead: Lead) => void;
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
  }).format(new Date(value));
}

function toneForState(value?: string | null) {
  const state = value ?? "";
  switch (state) {
    case "TRIAGE_HUMAN":
    case "HUMAN_ACTIVE":
      return "border-dd-accent-orange/20 bg-dd-accent-orange/10 text-dd-accent-orange";
    case "ASSIGNED_TO_BROKER":
      return "border-dd-accent-blue/20 bg-dd-accent-blue/10 text-dd-accent-blue";
    case "RETURNED_TO_BOT":
      return "border-dd-accent-green/20 bg-dd-accent-green/10 text-dd-accent-green";
    case "CLOSED":
      return "border-dd-border-subtle bg-dd-surface-overlay/10 text-dd-on-surface";
    default:
      return "border-dd-border bg-dd-surface-overlay/40 text-dd-on-muted";
  }
}

function toneForStatus(value?: string) {
  switch (value) {
    case "NOVO":
      return "border-dd-accent-orange/20 bg-dd-accent-orange/10 text-dd-accent-orange";
    case "EM_ATENDIMENTO":
      return "border-dd-accent-blue/20 bg-dd-accent-blue/10 text-dd-accent-blue";
    case "CONVERTIDO":
      return "border-dd-accent-green/20 bg-dd-accent-green/10 text-dd-accent-green";
    case "PERDIDO":
      return "border-dd-accent-red/20 bg-dd-accent-red/10 text-dd-accent-red";
    default:
      return "border-dd-border bg-dd-surface-overlay/40 text-dd-on-muted";
  }
}

export function LeadDetailPanel({
  lead,
  onClose,
  onEdit,
}: LeadDetailPanelProps) {
  const [operationalStatus, setOperationalStatus] =
    useState<OperationalStatus | null>(null);
  const [humanIntervention, setHumanIntervention] =
    useState<LeadHumanIntervention | null>(null);
  const [actions, setActions] = useState<LeadAction[]>([]);
  const [conversations, setConversations] = useState<Conversa[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<Mensagem[]>([]);
  const [leadTags, setLeadTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDetail() {
      setLoading(true);
      setError(null);

      const [
        operationalResult,
        humanResult,
        actionsResult,
        conversationsResult,
        tagsResult,
      ] = await Promise.all([
        api.getLeadOperationalStatus(lead.id),
        api.getLeadHumanIntervention(lead.id),
        api.getLeadActions(lead.id, 10, 0),
        api.getLeadConversations(lead.id),
        api.getLeadTags(lead.id),
      ]);

      if (cancelled) return;

      const firstError =
        operationalResult.error ??
        humanResult.error ??
        actionsResult.error ??
        conversationsResult.error ??
        tagsResult.error ??
        null;

      if (firstError) {
        setError(firstError);
        setLoading(false);
        return;
      }

      const nextConversations = conversationsResult.data ?? [];

      setOperationalStatus(operationalResult.data ?? null);
      setHumanIntervention(humanResult.data ?? null);
      setActions(actionsResult.data?.data ?? []);
      setConversations(nextConversations);
      setSelectedConversationId(nextConversations[0]?.id ?? null);
      setLeadTags(tagsResult.data ?? []);
      setLoading(false);
    }

    void loadDetail();

    return () => {
      cancelled = true;
    };
  }, [lead.id]);

  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      return;
    }

    const currentConversationId = selectedConversationId;
    let cancelled = false;

    async function loadMessages() {
      setMessagesLoading(true);
      const result = await api.getConversationMessages(currentConversationId);

      if (cancelled) return;

      if (result.error || !result.data) {
        setMessagesLoading(false);
        return;
      }

      const sorted = [...result.data.data].sort(
        (left, right) =>
          new Date(left.timestamp).getTime() -
          new Date(right.timestamp).getTime(),
      );

      setMessages(sorted);
      setMessagesLoading(false);
    }

    void loadMessages();

    return () => {
      cancelled = true;
    };
  }, [selectedConversationId]);

  const selectedConversation = useMemo(
    () =>
      conversations.find((item) => item.id === selectedConversationId) ?? null,
    [conversations, selectedConversationId],
  );

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setSendingMessage(true);
    const result = await api.sendInboxMessage(lead.id, {
      message: newMessage,
      actor_name: "Dashboard",
      actor_type: "admin",
      introduce_actor: false,
    });

    if (result.error) {
      setError(result.error);
      setSendingMessage(false);
      return;
    }

    setNewMessage("");
    setSendingMessage(false);

    // Reload messages
    if (selectedConversationId) {
      const msgResult = await api.getConversationMessages(
        selectedConversationId,
      );
      if (!msgResult.error && msgResult.data) {
        const sorted = [...msgResult.data.data].sort(
          (left, right) =>
            new Date(left.timestamp).getTime() -
            new Date(right.timestamp).getTime(),
        );
        setMessages(sorted);
      }
    }
  };

  const handleHumanIntervention = async (type: "intervene" | "release") => {
    if (type === "intervene") {
      await api.interveneLead(
        lead.id,
        "HUMAN_TAKEOVER",
        "Intervenção manual pelo dashboard",
      );
    } else {
      await api.releaseLeadFollowup(lead.id);
    }
    // Reload data
    window.location.reload();
  };

  const handleResetLead = async () => {
    const confirmed = window.confirm(
      `Resetar dados do lead ${lead.nome_completo || lead.telefone}?`,
    );
    if (!confirmed) return;

    await fetch(`/api/v1/leads/${lead.id}/reset`, { method: "POST" });
    window.location.reload();
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-[min(480px,100vw)] border-l border-dd-border bg-dd-primary shadow-2xl animate-slide-in-right">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-dd-border px-5 py-4">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-medium text-dd-on-primary">
            {lead.nome_completo || "Lead sem nome"}
          </h2>
          <p className="text-xs text-dd-on-muted">{lead.telefone}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Fechar painel"
          className="shrink-0 h-8 w-8 hover:bg-dd-surface-overlay hover:text-dd-on-surface focus-visible:ring-2 focus-visible:ring-dd-accent-green"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="h-[calc(100vh-73px)] overflow-y-auto">
        {loading ? (
          <div className="space-y-4 p-4">
            <div className="flex gap-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-24" />
            </div>
            <div className="border border-dd-border-subtle rounded-lg p-3 bg-dd-surface-raised space-y-2">
              <Skeleton className="h-4 w-24" />
              <div className="flex gap-1.5">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-8 w-16" />
            </div>
            <div className="border border-dd-border-subtle rounded-lg p-4 bg-dd-surface-raised space-y-3">
              <Skeleton className="h-3 w-20" />
              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="space-y-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            </div>
            <div className="border border-dd-border-subtle rounded-lg p-4 bg-dd-surface-raised space-y-3">
              <Skeleton className="h-3 w-20" />
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="m-4 rounded-lg border border-dd-accent-red/20 bg-dd-accent-red/5 p-3 text-sm text-dd-accent-red">
            {error}
          </div>
        ) : (
          <div className="space-y-4 p-4">
            {/* Status Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className={toneForStatus(lead.status)}>
                {lead.status}
              </Badge>
              <Badge
                variant="outline"
                className={toneForState(
                  humanIntervention?.conversation_state ||
                    lead.conversation_state,
                )}
              >
                {humanIntervention?.conversation_state ||
                  lead.conversation_state ||
                  "Sem estado"}
              </Badge>
              {lead.em_follow_up && (
                <Badge
                  variant="outline"
                  className="border-dd-accent-orange/20 bg-dd-accent-orange/10 text-dd-accent-orange"
                >
                  Follow-up ativo
                </Badge>
              )}
            </div>

            {/* Tags do Lead */}
            <div className="border border-dd-border-subtle rounded-lg p-3 bg-dd-surface-raised">
              <TagManager
                leadId={lead.id}
                leadTags={leadTags}
                onTagsUpdated={async () => {
                  const result = await api.getLeadTags(lead.id);
                  if (result.data) setLeadTags(result.data);
                }}
              />
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(lead)}
                aria-label="Editar lead"
                className="border-dd-border-subtle bg-dd-surface-overlay/30 hover:bg-dd-surface-overlay hover:text-dd-on-surface focus-visible:ring-2 focus-visible:ring-dd-accent-green"
              >
                <Edit className="mr-1.5 h-3.5 w-3.5" />
                Editar
              </Button>
              {lead.em_follow_up ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleHumanIntervention("release")}
                  aria-label="Liberar para bot"
                  className="border-dd-border-subtle bg-dd-surface-overlay/30 hover:bg-dd-surface-overlay hover:text-dd-on-surface focus-visible:ring-2 focus-visible:ring-dd-accent-green"
                >
                  <UserX className="mr-1.5 h-3.5 w-3.5" />
                  Liberar para Bot
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleHumanIntervention("intervene")}
                  aria-label="Intervir na conversa"
                  className="border-dd-border-subtle bg-dd-surface-overlay/30 hover:bg-dd-surface-overlay hover:text-dd-on-surface focus-visible:ring-2 focus-visible:ring-dd-accent-green"
                >
                  <UserCheck className="mr-1.5 h-3.5 w-3.5" />
                  Intervir
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={handleResetLead}
                aria-label="Resetar dados do lead"
                className="border-dd-border-subtle bg-dd-surface-overlay/30 hover:bg-dd-surface-overlay hover:text-dd-on-surface focus-visible:ring-2 focus-visible:ring-dd-accent-green"
              >
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                Resetar
              </Button>
            </div>

            {/* Cadastro */}
            <section className="rounded-lg border border-dd-border-subtle bg-dd-surface-raised p-4">
              <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-dd-on-muted">
                Cadastro
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <span className="text-dd-on-muted">Email:</span>{" "}
                  <span className="text-dd-on-primary">
                    {lead.email || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-dd-on-muted">Tipo:</span>{" "}
                  <span className="text-dd-on-primary">
                    {lead.tipo_interesse || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-dd-on-muted">Estado civil:</span>{" "}
                  <span className="text-dd-on-primary">
                    {lead.estado_civil || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-dd-on-muted">Aniversário:</span>{" "}
                  <span className="text-dd-on-primary">
                    {formatDate(lead.aniversario)}
                  </span>
                </div>
                <div>
                  <span className="text-dd-on-muted">Renda:</span>{" "}
                  <span className="text-dd-on-primary">
                    {lead.renda_comprovada
                      ? `R$ ${lead.renda_comprovada.toLocaleString("pt-BR")}`
                      : "-"}
                  </span>
                </div>
                <div>
                  <span className="text-dd-on-muted">Entrada:</span>{" "}
                  <span className="text-dd-on-primary">
                    {lead.tem_entrada
                      ? `R$ ${(lead.entrada || 0).toLocaleString("pt-BR")}`
                      : "-"}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-dd-on-muted">FGTS:</span>{" "}
                  <span className="text-dd-on-primary">
                    R${" "}
                    {(
                      (lead.fgts || 0) + (lead.fgts_conjuge || 0)
                    ).toLocaleString("pt-BR")}
                  </span>
                </div>
              </div>
            </section>

            {/* Origem */}
            <section className="rounded-lg border border-dd-border-subtle bg-dd-surface-raised p-4">
              <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-dd-on-muted">
                Origem
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <span className="text-dd-on-muted">Canal:</span>{" "}
                  <span className="text-dd-on-primary">
                    {lead.canal_origem || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-dd-on-muted">Sistema:</span>{" "}
                  <span className="text-dd-on-primary">
                    {lead.sistema_origem || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-dd-on-muted">Campanha:</span>{" "}
                  <span className="text-dd-on-primary">
                    {lead.campanha_origem || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-dd-on-muted">Tracked:</span>{" "}
                  <span className="text-dd-on-primary">
                    {lead.tracked_codigo_ref || "-"}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-dd-on-muted">Criado em:</span>{" "}
                  <span className="text-dd-on-primary">
                    {formatDateTime(lead.created_at)}
                  </span>
                </div>
              </div>
            </section>

            {/* Resumo de Qualificação */}
            {(lead.resumo_qualificacao ||
              operationalStatus?.qualification_summary) && (
              <section className="rounded-lg border border-dd-border-subtle bg-dd-surface-raised p-4">
                <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-dd-on-muted">
                  Qualificação
                </h3>
                <p className="text-sm text-dd-on-surface">
                  {lead.resumo_qualificacao ||
                    operationalStatus?.qualification_summary}
                </p>
              </section>
            )}

            {/* Conversas */}
            <section className="rounded-lg border border-dd-border-subtle bg-dd-surface-raised p-4">
              <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-dd-on-muted">
                Conversas ({conversations.length})
              </h3>
              <div className="space-y-2">
                {conversations.length === 0 ? (
                  <p className="text-sm text-dd-on-muted">Nenhuma conversa</p>
                ) : (
                  conversations.slice(0, 3).map((conversation) => (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => setSelectedConversationId(conversation.id)}
                      className={`w-full rounded-lg border p-2 text-left text-sm transition-colors ${
                        selectedConversationId === conversation.id
                          ? "border-dd-accent-green/40 bg-dd-accent-green/10"
                          : "border-dd-border-subtle hover:border-dd-border"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-dd-on-primary">
                          {conversation.status}
                        </span>
                        <span className="text-xs text-dd-on-muted">
                          {conversation.message_count} msgs
                        </span>
                      </div>
                      <div className="text-xs text-dd-on-muted/70">
                        {formatDateTime(conversation.started_at)}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </section>

            {/* Mensagens */}
            {selectedConversation && (
              <section className="rounded-lg border border-dd-border-subtle bg-dd-surface-raised p-4">
                <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-dd-on-muted">
                  Mensagens
                </h3>

                {messagesLoading ? (
                  <div className="max-h-64 space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`rounded-lg border p-2 ${
                          i % 2 === 0
                            ? "border-dd-border bg-dd-surface-overlay/30"
                            : "border-dd-border-subtle"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <Skeleton className="h-3 w-12" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                        <Skeleton className="mt-1 h-4 w-full" />
                        <Skeleton className="mt-1 h-4 w-3/4" />
                      </div>
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-4 text-center text-sm text-dd-on-muted">
                    Sem mensagens
                  </div>
                ) : (
                  <div className="max-h-64 space-y-2 overflow-y-auto">
                    {messages.slice(-10).map((message) => (
                      <div
                        key={message.id}
                        className={`rounded-lg border p-2 ${
                          message.direcao === "SAIDA"
                            ? "border-dd-border bg-dd-surface-overlay/30"
                            : "border-dd-border-subtle"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs text-dd-on-muted/70">
                          <span>{message.direcao}</span>
                          <span>{formatDateTime(message.timestamp)}</span>
                        </div>
                        <p className="mt-1 text-sm text-dd-on-surface line-clamp-3">
                          {message.conteudo}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Enviar mensagem */}
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Digite uma mensagem..."
                    className="flex-1 rounded-lg border border-dd-border-subtle bg-dd-surface-overlay/30 px-3 py-2 text-sm text-dd-on-primary placeholder:text-dd-on-muted/50 focus:border-dd-accent-green focus:outline-none"
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <Button
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={sendingMessage || !newMessage.trim()}
                    aria-label="Enviar mensagem"
                    className="shrink-0 bg-dd-on-primary text-dd-primary hover:bg-dd-on-primary/90 focus-visible:ring-2 focus-visible:ring-dd-accent-green"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </section>
            )}

            {/* Auditoria */}
            {actions.length > 0 && (
              <section className="rounded-lg border border-dd-border-subtle bg-dd-surface-raised p-4">
                <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-dd-on-muted">
                  Auditoria
                </h3>
                <div className="space-y-2">
                  {actions.slice(0, 5).map((action) => (
                    <div
                      key={action.id}
                      className="rounded-lg border border-dd-border-subtle p-2"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-dd-on-primary">
                          {action.action}
                        </span>
                        <span className="text-xs text-dd-on-muted/70">
                          {formatDateTime(action.created_at)}
                        </span>
                      </div>
                      <div className="text-xs text-dd-on-muted">
                        {action.actor || "-"}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
