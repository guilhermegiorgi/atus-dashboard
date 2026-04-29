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
      return "bg-orange-900/30 text-orange-400";
    case "ASSIGNED_TO_BROKER":
      return "bg-blue-900/30 text-blue-400";
    case "HUMAN_ACTIVE":
      return "bg-green-900/30 text-green-400";
    case "HUMAN_STANDBY":
      return "bg-gray-700 text-gray-400";
    case "RETURNED_TO_BOT":
      return "bg-gray-700 text-gray-400";
    case "CLOSED":
      return "bg-red-900/30 text-red-400";
    default:
      return "bg-gray-700 text-gray-400";
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
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-700 bg-gray-900 px-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-full bg-gray-800" />
          <div className="space-y-2">
            <div className="h-4 w-32 animate-pulse rounded bg-gray-800" />
            <div className="h-3 w-20 animate-pulse rounded bg-gray-800" />
          </div>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-700 bg-gray-900 px-4">
        <span className="text-sm text-gray-400">Selecione uma conversa</span>
      </div>
    );
  }

  return (
    <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-700 bg-gray-900 px-4">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-sm font-medium text-gray-400">
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
          <h3 className="text-sm font-medium text-white">
            {conversation.nome_completo || conversation.telefone || "Sem nome"}
          </h3>
          <p className="text-xs text-gray-500">
            {conversation.telefone || "-"} • {conversation.canal_origem || "-"}
          </p>
        </div>
      </div>

      {/* Status badges */}
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center rounded px-2 py-1 text-[10px] font-medium uppercase tracking-wide",
            getStatusColor(conversation.conversation_state),
          )}
        >
          {getStatusLabel(conversation.conversation_state)}
        </span>
        {conversation.status && (
          <span className="inline-flex items-center rounded bg-gray-800 px-2 py-1 text-[10px] font-medium text-gray-500">
            {conversation.status}
          </span>
        )}
        {conversation.fase && (
          <span className="inline-flex items-center rounded bg-gray-800 px-2 py-1 text-[10px] font-medium text-gray-500">
            {conversation.fase}
          </span>
        )}
      </div>
    </div>
  );
}
