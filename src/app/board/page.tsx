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
  GripVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const STATUS_COLUMNS: Array<{
  id: LeadStatus;
  label: string;
  accent: string;
}> = [
  { id: "NOVO", label: "Novos", accent: "bg-dd-accent-orange" },
  {
    id: "EM_ATENDIMENTO",
    label: "Em Atendimento",
    accent: "bg-dd-accent-blue",
  },
  {
    id: "AGUARDANDO_RETORNO",
    label: "Aguardando Retorno",
    accent: "bg-dd-accent-orange",
  },
  { id: "CONVERTIDO", label: "Convertidos", accent: "bg-dd-accent-green" },
  { id: "PERDIDO", label: "Perdidos", accent: "bg-dd-accent-red" },
];

const STATUS_BADGE: Record<string, string> = {
  NOVO: "bg-dd-accent-orange/20 text-dd-accent-orange",
  EM_ATENDIMENTO: "bg-dd-accent-blue/20 text-dd-accent-blue",
  AGUARDANDO_RETORNO: "bg-dd-accent-orange/20 text-dd-accent-orange",
  CONVERTIDO: "bg-dd-accent-green/20 text-dd-accent-green",
  PERDIDO: "bg-dd-accent-red/20 text-dd-accent-red",
};

function formatDate(value?: string | null) {
  if (!value) return "-";
  try {
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(
      new Date(value),
    );
  } catch {
    return "-";
  }
}

function getInitials(name: string) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function BoardPage() {
  const [leadsByStatus, setLeadsByStatus] = useState<Record<string, Lead[]>>(
    {},
  );
  const [loadingByStatus, setLoadingByStatus] = useState<
    Record<string, boolean>
  >({});
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const dragCounterRef = useRef<Record<string, number>>({});

  const loadLeadsByStatus = useCallback(async (status: LeadStatus) => {
    setLoadingByStatus((prev) => ({ ...prev, [status]: true }));

    const result = await api.getPaginatedLeads({
      status,
      limit: 100,
      offset: 0,
    });

    if (!result.error && result.data) {
      setLeadsByStatus((prev) => ({
        ...prev,
        [status]: result.data!.data,
      }));
    }

    setLoadingByStatus((prev) => ({ ...prev, [status]: false }));
  }, []);

  const reloadAll = useCallback(() => {
    STATUS_COLUMNS.forEach((col) => {
      void loadLeadsByStatus(col.id);
    });
  }, [loadLeadsByStatus]);

  useEffect(() => {
    reloadAll();
  }, [reloadAll]);

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    const result = await api.updateLeadStatus(leadId, newStatus);
    if (!result.error) {
      reloadAll();
      if (selectedLead?.id === leadId) {
        setSelectedLead(null);
      }
    }
  };

  // --- Drag and Drop handlers ---
  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", lead.id);
  };

  const handleDragEnd = () => {
    setDraggedLead(null);
    setDragOverColumn(null);
    dragCounterRef.current = {};
  };

  const handleDragEnter = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    dragCounterRef.current[columnId] =
      (dragCounterRef.current[columnId] || 0) + 1;
    setDragOverColumn(columnId);
  };

  const handleDragLeave = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    dragCounterRef.current[columnId] =
      (dragCounterRef.current[columnId] || 1) - 1;
    if (dragCounterRef.current[columnId] <= 0) {
      setDragOverColumn(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: LeadStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    dragCounterRef.current = {};

    if (!draggedLead || draggedLead.status === targetStatus) return;

    // Optimistic: move card immediately
    const sourceStatus = draggedLead.status as LeadStatus;
    setLeadsByStatus((prev) => {
      const source = (prev[sourceStatus] || []).filter(
        (l) => l.id !== draggedLead.id,
      );
      const target = [
        ...(prev[targetStatus] || []),
        { ...draggedLead, status: targetStatus },
      ];
      return { ...prev, [sourceStatus]: source, [targetStatus]: target };
    });

    const result = await api.updateLeadStatus(draggedLead.id, targetStatus);
    if (result.error) {
      // Revert on error
      reloadAll();
    }
    setDraggedLead(null);
  };

  const filteredLeads = (status: string): Lead[] => {
    const leads = leadsByStatus[status] || [];
    if (!searchTerm.trim()) return leads;
    const q = searchTerm.toLowerCase();
    return leads.filter(
      (l) =>
        l.nome_completo?.toLowerCase().includes(q) ||
        l.telefone?.includes(q) ||
        l.email?.toLowerCase().includes(q),
    );
  };

  return (
    <div className="flex h-full flex-col bg-dd-primary">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-dd-border-subtle px-6 py-4">
        <div>
          <h1 className="text-lg font-medium tracking-tight text-dd-on-primary">
            Pipeline
          </h1>
          <p className="text-xs text-dd-on-muted mt-0.5">
            Arraste os leads entre colunas para alterar o status
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar lead..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 w-64 rounded-dd bg-dd-surface-raised pl-3 pr-3 text-sm text-dd-on-surface placeholder:text-dd-muted border border-dd-border-subtle focus:border-dd-accent-green focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 h-0 overflow-x-auto p-4">
        <div className="flex gap-3 h-full min-w-max">
          {STATUS_COLUMNS.map((col) => {
            const leads = filteredLeads(col.id);
            const isLoading = loadingByStatus[col.id] || false;
            const isDragOver = dragOverColumn === col.id;

            return (
              <div
                key={col.id}
                className="flex w-72 flex-shrink-0 flex-col"
                onDragEnter={(e) => handleDragEnter(e, col.id)}
                onDragLeave={(e) => handleDragLeave(e, col.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                {/* Column header */}
                <div className="flex items-center gap-2 px-3 py-2.5">
                  <div className={`h-2.5 w-2.5 rounded-full ${col.accent}`} />
                  <h3 className="text-sm font-medium text-dd-on-primary">
                    {col.label}
                  </h3>
                  <span className="ml-auto text-xs text-dd-on-muted">
                    {leads.length}
                  </span>
                </div>

                {/* Column body */}
                <div
                  className={`flex-1 h-0 overflow-y-auto rounded-dd-md border p-2 transition-colors ${
                    isDragOver
                      ? "border-dd-accent-green/50 bg-dd-accent-green/5"
                      : "border-dd-border-subtle bg-dd-surface/50"
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="h-5 w-5 rounded-full border-2 border-dd-border-subtle border-t-dd-on-muted animate-spin" />
                    </div>
                  ) : leads.length === 0 ? (
                    <div className="flex h-24 items-center justify-center text-xs text-dd-on-muted">
                      {isDragOver ? "Solte aqui" : "Nenhum lead"}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {leads.map((lead) => (
                        <LeadCard
                          key={lead.id}
                          lead={lead}
                          isDragging={draggedLead?.id === lead.id}
                          onSelect={setSelectedLead}
                          onDragStart={handleDragStart}
                          onDragEnd={handleDragEnd}
                          onStatusChange={handleStatusChange}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Side Panel */}
      {selectedLead && (
        <LeadDetailPanel
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}

/* ---------- Lead Card ---------- */

function LeadCard({
  lead,
  isDragging,
  onSelect,
  onDragStart,
  onDragEnd,
  onStatusChange,
}: {
  lead: Lead;
  isDragging: boolean;
  onSelect: (lead: Lead) => void;
  onDragStart: (e: React.DragEvent, lead: Lead) => void;
  onDragEnd: () => void;
  onStatusChange: (leadId: string, status: LeadStatus) => void;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, lead)}
      onDragEnd={onDragEnd}
      className={`group cursor-grab rounded-dd-md border bg-dd-surface-raised p-3 transition-all active:cursor-grabbing ${
        isDragging
          ? "border-dd-accent-green/50 opacity-50 shadow-lg"
          : "border-dd-border-subtle hover:border-dd-border"
      }`}
    >
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        <GripVertical className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-dd-muted opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Avatar */}
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-dd-full bg-dd-surface-overlay text-[11px] font-medium text-dd-on-muted">
          {getInitials(lead.nome_completo || lead.telefone || "?")}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <span className="truncate text-sm font-medium text-dd-on-surface">
              {lead.nome_completo || "Sem nome"}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <button
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Mais opções"
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
                    Abrir WhatsApp
                  </DropdownMenuItem>
                )}
                {lead.email && (
                  <DropdownMenuItem
                    onClick={() =>
                      window.open(`mailto:${lead.email}`, "_blank")
                    }
                  >
                    <Mail className="h-3.5 w-3.5 mr-2" />
                    Enviar email
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {STATUS_COLUMNS.filter((c) => c.id !== lead.status).map((c) => (
                  <DropdownMenuItem
                    key={c.id}
                    onClick={() => onStatusChange(lead.id, c.id)}
                  >
                    <ArrowRight className="h-3.5 w-3.5 mr-2" />
                    Mover para {c.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {lead.telefone && (
            <p className="text-xs text-dd-on-muted">{lead.telefone}</p>
          )}

          {/* Tags */}
          <div className="mt-2 flex flex-wrap gap-1">
            {lead.tipo_interesse && (
              <span className="inline-flex items-center rounded-xs bg-dd-surface-overlay px-1.5 py-0.5 text-[10px] text-dd-on-muted">
                {lead.tipo_interesse}
              </span>
            )}
            {lead.em_follow_up && (
              <span className="inline-flex items-center rounded-xs bg-dd-accent-orange/15 px-1.5 py-0.5 text-[10px] text-dd-accent-orange">
                FU
              </span>
            )}
            {lead.canal_origem && (
              <span className="inline-flex items-center rounded-xs bg-dd-surface-overlay px-1.5 py-0.5 text-[10px] text-dd-on-muted">
                {lead.canal_origem}
              </span>
            )}
          </div>

          {/* Qualification preview */}
          {lead.resumo_qualificacao && (
            <p className="mt-1.5 line-clamp-2 text-[11px] text-dd-on-muted">
              {lead.resumo_qualificacao}
            </p>
          )}

          {/* Footer */}
          <div className="mt-2 flex items-center justify-between text-[10px] text-dd-on-muted">
            <span>{lead.sistema_origem || "-"}</span>
            <span>{formatDate(lead.created_at)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Detail Side Panel ---------- */

function LeadDetailPanel({
  lead,
  onClose,
  onStatusChange,
}: {
  lead: Lead;
  onClose: () => void;
  onStatusChange: (leadId: string, status: LeadStatus) => void;
}) {
  return (
    <>
      <div
        className="fixed inset-0 z-30 bg-black/40 cursor-pointer"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 bottom-0 z-40 w-96 border-l border-dd-border-subtle bg-dd-surface overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-dd-border-subtle p-4">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-medium text-dd-on-primary">
              {lead.nome_completo || "Lead sem nome"}
            </h3>
            <p className="text-xs text-dd-on-muted">{lead.telefone}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-8 w-8 items-center justify-center rounded-dd text-dd-muted hover:text-dd-on-surface transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Status badge */}
          <div className="flex flex-wrap gap-2">
            <span
              className={`inline-flex items-center rounded-xs px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${STATUS_BADGE[lead.status] || "bg-dd-surface-overlay text-dd-on-muted"}`}
            >
              {lead.status}
            </span>
            {lead.em_follow_up && (
              <span className="inline-flex items-center rounded-xs bg-dd-accent-orange/15 px-2 py-0.5 text-[10px] font-medium text-dd-accent-orange">
                Follow-up ativo
              </span>
            )}
          </div>

          {/* Info */}
          <Section title="Informações">
            <Row label="Email" value={lead.email} />
            <Row label="Tipo" value={lead.tipo_interesse} />
            <Row label="Canal" value={lead.canal_origem} />
            <Row label="Sistema" value={lead.sistema_origem} />
            <Row label="Criado" value={formatDate(lead.created_at)} />
            <Row label="Atualizado" value={formatDate(lead.updated_at)} />
          </Section>

          {/* Qualification */}
          {lead.resumo_qualificacao && (
            <Section title="Qualificação">
              <p className="text-xs text-dd-on-surface">
                {lead.resumo_qualificacao}
              </p>
            </Section>
          )}

          {/* Actions */}
          <Section title="Ações">
            <div className="space-y-2">
              {lead.telefone && (
                <a
                  href={`https://wa.me/${lead.telefone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-dd bg-dd-accent-green/10 px-3 py-2 text-xs text-dd-accent-green hover:bg-dd-accent-green/20 transition-colors"
                >
                  <Phone className="h-3.5 w-3.5" />
                  Abrir WhatsApp
                </a>
              )}
              {lead.email && (
                <a
                  href={`mailto:${lead.email}`}
                  className="flex items-center gap-2 rounded-dd bg-dd-accent-blue/10 px-3 py-2 text-xs text-dd-accent-blue hover:bg-dd-accent-blue/20 transition-colors"
                >
                  <Mail className="h-3.5 w-3.5" />
                  Enviar email
                </a>
              )}
            </div>
          </Section>

          {/* Move to status */}
          <Section title="Alterar Status">
            <div className="flex flex-wrap gap-1.5">
              {STATUS_COLUMNS.map((col) => (
                <button
                  key={col.id}
                  onClick={() => onStatusChange(lead.id, col.id)}
                  disabled={lead.status === col.id}
                  className={`inline-flex items-center gap-1.5 rounded-dd px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                    lead.status === col.id
                      ? "bg-dd-surface-overlay text-dd-on-muted opacity-50 cursor-not-allowed"
                      : "bg-dd-surface-raised text-dd-on-surface hover:bg-dd-surface-overlay border border-dd-border-subtle"
                  }`}
                >
                  <div className={`h-2 w-2 rounded-full ${col.accent}`} />
                  {col.label}
                </button>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </>
  );
}

/* ---------- Shared components ---------- */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-dd-md border border-dd-border-subtle p-3">
      <div className="text-[11px] uppercase tracking-wide text-dd-on-muted mb-2">
        {title}
      </div>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-baseline justify-between gap-2 py-0.5">
      <span className="text-[11px] text-dd-on-muted">{label}</span>
      <span className="text-xs text-dd-on-surface text-right truncate max-w-[60%]">
        {value || "-"}
      </span>
    </div>
  );
}
