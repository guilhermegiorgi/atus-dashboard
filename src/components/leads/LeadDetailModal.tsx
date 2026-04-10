"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api/client";
import { Conversa, Lead, Mensagem } from "@/types/leads";
import {
  LeadAction,
  LeadHumanIntervention,
  OperationalStatus,
} from "@/types/dashboard";

interface LeadDetailModalProps {
  lead: Lead;
  open: boolean;
  onClose: () => void;
  onEdit: (lead: Lead) => void;
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function truthyLabel(value?: string | null) {
  return value && value.trim().length > 0 ? value : "-";
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
      return "border-border/50 bg-secondary/30 text-foreground";
  }
}

export function LeadDetailModal({
  lead,
  open,
  onClose,
  onEdit,
}: LeadDetailModalProps) {
  const [operationalStatus, setOperationalStatus] = useState<OperationalStatus | null>(
    null
  );
  const [humanIntervention, setHumanIntervention] =
    useState<LeadHumanIntervention | null>(null);
  const [actions, setActions] = useState<LeadAction[]>([]);
  const [conversations, setConversations] = useState<Conversa[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
    null
  );
  const [messages, setMessages] = useState<Mensagem[]>([]);
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setOperationalStatus(null);
      setHumanIntervention(null);
      setActions([]);
      setConversations([]);
      setSelectedConversationId(null);
      setMessages([]);
      setError(null);
      return;
    }

    let cancelled = false;

    async function loadDetail() {
      setLoading(true);
      setError(null);

      const [operationalResult, humanResult, actionsResult, conversationsResult] =
        await Promise.all([
          api.getLeadOperationalStatus(lead.id),
          api.getLeadHumanIntervention(lead.id),
          api.getLeadActions(lead.id, 20, 0),
          api.getLeadConversations(lead.id),
        ]);

      if (cancelled) {
        return;
      }

      const firstError =
        operationalResult.error ??
        humanResult.error ??
        actionsResult.error ??
        conversationsResult.error ??
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
      setSelectedConversationId((current) => current ?? nextConversations[0]?.id ?? null);
      setLoading(false);
    }

    void loadDetail();

    return () => {
      cancelled = true;
    };
  }, [lead.id, open]);

  useEffect(() => {
    if (!open || !selectedConversationId) {
      setMessages([]);
      return;
    }

    const currentConversationId = selectedConversationId;
    let cancelled = false;

    async function loadMessages() {
      setMessagesLoading(true);
      const result = await api.getConversationMessages(currentConversationId);

      if (cancelled) {
        return;
      }

      if (result.error || !result.data) {
        setError(result.error ?? "Erro ao carregar mensagens");
        setMessagesLoading(false);
        return;
      }

      const sorted = [...result.data.data].sort(
        (left, right) =>
          new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime()
      );

      setMessages(sorted);
      setMessagesLoading(false);
    }

    void loadMessages();

    return () => {
      cancelled = true;
    };
  }, [open, selectedConversationId]);

  const selectedConversation = useMemo(
    () => conversations.find((item) => item.id === selectedConversationId) ?? null,
    [conversations, selectedConversationId]
  );

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-6xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{lead.nome_completo || "Lead sem nome"}</DialogTitle>
          <DialogDescription>
            Detalhe canônico do lead com estado operacional, humano, auditoria e conversa
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="h-10 w-10 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Carregando detalhe do lead...</p>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-2">
            <section className="space-y-4 rounded-xl border border-border/50 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Cadastro
              </h3>
              <div><strong>Telefone:</strong> {lead.telefone || "-"}</div>
              <div><strong>Email:</strong> {lead.email || "-"}</div>
              <div><strong>Status:</strong> {lead.status || "-"}</div>
              <div><strong>Fase:</strong> {lead.fase || operationalStatus?.fase || "-"}</div>
              <div><strong>Tipo de interesse:</strong> {lead.tipo_interesse || "-"}</div>
              <div><strong>Estado civil:</strong> {lead.estado_civil || "-"}</div>
              <div><strong>Renda comprovada:</strong> {lead.renda_comprovada ?? 0}</div>
              <div><strong>Entrada:</strong> {lead.entrada ?? 0}</div>
              <div><strong>Observações:</strong> {lead.observacoes || "-"}</div>
            </section>

            <section className="space-y-4 rounded-xl border border-border/50 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Origem e Tracking
              </h3>
              <div><strong>Canal:</strong> {lead.canal_origem || operationalStatus?.canal_origem || "-"}</div>
              <div><strong>Sistema:</strong> {lead.sistema_origem || operationalStatus?.sistema_origem || "-"}</div>
              <div><strong>Campanha:</strong> {lead.campanha_origem || operationalStatus?.campanha_origem || "-"}</div>
              <div><strong>Tracked ref:</strong> {lead.tracked_codigo_ref || operationalStatus?.tracked_codigo_ref || "-"}</div>
              <div><strong>Link click ID:</strong> {lead.link_click_id || "-"}</div>
              <div><strong>External lead ID:</strong> {lead.external_lead_id || "-"}</div>
              <div><strong>Resumo de qualificação:</strong> {lead.resumo_qualificacao || operationalStatus?.qualification_summary || "-"}</div>
            </section>

            <section className="space-y-4 rounded-xl border border-border/50 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Estado operacional
              </h3>
              {operationalStatus ? (
                <>
                  <div><strong>Next field:</strong> {truthyLabel(operationalStatus.next_field)}</div>
                  <div><strong>Recommended action:</strong> {truthyLabel(operationalStatus.recommended_action)}</div>
                  <div><strong>Qualification summary:</strong> {truthyLabel(operationalStatus.qualification_summary)}</div>
                  <div><strong>Last bot message:</strong> {truthyLabel(operationalStatus.last_bot_message)}</div>
                  <div><strong>Last lead message:</strong> {truthyLabel(operationalStatus.last_lead_message)}</div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">
                      {operationalStatus.confirmation_pending ? "Confirmação pendente" : "Sem confirmação pendente"}
                    </Badge>
                    <Badge variant="outline">
                      {operationalStatus.is_contaminated ? "Contaminado" : "Não contaminado"}
                    </Badge>
                    {operationalStatus.missing_fields.map((field) => (
                      <Badge key={field} variant="outline" className="border-amber-500/20 bg-amber-500/10 text-amber-300">
                        {field}
                      </Badge>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Sem status operacional disponível.</p>
              )}
            </section>

            <section className="space-y-4 rounded-xl border border-border/50 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Atendimento humano
              </h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className={toneForState(humanIntervention?.conversation_state || lead.conversation_state)}>
                  {humanIntervention?.conversation_state || lead.conversation_state || "Sem conversation_state"}
                </Badge>
                <Badge variant="outline">
                  {humanIntervention?.intervention_type || lead.intervention_type || "Sem intervention_type"}
                </Badge>
                <Badge variant="outline">
                  {humanIntervention?.em_follow_up ?? lead.em_follow_up ? "Follow-up ativo" : "Sem follow-up ativo"}
                </Badge>
              </div>
              <div><strong>Intervention at:</strong> {formatDateTime(humanIntervention?.intervention_at || lead.intervention_at)}</div>
              <div><strong>Intervention by:</strong> {truthyLabel(humanIntervention?.intervention_by)}</div>
              <div><strong>Atualizado em:</strong> {formatDateTime(lead.updated_at)}</div>
            </section>

            <section className="space-y-4 rounded-xl border border-border/50 p-4 xl:col-span-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Auditoria
              </h3>
              {actions.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma ação registrada.</p>
              ) : (
                <div className="space-y-3">
                  {actions.map((action) => (
                    <div
                      key={action.id}
                      className="rounded-xl border border-border/50 bg-secondary/20 p-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="font-medium">{action.action}</div>
                        <Badge variant="outline">{action.status}</Badge>
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        Ator: {action.actor || "-"} | {formatDateTime(action.created_at)}
                      </div>
                      <div className="mt-2 text-sm break-all">{action.details || "-"}</div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-4 rounded-xl border border-border/50 p-4 xl:col-span-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Conversa
              </h3>
              <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
                <div className="space-y-2">
                  {conversations.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhuma conversa disponível.</p>
                  ) : (
                    conversations.map((conversation) => (
                      <button
                        key={conversation.id}
                        type="button"
                        onClick={() => setSelectedConversationId(conversation.id)}
                        className={`w-full rounded-xl border p-3 text-left transition-colors ${
                          selectedConversationId === conversation.id
                            ? "border-primary/30 bg-primary/10"
                            : "border-border/50 bg-secondary/20"
                        }`}
                      >
                        <div className="font-medium">{conversation.status || "Sem status"}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDateTime(conversation.started_at)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {conversation.message_count} mensagem(ns)
                        </div>
                      </button>
                    ))
                  )}
                </div>

                <div className="space-y-3 rounded-xl border border-border/50 bg-secondary/20 p-4">
                  {selectedConversation ? (
                    <div className="text-sm text-muted-foreground">
                      Conversa iniciada em {formatDateTime(selectedConversation.started_at)}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">Selecione uma conversa.</div>
                  )}

                  {messagesLoading ? (
                    <div className="text-sm text-muted-foreground">Carregando mensagens...</div>
                  ) : messages.length === 0 ? (
                    <div className="text-sm text-muted-foreground">Sem mensagens nesta conversa.</div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`rounded-xl border p-3 ${
                            message.direcao === "SAIDA"
                              ? "border-primary/20 bg-primary/10"
                              : "border-border/50 bg-background"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
                            <span>{message.direcao}</span>
                            <span>{formatDateTime(message.timestamp)}</span>
                          </div>
                          <div className="mt-2 text-sm whitespace-pre-wrap">
                            {message.conteudo || "-"}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Fechar</Button>
          <Button onClick={() => onEdit(lead)}>Editar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
