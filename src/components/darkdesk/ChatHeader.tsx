"use client";

import { cn } from "@/lib/utils";
import type { InboxConversationDetail } from "@/types/dashboard";
import {
  MoreVertical,
  Eye,
  UserPlus,
  Tag,
  Hand,
  RotateCcw,
  Archive,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatHeaderProps {
  conversation: InboxConversationDetail | null;
  isLoading?: boolean;
  onAction?: (action: string, leadId: string) => void;
}

function getStatusColor(state?: string) {
  switch (state) {
    case "TRIAGE_HUMAN":
      return "bg-orange-900/30 text-orange-400";
    case "ASSIGNED_TO_BROKER":
      return "bg-dd-accent-blue/30 text-dd-accent-blue";
    case "HUMAN_ACTIVE":
      return "bg-dd-accent-green/30 text-dd-accent-green";
    case "HUMAN_STANDBY":
      return "bg-dd-surface-overlay text-dd-on-muted";
    case "RETURNED_TO_BOT":
      return "bg-dd-surface-overlay text-dd-on-muted";
    case "CLOSED":
      return "bg-dd-accent-red/30 text-dd-accent-red";
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

export function ChatHeader({
  conversation,
  isLoading,
  onAction,
}: ChatHeaderProps) {
  if (isLoading) {
    return (
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-dd-border bg-dd-surface px-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-full bg-dd-surface-raised" />
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
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-dd-border bg-dd-surface px-4">
        <span className="text-sm text-dd-on-muted">Selecione uma conversa</span>
      </div>
    );
  }

  return (
    <div className="flex h-16 shrink-0 items-center justify-between border-b border-dd-border bg-dd-surface px-4">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-dd-surface-raised text-sm font-medium text-dd-on-muted">
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
          <p className="text-xs text-dd-muted">
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
          <span className="inline-flex items-center rounded bg-dd-surface-raised px-2 py-1 text-[10px] font-medium text-dd-muted">
            {conversation.status}
          </span>
        )}
        {conversation.fase && (
          <span className="inline-flex items-center rounded bg-dd-surface-raised px-2 py-1 text-[10px] font-medium text-dd-muted">
            {conversation.fase}
          </span>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <button className="p-1.5 rounded hover:bg-dd-surface-raised transition-colors">
              <MoreVertical className="h-4 w-4 text-dd-muted" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => onAction?.("view", conversation.lead_id)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver detalhes
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onAction?.("assign", conversation.lead_id)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Atribuir corretor
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onAction?.("tags", conversation.lead_id)}
            >
              <Tag className="h-4 w-4 mr-2" />
              Editar tags
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onAction?.("intervene", conversation.lead_id)}
            >
              <Hand className="h-4 w-4 mr-2" />
              Intervenção humana
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onAction?.("release", conversation.lead_id)}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Liberar follow-up
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onAction?.("archive", conversation.lead_id)}
            >
              <Archive className="h-4 w-4 mr-2" />
              Arquivar conversa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
