"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
      return "border-amber-500/20 bg-amber-500/10 text-amber-300";
    case "ASSIGNED_TO_BROKER":
      return "border-blue-500/20 bg-blue-500/10 text-blue-300";
    case "RETURNED_TO_BOT":
      return "border-green-500/20 bg-green-500/10 text-green-400";
    case "CLOSED":
      return "border-zinc-500/20 bg-zinc-500/10 text-zinc-300";
    default:
      return "border-white/[0.12] bg-white/[0.04] text-white/60";
  }
}

function toneForStatus(value?: string) {
  switch (value) {
    case "NOVO":
      return "border-yellow-500/20 bg-yellow-500/10 text-yellow-300";
    case "EM_ATENDIMENTO":
      return "border-blue-500/20 bg-blue-500/10 text-blue-300";
    case "CONVERTIDO":
      return "border-green-500/20 bg-green-500/10 text-green-400";
    case "PERDIDO":
      return "border-red-500/20 bg-red-500/10 text-red-300";
    default:
      return "border-white/[0.12] bg-white/[0.04] text-white/60";
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
    const result = await api.sendWhatsAppMessage(lead.id, newMessage);

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
    <div className="fixed inset-y-0 right-0 z-50 w-[min(480px,100vw)] border-l border-white/[0.12] bg-[#000000] shadow-2xl animate-slide-in-right">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.12] px-5 py-4">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-medium text-white">
            {lead.nome_completo || "Lead sem nome"}
          </h2>
          <p className="text-xs text-white/40">{lead.telefone}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="shrink-0 h-8 w-8 hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="h-[calc(100vh-73px)] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 rounded-full border-2 border-white/10 border-t-white/30 animate-spin" />
          </div>
        ) : error ? (
          <div className="m-4 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-400">
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
                  className="border-amber-500/20 bg-amber-500/10 text-amber-300"
                >
                  Follow-up ativo
                </Badge>
              )}
            </div>

            {/* Tags do Lead */}
            <div className="border border-white/[0.12] rounded-lg p-3 bg-white/[0.02]">
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
                className="border-white/[0.12] bg-white/[0.04] hover:bg-white/10 hover:text-white"
              >
                <Edit className="mr-1.5 h-3.5 w-3.5" />
                Editar
              </Button>
              {lead.em_follow_up ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleHumanIntervention("release")}
                  className="border-white/[0.12] bg-white/[0.04] hover:bg-white/10 hover:text-white"
                >
                  <UserX className="mr-1.5 h-3.5 w-3.5" />
                  Liberar para Bot
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleHumanIntervention("intervene")}
                  className="border-white/[0.12] bg-white/[0.04] hover:bg-white/10 hover:text-white"
                >
                  <UserCheck className="mr-1.5 h-3.5 w-3.5" />
                  Intervir
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={handleResetLead}
                className="border-white/[0.12] bg-white/[0.04] hover:bg-white/10 hover:text-white"
              >
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                Resetar
              </Button>
            </div>

            {/* Cadastro */}
            <section className="rounded-lg border border-white/[0.12] bg-white/[0.02] p-4">
              <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-white/40">
                Cadastro
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <span className="text-white/40">Email:</span>{" "}
                  <span className="text-white">{lead.email || "-"}</span>
                </div>
                <div>
                  <span className="text-white/40">Tipo:</span>{" "}
                  <span className="text-white">
                    {lead.tipo_interesse || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-white/40">Estado civil:</span>{" "}
                  <span className="text-white">{lead.estado_civil || "-"}</span>
                </div>
                <div>
                  <span className="text-white/40">Aniversário:</span>{" "}
                  <span className="text-white">
                    {formatDate(lead.aniversario)}
                  </span>
                </div>
                <div>
                  <span className="text-white/40">Renda:</span>{" "}
                  <span className="text-white">
                    {lead.renda_comprovada
                      ? `R$ ${lead.renda_comprovada.toLocaleString("pt-BR")}`
                      : "-"}
                  </span>
                </div>
                <div>
                  <span className="text-white/40">Entrada:</span>{" "}
                  <span className="text-white">
                    {lead.tem_entrada
                      ? `R$ ${(lead.entrada || 0).toLocaleString("pt-BR")}`
                      : "-"}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-white/40">FGTS:</span>{" "}
                  <span className="text-white">
                    R${" "}
                    {(
                      (lead.fgts || 0) + (lead.fgts_conjuge || 0)
                    ).toLocaleString("pt-BR")}
                  </span>
                </div>
              </div>
            </section>

            {/* Origem */}
            <section className="rounded-lg border border-white/[0.12] bg-white/[0.02] p-4">
              <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-white/40">
                Origem
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <span className="text-white/40">Canal:</span>{" "}
                  <span className="text-white">{lead.canal_origem || "-"}</span>
                </div>
                <div>
                  <span className="text-white/40">Sistema:</span>{" "}
                  <span className="text-white">
                    {lead.sistema_origem || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-white/40">Campanha:</span>{" "}
                  <span className="text-white">
                    {lead.campanha_origem || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-white/40">Tracked:</span>{" "}
                  <span className="text-white">
                    {lead.tracked_codigo_ref || "-"}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-white/40">Criado em:</span>{" "}
                  <span className="text-white">
                    {formatDateTime(lead.created_at)}
                  </span>
                </div>
              </div>
            </section>

            {/* Resumo de Qualificação */}
            {(lead.resumo_qualificacao ||
              operationalStatus?.qualification_summary) && (
              <section className="rounded-lg border border-white/[0.12] bg-white/[0.02] p-4">
                <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-white/40">
                  Qualificação
                </h3>
                <p className="text-sm text-white/80">
                  {lead.resumo_qualificacao ||
                    operationalStatus?.qualification_summary}
                </p>
              </section>
            )}

            {/* Conversas */}
            <section className="rounded-lg border border-white/[0.12] bg-white/[0.02] p-4">
              <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-white/40">
                Conversas ({conversations.length})
              </h3>
              <div className="space-y-2">
                {conversations.length === 0 ? (
                  <p className="text-sm text-white/30">Nenhuma conversa</p>
                ) : (
                  conversations.slice(0, 3).map((conversation) => (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => setSelectedConversationId(conversation.id)}
                      className={`w-full rounded-lg border p-2 text-left text-sm transition-colors ${
                        selectedConversationId === conversation.id
                          ? "border-white/[0.25] bg-white/[0.06]"
                          : "border-white/[0.08] hover:border-white/[0.16]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white">
                          {conversation.status}
                        </span>
                        <span className="text-xs text-white/40">
                          {conversation.message_count} msgs
                        </span>
                      </div>
                      <div className="text-xs text-white/30">
                        {formatDateTime(conversation.started_at)}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </section>

            {/* Mensagens */}
            {selectedConversation && (
              <section className="rounded-lg border border-white/[0.12] bg-white/[0.02] p-4">
                <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-white/40">
                  Mensagens
                </h3>

                {messagesLoading ? (
                  <div className="py-4 text-center text-sm text-white/30">
                    Carregando...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-4 text-center text-sm text-white/30">
                    Sem mensagens
                  </div>
                ) : (
                  <div className="max-h-64 space-y-2 overflow-y-auto">
                    {messages.slice(-10).map((message) => (
                      <div
                        key={message.id}
                        className={`rounded-lg border p-2 ${
                          message.direcao === "SAIDA"
                            ? "border-white/[0.12] bg-white/[0.04]"
                            : "border-white/[0.08]"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs text-white/30">
                          <span>{message.direcao}</span>
                          <span>{formatDateTime(message.timestamp)}</span>
                        </div>
                        <p className="mt-1 text-sm text-white/80 line-clamp-3">
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
                    className="flex-1 rounded-lg border border-white/[0.12] bg-white/[0.04] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/25 focus:outline-none"
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <Button
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={sendingMessage || !newMessage.trim()}
                    className="shrink-0 bg-white text-black hover:bg-white/90"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </section>
            )}

            {/* Auditoria */}
            {actions.length > 0 && (
              <section className="rounded-lg border border-white/[0.12] bg-white/[0.02] p-4">
                <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-white/40">
                  Auditoria
                </h3>
                <div className="space-y-2">
                  {actions.slice(0, 5).map((action) => (
                    <div
                      key={action.id}
                      className="rounded-lg border border-white/[0.08] p-2"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white">{action.action}</span>
                        <span className="text-xs text-white/30">
                          {formatDateTime(action.created_at)}
                        </span>
                      </div>
                      <div className="text-xs text-white/40">
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
