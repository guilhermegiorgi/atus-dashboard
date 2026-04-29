"use client";

import { cn } from "@/lib/utils";
import type { InboxConversationDetail } from "@/types/dashboard";

interface ChatHeaderProps {
  conversation: InboxConversationDetail | null;
  isLoading?: boolean;
}

function getStatusColor(state?: string) {
  switch (state) {
    case "TRIAGE_HUMAN":
      return "bg-dd-accent-orange-muted text-dd-accent-orange";
    case "ASSIGNED_TO_BROKER":
      return "bg-dd-accent-blue-muted text-dd-accent-blue";
    case "HUMAN_ACTIVE":
      return "bg-dd-accent-green-muted text-dd-accent-green";
    case "HUMAN_STANDBY":
      return "bg-dd-surface-overlay text-dd-on-muted";
    case "RETURNED_TO_BOT":
      return "bg-dd-surface-overlay text-dd-on-muted";
    case "CLOSED":
      return "bg-red-900/30 text-red-400";
    default:
      return "bg-dd-surface-overlay text-dd-on-muted";
  }
}

function getStatusLabel(state?: string) {
  switch (state) {
    case "TRIAGE_HUMAN":
      return "Triagem humana";
    case "ASSIGNED_TO_BROKER":
      return "Atribuído";
    case "HUMAN_ACTIVE":
      return "Humano ativo";
    case "HUMAN_STANDBY":
      return "Em espera";
    case "RETURNED_TO_BOT":
      return "Devolvido ao bot";
    case "CLOSED":
      return "Encerrado";
    default:
      return state || "-";
  }
}

export function ChatHeader({ conversation, isLoading }: ChatHeaderProps) {
  if (isLoading) {
    return (
      <div className="flex h-16 items-center justify-between border-b border-dd-border-subtle bg-dd-surface px-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-dd-full bg-dd-surface-raised" />
          <div className="space-y-2">
            <div className="h-4 w-32 animate-pulse rounded bg-dd-surface-raised" />
            <div className="h-3 w-20 animate-pulse rounded bg-dd-surface-raised" />
          </div>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex h-16 items-center justify-between border-b border-dd-border-subtle bg-dd-surface px-4">
        <span className="text-sm text-dd-on-muted">Selecione uma conversa</span>
      </div>
    );
  }

  return (
    <div className="flex h-16 items-center justify-between border-b border-dd-border-subtle bg-dd-surface px-4">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="flex h-10 w-10 items-center justify-center rounded-dd-full bg-dd-surface-overlay text-sm font-medium text-dd-on-muted">
          {conversation.nome_completo
            ? conversation.nome_completo
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)
            : conversation.telefone?.slice(-2) || "?"}
        </div>

        {/* Info */}
        <div>
          <h3 className="text-sm font-medium text-dd-on-primary">
            {conversation.nome_completo || conversation.telefone || "Sem nome"}
          </h3>
          <p className="text-timestamp text-dd-on-muted">
            {conversation.telefone || "-"} • {conversation.canal_origem || "-"}
          </p>
        </div>
      </div>

      {/* Status badges */}
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center rounded-xs px-2 py-1 text-[10px] font-medium uppercase tracking-wide",
            getStatusColor(conversation.conversation_state),
          )}
        >
          {getStatusLabel(conversation.conversation_state)}
        </span>
        {conversation.status && (
          <span className="inline-flex items-center rounded-xs bg-dd-surface-overlay px-2 py-1 text-[10px] font-medium text-dd-on-muted">
            {conversation.status}
          </span>
        )}
        {conversation.fase && (
          <span className="inline-flex items-center rounded-xs bg-dd-surface-overlay px-2 py-1 text-[10px] font-medium text-dd-on-muted">
            {conversation.fase}
          </span>
        )}
      </div>
    </div>
  );
}
