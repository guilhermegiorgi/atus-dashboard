"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Search, ArrowDownUp } from "lucide-react";
import type { InboxConversationSummary } from "@/types/dashboard";

interface ConversationListProps {
  conversations: InboxConversationSummary[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
  isLoading?: boolean;
}

function formatTimeAgo(dateString?: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "agora";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function getInitials(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getStatusBadge(status?: string | null) {
  switch (status) {
    case "NOVA":
      return { label: "Nova", class: "badge-new" };
    case "AGUARDANDO":
      return { label: "Aguardando", class: "badge-waiting" };
    case "URGENTE":
      return { label: "Urgente", class: "badge-urgent" };
    case "INDICADO":
      return { label: "Indicado", class: "badge-indicated" };
    default:
      return null;
  }
}

function getChannelBadge(canal?: string | null) {
  if (!canal) return null;
  return { label: canal, class: "badge-channel" };
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  isLoading,
}: ConversationListProps) {
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"recent" | "oldest">("recent");

  const filteredConversations = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    let filtered = conversations;

    if (normalized) {
      filtered = conversations.filter(
        (c) =>
          c.nome_completo?.toLowerCase().includes(normalized) ||
          c.telefone?.includes(normalized) ||
          c.last_message_preview?.toLowerCase().includes(normalized) ||
          c.owner_user_name?.toLowerCase().includes(normalized),
      );
    }

    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.updated_at || 0).getTime();
      const dateB = new Date(b.updated_at || 0).getTime();
      return sortOrder === "recent" ? dateB - dateA : dateA - dateB;
    });
  }, [conversations, search, sortOrder]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-dd-border border-t-dd-accent-green" />
          <p className="text-xs text-dd-on-muted">Carregando conversas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-dd-surface">
      {/* Header */}
      <div className="border-b border-dd-border-subtle p-3">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-h3 text-dd-on-primary">Conversas</h2>
          <span className="text-timestamp text-dd-on-muted">
            {filteredConversations.length}
          </span>
        </div>

        {/* Search */}
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dd-muted" />
          <Input
            type="text"
            placeholder="Buscar conversas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 bg-dd-surface-raised pl-9 text-sm text-dd-on-surface placeholder:text-dd-muted border-dd-border-subtle focus:border-dd-accent-green"
          />
        </div>

        {/* Sort toggle */}
        <button
          onClick={() =>
            setSortOrder(sortOrder === "recent" ? "oldest" : "recent")
          }
          className="flex items-center gap-1.5 text-xs text-dd-muted hover:text-dd-on-surface transition-colors"
        >
          <ArrowDownUp className="h-3 w-3" />
          <span>
            {sortOrder === "recent" ? "Mais recentes" : "Mais antigas"}
          </span>
        </button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredConversations.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-center">
            <p className="text-sm text-dd-on-muted">
              {search ? "Nenhuma conversa encontrada" : "Nenhuma conversa"}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredConversations.map((conversation) => {
              const isSelected = conversation.lead_id === selectedId;
              const statusBadge = getStatusBadge(conversation.status);
              const channelBadge = getChannelBadge(conversation.canal_origem);

              return (
                <button
                  key={conversation.lead_id}
                  onClick={() => onSelect(conversation.lead_id)}
                  className={cn(
                    "group w-full rounded-dd-lg p-3 text-left transition-all duration-150",
                    isSelected
                      ? "bg-dd-conversation-active"
                      : "hover:bg-dd-conversation-hover",
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-dd-full bg-dd-surface-overlay text-sm font-medium text-dd-on-muted">
                        {getInitials(
                          conversation.nome_completo ||
                            conversation.telefone ||
                            "?",
                        )}
                      </div>
                      {/* Unread indicator */}
                      {conversation.status === "NOVA" && (
                        <div className="absolute -right-0.5 -top-0.5 flex h-3 w-3 items-center justify-center">
                          <span className="flex h-2 w-2 rounded-full bg-dd-accent-green" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate font-medium text-dd-on-surface">
                          {conversation.nome_completo ||
                            conversation.telefone ||
                            "Sem nome"}
                        </span>
                        <span className="flex-shrink-0 text-timestamp text-dd-on-muted">
                          {formatTimeAgo(conversation.updated_at)}
                        </span>
                      </div>

                      {/* Preview */}
                      <p className="mt-0.5 truncate text-body-sm text-dd-on-muted">
                        {conversation.last_message_preview || "Sem mensagens"}
                      </p>

                      {/* Badges */}
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {statusBadge && (
                          <span
                            className={cn(
                              "inline-flex items-center rounded-xs px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                              statusBadge.class,
                            )}
                          >
                            {statusBadge.label}
                          </span>
                        )}
                        {channelBadge && (
                          <span
                            className={cn(
                              "inline-flex items-center rounded-xs px-1.5 py-0.5 text-[10px] font-medium",
                              channelBadge.class,
                            )}
                          >
                            {channelBadge.label}
                          </span>
                        )}
                        {conversation.owner_user_name && (
                          <span className="inline-flex items-center rounded-xs bg-dd-surface-overlay px-1.5 py-0.5 text-[10px] text-dd-on-muted">
                            {conversation.owner_user_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
