"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity, Filter, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuditEntry {
  id: string;
  user_id?: string;
  user_name?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: Record<string, unknown>;
  ip?: string;
  created_at: string;
}

const ACTION_COLORS: Record<string, string> = {
  create: "bg-dd-accent-green/15 text-dd-accent-green",
  update: "bg-dd-accent-blue/15 text-dd-accent-blue",
  delete: "bg-dd-accent-red/15 text-dd-accent-red",
  assign: "bg-dd-accent-purple/15 text-dd-accent-purple",
  status_change: "bg-dd-accent-orange/15 text-dd-accent-orange",
};

const ENTITY_LABELS: Record<string, string> = {
  lead: "Lead",
  conversation: "Conversa",
  user: "Usuário",
  tag: "Tag",
  kanban_stage: "Coluna Kanban",
  template: "Template",
};

function actionLabel(action: string): string {
  const map: Record<string, string> = {
    create: "criou",
    update: "atualizou",
    delete: "removeu",
    assign: "atribuiu",
    status_change: "mudou status",
    login: "fez login",
    logout: "fez logout",
    intervene: "intervieram",
    return_to_bot: "devolveu ao bot",
  };
  return map[action] || action;
}

function fmtDateTime(v?: string | null) {
  if (!v) return "";
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(v));
  } catch {
    return "";
  }
}

function timeAgo(v?: string | null) {
  if (!v) return "";
  try {
    const diff = Date.now() - new Date(v).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "agora";
    if (mins < 60) return `${mins}min atrás`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h atrás`;
    const days = Math.floor(hours / 24);
    return `${days}d atrás`;
  } catch {
    return "";
  }
}

export default function ActivityPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (actionFilter) params.set("action", actionFilter);
    if (entityFilter) params.set("entity_type", entityFilter);
    params.set("limit", "50");

    try {
      const res = await fetch(`/api/v1/audit?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setEntries(data.data || []);
      } else {
        setError(data.error || "Erro ao carregar atividades");
      }
    } catch {
      setError("Erro ao conectar ao servidor");
    } finally {
      setLoading(false);
    }
  }, [actionFilter, entityFilter]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="flex h-full flex-col bg-dd-primary overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-dd-border-subtle px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-dd-on-primary tracking-tight">
              Atividades
            </h1>
            <p className="text-[11px] text-dd-on-muted mt-0.5">
              Registro de ações do sistema
            </p>
          </div>
          <button
            onClick={load}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-dd-border-subtle text-dd-muted hover:text-dd-on-surface hover:bg-dd-surface-overlay transition-colors"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="flex-shrink-0 border-b border-dd-border-subtle px-6 py-3 flex items-center gap-3">
        <Filter className="h-3.5 w-3.5 text-dd-muted" />
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="h-7 rounded-md bg-dd-surface-raised px-2 text-xs text-dd-on-surface border border-dd-border-subtle focus:border-dd-accent-green focus:outline-none"
        >
          <option value="">Todas as ações</option>
          <option value="create">Criar</option>
          <option value="update">Atualizar</option>
          <option value="delete">Remover</option>
          <option value="assign">Atribuir</option>
          <option value="status_change">Mudar status</option>
          <option value="login">Login</option>
        </select>
        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="h-7 rounded-md bg-dd-surface-raised px-2 text-xs text-dd-on-surface border border-dd-border-subtle focus:border-dd-accent-green focus:outline-none"
        >
          <option value="">Todas as entidades</option>
          <option value="lead">Leads</option>
          <option value="conversation">Conversas</option>
          <option value="user">Usuários</option>
          <option value="tag">Tags</option>
          <option value="kanban_stage">Kanban</option>
        </select>
      </div>

      {/* Content */}
      <div className="flex-1 h-0 overflow-y-auto px-6 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-4 w-4 rounded-full border-2 border-dd-border-subtle border-t-dd-on-muted animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-dd-accent-red">{error}</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Activity className="h-8 w-8 text-dd-muted mb-2" />
            <p className="text-sm text-dd-on-muted">
              Nenhuma atividade encontrada
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="group flex items-start gap-3 rounded-md px-3 py-2.5 hover:bg-dd-surface-raised transition-colors"
              >
                {/* Timeline dot */}
                <div className="mt-1.5 flex-shrink-0">
                  <div
                    className={cn(
                      "h-2 w-2 rounded-full",
                      ACTION_COLORS[entry.action] || "bg-dd-muted",
                    )}
                  />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] text-dd-on-surface">
                    <span className="font-medium text-dd-on-primary">
                      {entry.user_name || "Sistema"}
                    </span>{" "}
                    <span className="text-dd-on-muted">
                      {actionLabel(entry.action)}
                    </span>{" "}
                    <span className="text-dd-on-muted">
                      {ENTITY_LABELS[entry.entity_type] || entry.entity_type}
                    </span>
                    {entry.entity_id && (
                      <span className="text-dd-on-muted/60 text-[11px] ml-1">
                        #{entry.entity_id.slice(0, 8)}
                      </span>
                    )}
                  </p>
                  {entry.details && typeof entry.details === "object" && (
                    <p className="text-[11px] text-dd-on-muted/60 mt-0.5 truncate">
                      {Object.entries(entry.details)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(" · ")}
                    </p>
                  )}
                </div>

                {/* Time */}
                <div className="flex-shrink-0 text-right">
                  <p className="text-[10px] text-dd-on-muted/60">
                    {timeAgo(entry.created_at)}
                  </p>
                  <p className="text-[10px] text-dd-on-muted/40 hidden group-hover:block">
                    {fmtDateTime(entry.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
