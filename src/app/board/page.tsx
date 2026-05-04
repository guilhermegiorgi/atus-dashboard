"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { api } from "@/lib/api/client";
import { KanbanStage } from "@/types/leads";
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
  Settings,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Default color palette for fallback when stage has no color
const DEFAULT_COLORS = [
  "#F59E0B", // orange
  "#3B82F6", // blue
  "#8B5CF6", // purple
  "#10B981", // green
  "#EF4444", // red
  "#EC4899", // pink
  "#06B6D4", // cyan
  "#84CC16", // lime
];

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

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function BoardPage() {
  const [stages, setStages] = useState<KanbanStage[]>([]);
  const [leads, setLeads] = useState<Record<string, Lead[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<Lead | null>(null);
  const [search, setSearch] = useState("");
  const [dragged, setDragged] = useState<Lead | null>(null);
  const [overCol, setOverCol] = useState<string | null>(null);
  const [showStageModal, setShowStageModal] = useState<
    null | { mode: "create" } | { mode: "edit"; stage: KanbanStage }
  >(null);
  const [stageForm, setStageForm] = useState({
    name: "",
    color: "#3B82F6",
    lead_status: "",
  });
  const [stageLoading, setStageLoading] = useState(false);
  const counters = useRef<Record<string, number>>({});

  // Load kanban stages from API
  const loadStages = useCallback(async () => {
    const r = await api.getKanbanStages();
    if (!r.error && r.data) {
      setStages(r.data);
    }
  }, []);

  useEffect(() => {
    loadStages();
  }, [loadStages]);

  const loadCol = useCallback(async (status: string) => {
    setLoading((p) => ({ ...p, [status]: true }));
    const r = await api.getPaginatedLeads({
      status: status as LeadStatus,
      limit: 200,
      offset: 0,
    });
    if (!r.error && r.data) {
      setLeads((p) => ({ ...p, [status]: r.data!.data }));
    }
    setLoading((p) => ({ ...p, [status]: false }));
  }, []);

  const reload = useCallback(() => {
    stages.forEach((s) => {
      if (s.lead_status) loadCol(s.lead_status);
    });
  }, [stages, loadCol]);

  useEffect(() => {
    if (stages.length > 0) reload();
  }, [stages, reload]);

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
  const onDrop = async (e: React.DragEvent, stage: KanbanStage) => {
    e.preventDefault();
    setOverCol(null);
    counters.current = {};
    if (!dragged || !stage.lead_status || dragged.status === stage.lead_status)
      return;
    const from = dragged.status as LeadStatus;
    const to = stage.lead_status as LeadStatus;
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

  const totalLeads = stages.reduce(
    (s, stage) => s + (leads[stage.lead_status || ""]?.length || 0),
    0,
  );

  // Stage CRUD
  const openCreateModal = () => {
    setStageForm({
      name: "",
      color: DEFAULT_COLORS[stages.length % DEFAULT_COLORS.length],
      lead_status: "",
    });
    setShowStageModal({ mode: "create" });
  };

  const openEditModal = (stage: KanbanStage) => {
    setStageForm({
      name: stage.name,
      color: stage.color || "#3B82F6",
      lead_status: stage.lead_status || "",
    });
    setShowStageModal({ mode: "edit", stage });
  };

  const saveStage = async () => {
    if (!stageForm.name.trim()) return;
    setStageLoading(true);
    if (showStageModal?.mode === "create") {
      const r = await api.createKanbanStage({
        name: stageForm.name,
        color: stageForm.color,
        lead_status: stageForm.lead_status || undefined,
      });
      if (!r.error) {
        await loadStages();
        setShowStageModal(null);
      }
    } else if (showStageModal?.mode === "edit") {
      const r = await api.updateKanbanStage(showStageModal.stage.id, {
        name: stageForm.name,
        color: stageForm.color,
        lead_status: stageForm.lead_status || undefined,
      });
      if (!r.error) {
        await loadStages();
        setShowStageModal(null);
      }
    }
    setStageLoading(false);
  };

  const deleteStage = async (stage: KanbanStage) => {
    if (!confirm(`Remover coluna "${stage.name}"?`)) return;
    const r = await api.deleteKanbanStage(stage.id);
    if (!r.error) await loadStages();
  };

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
              {totalLeads} leads em {stages.length} estágios
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
            <button
              onClick={openCreateModal}
              className="flex h-8 items-center gap-1.5 rounded-md bg-dd-accent-green/10 px-3 text-[11px] font-medium text-dd-accent-green hover:bg-dd-accent-green/15 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Nova Coluna
            </button>
          </div>
        </div>
      </header>

      {/* Board */}
      <div className="flex-1 h-0 overflow-x-auto overflow-y-hidden">
        <div className="flex h-full gap-px min-w-max bg-dd-border-subtle/30">
          {stages.map((stage) => {
            const statusKey = stage.lead_status || stage.id;
            const items = filter(statusKey);
            const isLoading = loading[statusKey] || false;
            const isOver = overCol === stage.id;
            const color = stage.color || "#6B7280";

            return (
              <div
                key={stage.id}
                className="flex w-[300px] flex-shrink-0 flex-col bg-dd-primary"
                onDragEnter={(e) => onDragEnter(e, stage.id)}
                onDragLeave={(e) => onDragLeave(e, stage.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => onDrop(e, stage)}
              >
                {/* Column header */}
                <div className="flex-shrink-0 px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="h-2 w-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-[13px] font-medium text-dd-on-primary truncate flex-1">
                      {stage.name}
                    </span>
                    <span
                      className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-semibold"
                      style={{
                        backgroundColor: hexToRgba(color, 0.1),
                        color: color,
                      }}
                    >
                      {items.length}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <button className="flex h-6 w-6 items-center justify-center rounded hover:bg-dd-surface-overlay transition-colors">
                          <Settings className="h-3 w-3 text-dd-muted" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => openEditModal(stage)}>
                          <Settings className="h-3.5 w-3.5 mr-2" />
                          Editar coluna
                        </DropdownMenuItem>
                        {!stage.is_default && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => deleteStage(stage)}
                              className="text-dd-accent-red focus:text-dd-accent-red"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-2" />
                              Remover
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
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
                          stages={stages}
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

          {/* Add column button */}
          <div className="flex w-[60px] flex-shrink-0 flex-col items-center pt-3 bg-dd-primary">
            <button
              onClick={openCreateModal}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-dashed border-dd-border-subtle text-dd-muted hover:border-dd-accent-green hover:text-dd-accent-green transition-colors"
              title="Adicionar coluna"
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
          stages={stages}
          onClose={() => setSelected(null)}
          onMove={moveLead}
        />
      )}

      {/* Stage Modal */}
      {showStageModal && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px]"
            onClick={() => setShowStageModal(null)}
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-dd-border-subtle bg-dd-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-dd-border-subtle px-5 py-3.5">
              <h3 className="text-sm font-semibold text-dd-on-primary">
                {showStageModal.mode === "create"
                  ? "Nova Coluna"
                  : "Editar Coluna"}
              </h3>
              <button
                onClick={() => setShowStageModal(null)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-dd-muted hover:text-dd-on-surface hover:bg-dd-surface-overlay transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-[11px] font-medium text-dd-on-muted mb-1.5 block">
                  Nome da coluna
                </label>
                <input
                  type="text"
                  value={stageForm.name}
                  onChange={(e) =>
                    setStageForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="Ex: Em Negociação"
                  className="h-9 w-full rounded-md bg-dd-surface-raised px-3 text-xs text-dd-on-surface placeholder:text-dd-muted border border-dd-border-subtle focus:border-dd-accent-green focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-dd-on-muted mb-1.5 block">
                  Cor
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={stageForm.color}
                    onChange={(e) =>
                      setStageForm((p) => ({ ...p, color: e.target.value }))
                    }
                    className="h-8 w-8 rounded cursor-pointer border-0 bg-transparent"
                  />
                  <span className="text-xs text-dd-on-muted font-mono">
                    {stageForm.color}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-[11px] font-medium text-dd-on-muted mb-1.5 block">
                  Status do lead (opcional)
                </label>
                <select
                  value={stageForm.lead_status}
                  onChange={(e) =>
                    setStageForm((p) => ({
                      ...p,
                      lead_status: e.target.value,
                    }))
                  }
                  className="h-9 w-full rounded-md bg-dd-surface-raised px-3 text-xs text-dd-on-surface border border-dd-border-subtle focus:border-dd-accent-green focus:outline-none transition-colors"
                >
                  <option value="">Nenhum (coluna visual)</option>
                  <option value="NOVO">NOVO</option>
                  <option value="EM_ATENDIMENTO">EM_ATENDIMENTO</option>
                  <option value="AGUARDANDO_RETORNO">AGUARDANDO_RETORNO</option>
                  <option value="CONVERTIDO">CONVERTIDO</option>
                  <option value="PERDIDO">PERDIDO</option>
                </select>
                <p className="text-[10px] text-dd-on-muted/60 mt-1">
                  Vincula a coluna a um status de lead para carregar leads
                  automaticamente
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-dd-border-subtle px-5 py-3">
              <button
                onClick={() => setShowStageModal(null)}
                className="h-8 rounded-md px-3 text-[11px] font-medium text-dd-on-muted hover:text-dd-on-surface transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={saveStage}
                disabled={stageLoading || !stageForm.name.trim()}
                className="flex h-8 items-center gap-1.5 rounded-md bg-dd-accent-green px-4 text-[11px] font-medium text-white hover:bg-dd-accent-green/90 disabled:opacity-40 transition-colors"
              >
                {stageLoading ? (
                  <div className="h-3 w-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : showStageModal.mode === "create" ? (
                  "Criar"
                ) : (
                  "Salvar"
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ==================== Card ==================== */

function Card({
  lead,
  stages,
  isDragged,
  onSelect,
  onDragStart,
  onDragEnd,
  onMove,
}: {
  lead: Lead;
  stages: KanbanStage[];
  isDragged: boolean;
  onSelect: (l: Lead) => void;
  onDragStart: (e: React.DragEvent, l: Lead) => void;
  onDragEnd: () => void;
  onMove: (id: string, s: LeadStatus) => void;
}) {
  // Only show stages that have a lead_status and are not the current status
  const movableStages = stages.filter(
    (s) => s.lead_status && s.lead_status !== lead.status,
  );

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
            {movableStages.length > 0 && (
              <>
                <DropdownMenuSeparator />
                {movableStages.map((s) => (
                  <DropdownMenuItem
                    key={s.id}
                    onClick={() =>
                      onMove(lead.id, s.lead_status! as LeadStatus)
                    }
                  >
                    <ArrowRight className="h-3.5 w-3.5 mr-2" />
                    {s.name}
                  </DropdownMenuItem>
                ))}
              </>
            )}
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
  stages,
  onClose,
  onMove,
}: {
  lead: Lead;
  stages: KanbanStage[];
  onClose: () => void;
  onMove: (id: string, s: LeadStatus) => void;
}) {
  const movableStages = stages.filter(
    (s) => s.lead_status && s.lead_status !== lead.status,
  );
  const currentStage = stages.find((s) => s.lead_status === lead.status);
  const statusColor = currentStage?.color || "#6B7280";

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
              className="inline-flex items-center rounded-sm px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
              style={{
                backgroundColor: hexToRgba(statusColor, 0.15),
                color: statusColor,
              }}
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
          {movableStages.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-dd-on-muted mb-2">
                Mover para
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {stages
                  .filter((s) => s.lead_status)
                  .map((s) => {
                    const isCurrent = s.lead_status === lead.status;
                    return (
                      <button
                        key={s.id}
                        onClick={() =>
                          !isCurrent &&
                          onMove(lead.id, s.lead_status! as LeadStatus)
                        }
                        disabled={isCurrent}
                        className={`flex items-center gap-2 rounded-md px-2.5 py-2 text-[11px] font-medium transition-all ${
                          isCurrent
                            ? "bg-dd-surface-raised text-dd-on-muted/40 cursor-not-allowed"
                            : "bg-dd-surface-raised text-dd-on-surface hover:bg-dd-surface-overlay border border-dd-border-subtle hover:border-dd-border"
                        }`}
                      >
                        <div
                          className="h-2 w-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: s.color || "#6B7280" }}
                        />
                        {s.name}
                      </button>
                    );
                  })}
              </div>
            </div>
          )}
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
