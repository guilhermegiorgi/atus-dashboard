"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { api } from "@/lib/api/client";
import { Lead, LeadStatus } from "@/types/leads";
import {
  MoreVertical,
  Eye,
  Phone,
  Mail,
  ArrowRight,
  X,
  Plus,
  Search,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const COLUMNS: Array<{
  id: LeadStatus;
  label: string;
  color: string;
  bg: string;
  ring: string;
  dot: string;
}> = [
  {
    id: "NOVO",
    label: "Novos",
    color: "text-dd-accent-orange",
    bg: "bg-dd-accent-orange/8",
    ring: "ring-dd-accent-orange/20",
    dot: "bg-dd-accent-orange",
  },
  {
    id: "EM_ATENDIMENTO",
    label: "Em Atendimento",
    color: "text-dd-accent-blue",
    bg: "bg-dd-accent-blue/8",
    ring: "ring-dd-accent-blue/20",
    dot: "bg-dd-accent-blue",
  },
  {
    id: "AGUARDANDO_RETORNO",
    label: "Aguardando",
    color: "text-dd-accent-orange",
    bg: "bg-dd-accent-orange/8",
    ring: "ring-dd-accent-orange/20",
    dot: "bg-dd-accent-orange",
  },
  {
    id: "CONVERTIDO",
    label: "Convertidos",
    color: "text-dd-accent-green",
    bg: "bg-dd-accent-green/8",
    ring: "ring-dd-accent-green/20",
    dot: "bg-dd-accent-green",
  },
  {
    id: "PERDIDO",
    label: "Perdidos",
    color: "text-dd-accent-red",
    bg: "bg-dd-accent-red/8",
    ring: "ring-dd-accent-red/20",
    dot: "bg-dd-accent-red",
  },
];

const STATUS_COLORS: Record<string, string> = {
  NOVO: "bg-dd-accent-orange/15 text-dd-accent-orange",
  EM_ATENDIMENTO: "bg-dd-accent-blue/15 text-dd-accent-blue",
  AGUARDANDO_RETORNO: "bg-dd-accent-orange/15 text-dd-accent-orange",
  CONVERTIDO: "bg-dd-accent-green/15 text-dd-accent-green",
  PERDIDO: "bg-dd-accent-red/15 text-dd-accent-red",
};

function fmtDate(v?: string | null) {
  if (!v) return "";
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
    }).format(new Date(v));
  } catch {
    return "";
  }
}

function initials(name: string) {
  if (!name) return "?";
  const p = name.trim().split(/\s+/);
  return p.length === 1
    ? p[0][0].toUpperCase()
    : (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

export default function BoardPage() {
  const [leads, setLeads] = useState<Record<string, Lead[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<Lead | null>(null);
  const [search, setSearch] = useState("");
  const [dragged, setDragged] = useState<Lead | null>(null);
  const [overCol, setOverCol] = useState<string | null>(null);
  const counters = useRef<Record<string, number>>({});

  const loadCol = useCallback(async (status: LeadStatus) => {
    setLoading((p) => ({ ...p, [status]: true }));
    const r = await api.getPaginatedLeads({ status, limit: 200, offset: 0 });
    if (!r.error && r.data) {
      setLeads((p) => ({ ...p, [status]: r.data!.data }));
    }
    setLoading((p) => ({ ...p, [status]: false }));
  }, []);

  const reload = useCallback(() => {
    COLUMNS.forEach((c) => loadCol(c.id));
  }, [loadCol]);

  useEffect(() => {
    reload();
  }, [reload]);

  const moveLead = async (leadId: string, to: LeadStatus) => {
    const r = await api.updateLeadStatus(leadId, to);
    if (!r.error) reload();
  };

  // DnD
  const onDragStart = (e: React.DragEvent, lead: Lead) => {
    setDragged(lead);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", lead.id);
  };
  const onDragEnd = () => {
    setDragged(null);
    setOverCol(null);
    counters.current = {};
  };
  const onDragEnter = (e: React.DragEvent, col: string) => {
    e.preventDefault();
    counters.current[col] = (counters.current[col] || 0) + 1;
    setOverCol(col);
  };
  const onDragLeave = (e: React.DragEvent, col: string) => {
    e.preventDefault();
    counters.current[col] = (counters.current[col] || 1) - 1;
    if (counters.current[col] <= 0) setOverCol(null);
  };
  const onDrop = async (e: React.DragEvent, to: LeadStatus) => {
    e.preventDefault();
    setOverCol(null);
    counters.current = {};
    if (!dragged || dragged.status === to) return;
    const from = dragged.status as LeadStatus;
    // optimistic
    setLeads((p) => ({
      ...p,
      [from]: (p[from] || []).filter((l) => l.id !== dragged.id),
      [to]: [...(p[to] || []), { ...dragged, status: to }],
    }));
    const r = await api.updateLeadStatus(dragged.id, to);
    if (r.error) reload();
    setDragged(null);
  };

  const filter = (status: string): Lead[] => {
    const list = leads[status] || [];
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (l) =>
        l.nome_completo?.toLowerCase().includes(q) ||
        l.telefone?.includes(q) ||
        l.email?.toLowerCase().includes(q),
    );
  };

  const totalLeads = COLUMNS.reduce(
    (s, c) => s + (leads[c.id]?.length || 0),
    0,
  );

  return (
    <div className="flex h-full flex-col bg-dd-primary overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-dd-border-subtle px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-dd-on-primary tracking-tight">
              Pipeline de Leads
            </h1>
            <p className="text-[11px] text-dd-on-muted mt-0.5">
              {totalLeads} leads em {COLUMNS.length} estágios
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-dd-muted" />
              <input
                type="text"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 w-52 rounded-md bg-dd-surface-raised pl-8 pr-3 text-xs text-dd-on-surface placeholder:text-dd-muted border border-dd-border-subtle focus:border-dd-accent-green focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Board */}
      <div className="flex-1 h-0 overflow-x-auto overflow-y-hidden">
        <div className="flex h-full gap-px min-w-max bg-dd-border-subtle/30">
          {COLUMNS.map((col) => {
            const items = filter(col.id);
            const isLoading = loading[col.id] || false;
            const isOver = overCol === col.id;

            return (
              <div
                key={col.id}
                className="flex w-[300px] flex-shrink-0 flex-col bg-dd-primary"
                onDragEnter={(e) => onDragEnter(e, col.id)}
                onDragLeave={(e) => onDragLeave(e, col.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => onDrop(e, col.id)}
              >
                {/* Column header */}
                <div className="flex-shrink-0 px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`h-2 w-2 rounded-full ${col.dot}`} />
                    <span className="text-[13px] font-medium text-dd-on-primary">
                      {col.label}
                    </span>
                    <span
                      className={`ml-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-semibold ${col.bg} ${col.color}`}
                    >
                      {items.length}
                    </span>
                  </div>
                </div>

                {/* Cards area */}
                <div
                  className={`flex-1 h-0 overflow-y-auto px-2 pb-2 transition-colors rounded-md mx-1 ${
                    isOver
                      ? "ring-2 ring-inset ring-dd-accent-green/30 bg-dd-accent-green/[0.03]"
                      : ""
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="h-4 w-4 rounded-full border-2 border-dd-border-subtle border-t-dd-on-muted animate-spin" />
                    </div>
                  ) : items.length === 0 ? (
                    <div
                      className={`flex flex-col items-center justify-center py-12 rounded-md border border-dashed transition-colors ${
                        isOver
                          ? "border-dd-accent-green/40 bg-dd-accent-green/[0.05]"
                          : "border-dd-border-subtle"
                      }`}
                    >
                      <p className="text-[11px] text-dd-on-muted">
                        {isOver ? "Solte aqui" : "Nenhum lead"}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {items.map((lead) => (
                        <Card
                          key={lead.id}
                          lead={lead}
                          isDragged={dragged?.id === lead.id}
                          onSelect={setSelected}
                          onDragStart={onDragStart}
                          onDragEnd={onDragEnd}
                          onMove={moveLead}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Add column placeholder */}
          <div className="flex w-[60px] flex-shrink-0 flex-col items-center pt-3 bg-dd-primary">
            <button
              className="flex h-8 w-8 items-center justify-center rounded-md border border-dashed border-dd-border-subtle text-dd-muted hover:border-dd-border hover:text-dd-on-surface transition-colors"
              title="Adicionar coluna (em breve)"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      {selected && (
        <DetailPanel
          lead={selected}
          onClose={() => setSelected(null)}
          onMove={moveLead}
        />
      )}
    </div>
  );
}

/* ==================== Card ==================== */

function Card({
  lead,
  isDragged,
  onSelect,
  onDragStart,
  onDragEnd,
  onMove,
}: {
  lead: Lead;
  isDragged: boolean;
  onSelect: (l: Lead) => void;
  onDragStart: (e: React.DragEvent, l: Lead) => void;
  onDragEnd: () => void;
  onMove: (id: string, s: LeadStatus) => void;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, lead)}
      onDragEnd={onDragEnd}
      className={`group relative rounded-md border bg-dd-surface-raised px-3 py-2.5 cursor-grab active:cursor-grabbing transition-all duration-150 ${
        isDragged
          ? "border-dd-accent-green/40 opacity-40 scale-[0.98]"
          : "border-transparent hover:border-dd-border-subtle hover:shadow-[0_1px_3px_rgba(0,0,0,0.2)]"
      }`}
    >
      {/* Top row: name + menu */}
      <div className="flex items-start gap-2">
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-dd-surface-overlay text-[10px] font-semibold text-dd-on-muted select-none">
          {initials(lead.nome_completo || lead.telefone || "?")}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-dd-on-surface leading-tight truncate">
            {lead.nome_completo || "Sem nome"}
          </p>
          {lead.telefone && (
            <p className="text-[11px] text-dd-on-muted mt-0.5">
              {lead.telefone}
            </p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <button
              onClick={(e) => e.stopPropagation()}
              className="flex h-6 w-6 items-center justify-center rounded opacity-0 group-hover:opacity-100 hover:bg-dd-surface-overlay transition-all"
            >
              <MoreVertical className="h-3.5 w-3.5 text-dd-muted" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => onSelect(lead)}>
              <Eye className="h-3.5 w-3.5 mr-2" />
              Ver detalhes
            </DropdownMenuItem>
            {lead.telefone && (
              <DropdownMenuItem
                onClick={() =>
                  window.open(`https://wa.me/${lead.telefone}`, "_blank")
                }
              >
                <Phone className="h-3.5 w-3.5 mr-2" />
                WhatsApp
              </DropdownMenuItem>
            )}
            {lead.email && (
              <DropdownMenuItem
                onClick={() => window.open(`mailto:${lead.email}`, "_blank")}
              >
                <Mail className="h-3.5 w-3.5 mr-2" />
                Email
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {COLUMNS.filter((c) => c.id !== lead.status).map((c) => (
              <DropdownMenuItem
                key={c.id}
                onClick={() => onMove(lead.id, c.id)}
              >
                <ArrowRight className="h-3.5 w-3.5 mr-2" />
                {c.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tags row */}
      <div className="mt-2 flex flex-wrap gap-1">
        {lead.tipo_interesse && (
          <span className="inline-flex items-center rounded-sm bg-dd-surface-overlay px-1.5 py-px text-[10px] text-dd-on-muted font-medium">
            {lead.tipo_interesse}
          </span>
        )}
        {lead.canal_origem && (
          <span className="inline-flex items-center rounded-sm bg-dd-surface-overlay px-1.5 py-px text-[10px] text-dd-on-muted">
            {lead.canal_origem}
          </span>
        )}
        {lead.em_follow_up && (
          <span className="inline-flex items-center rounded-sm bg-dd-accent-orange/10 px-1.5 py-px text-[10px] text-dd-accent-orange font-medium">
            follow-up
          </span>
        )}
      </div>

      {/* Qualification */}
      {lead.resumo_qualificacao && (
        <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-dd-on-muted">
          {lead.resumo_qualificacao}
        </p>
      )}

      {/* Footer */}
      <div className="mt-2 flex items-center justify-between text-[10px] text-dd-on-muted/60">
        <span>{lead.sistema_origem || ""}</span>
        <span>{fmtDate(lead.created_at)}</span>
      </div>
    </div>
  );
}

/* ==================== Detail Panel ==================== */

function DetailPanel({
  lead,
  onClose,
  onMove,
}: {
  lead: Lead;
  onClose: () => void;
  onMove: (id: string, s: LeadStatus) => void;
}) {
  return (
    <>
      <div
        className="fixed inset-0 z-30 bg-black/40 backdrop-blur-[2px] cursor-pointer"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 bottom-0 z-40 w-[380px] border-l border-dd-border-subtle bg-dd-surface overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-dd-border-subtle bg-dd-surface/95 backdrop-blur-sm px-5 py-3.5">
          <div className="min-w-0 flex-1 flex items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-dd-surface-overlay text-sm font-semibold text-dd-on-muted">
              {initials(lead.nome_completo || lead.telefone || "?")}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-dd-on-primary truncate">
                {lead.nome_completo || "Lead sem nome"}
              </h3>
              <p className="text-[11px] text-dd-on-muted">{lead.telefone}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-dd-muted hover:text-dd-on-surface hover:bg-dd-surface-overlay transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Status */}
          <div className="flex flex-wrap gap-1.5">
            <span
              className={`inline-flex items-center rounded-sm px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${STATUS_COLORS[lead.status] || "bg-dd-surface-overlay text-dd-on-muted"}`}
            >
              {lead.status?.replace(/_/g, " ")}
            </span>
            {lead.em_follow_up && (
              <span className="inline-flex items-center rounded-sm bg-dd-accent-orange/10 px-2 py-0.5 text-[10px] font-semibold text-dd-accent-orange">
                FOLLOW-UP
              </span>
            )}
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
            <InfoField label="Email" value={lead.email} />
            <InfoField label="Tipo" value={lead.tipo_interesse} />
            <InfoField label="Canal" value={lead.canal_origem} />
            <InfoField label="Sistema" value={lead.sistema_origem} />
            <InfoField label="Criado" value={fmtDate(lead.created_at)} />
            <InfoField label="Atualizado" value={fmtDate(lead.updated_at)} />
          </div>

          {/* Qualification */}
          {lead.resumo_qualificacao && (
            <div className="rounded-md bg-dd-surface-raised border border-dd-border-subtle p-3.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-dd-on-muted mb-1.5">
                Qualificação
              </p>
              <p className="text-xs leading-relaxed text-dd-on-surface">
                {lead.resumo_qualificacao}
              </p>
            </div>
          )}

          {/* Contact actions */}
          <div className="flex gap-2">
            {lead.telefone && (
              <a
                href={`https://wa.me/${lead.telefone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-dd-accent-green/10 px-3 py-2 text-[11px] font-medium text-dd-accent-green hover:bg-dd-accent-green/15 transition-colors"
              >
                <Phone className="h-3 w-3" />
                WhatsApp
              </a>
            )}
            {lead.email && (
              <a
                href={`mailto:${lead.email}`}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-dd-accent-blue/10 px-3 py-2 text-[11px] font-medium text-dd-accent-blue hover:bg-dd-accent-blue/15 transition-colors"
              >
                <Mail className="h-3 w-3" />
                Email
              </a>
            )}
          </div>

          {/* Move to */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-dd-on-muted mb-2">
              Mover para
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {COLUMNS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onMove(lead.id, c.id)}
                  disabled={lead.status === c.id}
                  className={`flex items-center gap-2 rounded-md px-2.5 py-2 text-[11px] font-medium transition-all ${
                    lead.status === c.id
                      ? "bg-dd-surface-raised text-dd-on-muted/40 cursor-not-allowed"
                      : "bg-dd-surface-raised text-dd-on-surface hover:bg-dd-surface-overlay border border-dd-border-subtle hover:border-dd-border"
                  }`}
                >
                  <div className={`h-2 w-2 rounded-full ${c.dot}`} />
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function InfoField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-[10px] text-dd-on-muted">{label}</p>
      <p className="text-xs text-dd-on-surface mt-0.5 truncate">
        {value || "-"}
      </p>
    </div>
  );
}
