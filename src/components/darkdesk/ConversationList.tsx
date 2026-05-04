"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Search,
  ArrowDownUp,
  MoreVertical,
  UserPlus,
  Eye,
  RotateCcw,
  Hand,
  Archive,
  Tag,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  InboxConversationFilters,
  InboxConversationSummary,
} from "@/types/dashboard";

const INBOX_FILTER_STATES = [
  "TRIAGE_HUMAN",
  "ASSIGNED_TO_BROKER",
  "HUMAN_ACTIVE",
  "HUMAN_STANDBY",
  "RETURNED_TO_BOT",
  "CLOSED",
] as const;

function stateLabel(state: string) {
  switch (state) {
    case "TRIAGE_HUMAN":
      return "Triagem humana";
    case "ASSIGNED_TO_BROKER":
      return "Atribuída";
    case "HUMAN_ACTIVE":
      return "Humano ativo";
    case "HUMAN_STANDBY":
      return "Em espera";
    case "RETURNED_TO_BOT":
      return "Devolvida ao bot";
    case "CLOSED":
      return "Fechada";
    default:
      return state || "-";
  }
}

interface ConversationListMeta {
  total: number;
  limit: number;
  offset: number;
}

interface ConversationListProps {
  conversations: InboxConversationSummary[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
  isLoading?: boolean;
  onAction?: (action: string, leadId: string) => void;
  filters?: InboxConversationFilters;
  onFiltersChange?: (filters: InboxConversationFilters) => void;
  meta?: ConversationListMeta;
  onPageChange?: (offset: number) => void;
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
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
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
  onAction,
  filters,
  onFiltersChange,
  meta,
  onPageChange,
}: ConversationListProps) {
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"recent" | "oldest">("recent");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const handleListKeyDown = (e: React.KeyboardEvent) => {
    const items = Array.from(
      e.currentTarget.querySelectorAll<HTMLElement>('[role="option"]'),
    );
    const currentIndex = items.indexOf(document.activeElement as HTMLElement);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
      items[next]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
      items[prev]?.focus();
    }
  };

  const updateFilter = (
    key: keyof InboxConversationFilters,
    value: unknown,
  ) => {
    if (!filters || !onFiltersChange) return;
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
      offset: 0,
    });
  };

  const clearFilters = () => {
    if (!onFiltersChange) return;
    onFiltersChange({ limit: filters?.limit ?? 20, offset: 0 });
  };

  const hasActiveFilters = filters
    ? Boolean(
        filters.state ||
        filters.owner_user_name ||
        filters.assigned_corretor_id ||
        filters.canal_origem ||
        filters.sistema_origem ||
        filters.status ||
        filters.fase,
      )
    : false;

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

  const totalPages = meta
    ? Math.max(1, Math.ceil(meta.total / Math.max(meta.limit, 1)))
    : 1;
  const currentPage = meta
    ? Math.floor(meta.offset / Math.max(meta.limit, 1)) + 1
    : 1;

  if (isLoading) {
    return (
      <div className="flex h-full flex-col bg-dd-surface">
        <div className="border-b border-dd-border-subtle p-3">
          <div className="mb-3 flex items-center justify-between">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-3 w-6" />
          </div>
          <Skeleton className="h-9 w-full" />
        </div>
        <div className="flex-1 h-0 p-2">
          <div className="space-y-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-3 rounded-dd-lg p-3">
                <Skeleton className="h-10 w-10 flex-shrink-0 rounded-dd-full" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-8" />
                  </div>
                  <Skeleton className="h-3 w-48" />
                  <div className="flex gap-1.5">
                    <Skeleton className="h-4 w-14" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
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
          <div className="flex items-center gap-2">
            {meta && (
              <span className="text-timestamp text-dd-on-muted">
                {meta.total}
              </span>
            )}
            {onFiltersChange && (
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-dd transition-colors focus-visible:ring-2 focus-visible:ring-dd-accent-green",
                  filtersOpen || hasActiveFilters
                    ? "bg-dd-accent-green/20 text-dd-accent-green"
                    : "text-dd-muted hover:bg-dd-surface-overlay hover:text-dd-on-surface",
                )}
                aria-label="Filtros"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
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
          className="flex items-center gap-1.5 text-xs text-dd-muted hover:text-dd-on-surface transition-colors focus-visible:ring-2 focus-visible:ring-dd-accent-green"
        >
          <ArrowDownUp className="h-3 w-3" />
          <span>
            {sortOrder === "recent" ? "Mais recentes" : "Mais antigas"}
          </span>
        </button>
      </div>

      {/* Collapsible Filters */}
      {filtersOpen && onFiltersChange && filters && (
        <div className="border-b border-dd-border-subtle bg-dd-surface p-3 space-y-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wide text-dd-on-muted">
              Filtros do servidor
            </span>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-[11px] text-dd-accent-red hover:text-dd-accent-red/80 transition-colors"
              >
                <X className="h-3 w-3" />
                Limpar
              </button>
            )}
          </div>

          {/* State filter */}
          <select
            value={filters.state ?? ""}
            onChange={(e) => updateFilter("state", e.target.value)}
            className="h-8 w-full rounded-dd bg-dd-surface-raised border border-dd-border-subtle px-2 text-xs text-dd-on-surface focus:border-dd-accent-green focus:outline-none"
          >
            <option value="">Todos os estados</option>
            {INBOX_FILTER_STATES.map((s) => (
              <option key={s} value={s}>
                {stateLabel(s)}
              </option>
            ))}
          </select>

          <Input
            placeholder="Owner (nome)"
            value={filters.owner_user_name ?? ""}
            onChange={(e) => updateFilter("owner_user_name", e.target.value)}
            className="h-8 text-xs bg-dd-surface-raised border-dd-border-subtle"
          />

          <Input
            placeholder="Corretor atribuído (id)"
            value={filters.assigned_corretor_id ?? ""}
            onChange={(e) =>
              updateFilter("assigned_corretor_id", e.target.value)
            }
            className="h-8 text-xs bg-dd-surface-raised border-dd-border-subtle"
          />

          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Canal"
              value={filters.canal_origem ?? ""}
              onChange={(e) => updateFilter("canal_origem", e.target.value)}
              className="h-8 text-xs bg-dd-surface-raised border-dd-border-subtle"
            />
            <Input
              placeholder="Sistema"
              value={filters.sistema_origem ?? ""}
              onChange={(e) => updateFilter("sistema_origem", e.target.value)}
              className="h-8 text-xs bg-dd-surface-raised border-dd-border-subtle"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Status"
              value={filters.status ?? ""}
              onChange={(e) => updateFilter("status", e.target.value)}
              className="h-8 text-xs bg-dd-surface-raised border-dd-border-subtle"
            />
            <Input
              placeholder="Fase"
              value={filters.fase ?? ""}
              onChange={(e) => updateFilter("fase", e.target.value)}
              className="h-8 text-xs bg-dd-surface-raised border-dd-border-subtle"
            />
          </div>
        </div>
      )}

      {/* Conversation List */}
      <div className="flex-1 h-0 overflow-y-auto p-2">
        {filteredConversations.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-center">
            <p className="text-sm text-dd-on-muted">
              {search ? "Nenhuma conversa encontrada" : "Nenhuma conversa"}
            </p>
          </div>
        ) : (
          <div
            className="space-y-1"
            role="listbox"
            aria-label="Conversas"
            onKeyDown={handleListKeyDown}
          >
            {filteredConversations.map((conversation) => {
              const isSelected = conversation.lead_id === selectedId;
              const statusBadge = getStatusBadge(conversation.status);
              const channelBadge = getChannelBadge(conversation.canal_origem);

              return (
                <button
                  key={conversation.lead_id}
                  role="option"
                  aria-selected={isSelected}
                  aria-label={`Conversa com ${conversation.nome_completo || conversation.telefone || "desconhecido"}, ${conversation.last_message_preview || "sem mensagens"}`}
                  onClick={() => onSelect(conversation.lead_id)}
                  className={cn(
                    "group w-full rounded-dd-lg p-3 text-left transition-all duration-150 focus-visible:ring-2 focus-visible:ring-dd-accent-green",
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
                        <div className="flex items-center gap-1">
                          <span className="flex-shrink-0 text-timestamp text-dd-on-muted">
                            {formatTimeAgo(conversation.updated_at)}
                          </span>
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <button
                                onClick={(e) => e.stopPropagation()}
                                aria-label="Mais opções"
                                className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-dd-surface-overlay transition-all focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-dd-accent-green"
                              >
                                <MoreVertical className="h-4 w-4 text-dd-muted" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                onClick={() =>
                                  onAction?.("view", conversation.lead_id)
                                }
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Ver detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  onAction?.("assign", conversation.lead_id)
                                }
                              >
                                <UserPlus className="h-4 w-4 mr-2" />
                                Atribuir corretor
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  onAction?.("tags", conversation.lead_id)
                                }
                              >
                                <Tag className="h-4 w-4 mr-2" />
                                Editar tags
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  onAction?.("intervene", conversation.lead_id)
                                }
                              >
                                <Hand className="h-4 w-4 mr-2" />
                                Intervenção humana
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  onAction?.("release", conversation.lead_id)
                                }
                              >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Liberar follow-up
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  onAction?.("archive", conversation.lead_id)
                                }
                              >
                                <Archive className="h-4 w-4 mr-2" />
                                Arquivar conversa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
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

                      {/* Tags */}
                      {conversation.tags && conversation.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {conversation.tags.slice(0, 5).map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center rounded-full bg-dd-accent-purple/20 px-2 py-0.5 text-[10px] font-medium text-dd-accent-purple"
                            >
                              {tag}
                            </span>
                          ))}
                          {conversation.tags.length > 5 && (
                            <span className="inline-flex items-center rounded-full bg-dd-surface-overlay px-2 py-0.5 text-[10px] text-dd-on-muted">
                              +{conversation.tags.length - 5}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {meta && onPageChange && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-dd-border-subtle px-3 py-2">
          <span className="text-[11px] text-dd-on-muted">
            Página {currentPage} de {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange((currentPage - 2) * meta.limit)}
              disabled={currentPage <= 1}
              aria-label="Página anterior"
              className="flex h-7 w-7 items-center justify-center rounded-dd text-dd-muted transition-colors hover:bg-dd-surface-overlay hover:text-dd-on-surface disabled:opacity-30 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-dd-accent-green"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => onPageChange(currentPage * meta.limit)}
              disabled={currentPage >= totalPages}
              aria-label="Próxima página"
              className="flex h-7 w-7 items-center justify-center rounded-dd text-dd-muted transition-colors hover:bg-dd-surface-overlay hover:text-dd-on-surface disabled:opacity-30 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-dd-accent-green"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
