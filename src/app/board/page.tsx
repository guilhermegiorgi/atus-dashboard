"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api/client";
import { Lead, LeadStatus, LeadFormValues } from "@/types/leads";

const STATUS_COLUMNS: Array<{ id: LeadStatus; label: string; color: string }> =
  [
    { id: "NOVO", label: "Novos", color: "yellow" },
    { id: "EM_ATENDIMENTO", label: "Em Atendimento", color: "blue" },
    { id: "AGUARDANDO_RETORNO", label: "Aguardando Retorno", color: "orange" },
    { id: "CONVERTIDO", label: "Convertidos", color: "green" },
    { id: "PERDIDO", label: "Perdidos", color: "red" },
  ];

const STATUS_COLORS: Record<string, string> = {
  NOVO: "border-dd-accent-orange/30 bg-dd-accent-orange/10 text-dd-accent-orange",
  EM_ATENDIMENTO:
    "border-dd-accent-blue/30 bg-dd-accent-blue/10 text-dd-accent-blue",
  AGUARDANDO_RETORNO: "border-orange-500/30 bg-orange-500/10 text-orange-300",
  CONVERTIDO:
    "border-dd-accent-green/30 bg-dd-accent-green/10 text-dd-accent-green",
  PERDIDO: "border-dd-accent-red/30 bg-dd-accent-red/10 text-dd-accent-red",
};

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
  }).format(new Date(value));
}

interface ColumnProps {
  label: string;
  color: string;
  leads: Lead[];
  loading: boolean;
  selectedLeadId: string | null;
  onSelectLead: (lead: Lead) => void;
  onStatusChange: (leadId: string, newStatus: LeadStatus) => void;
}

function KanbanColumn({
  label,
  color,
  leads,
  loading,
  selectedLeadId,
  onSelectLead,
}: ColumnProps) {
  const colorClasses: Record<string, string> = {
    yellow: "border-t-dd-accent-orange",
    blue: "border-t-dd-accent-blue",
    orange: "border-t-dd-accent-orange",
    green: "border-t-dd-accent-green",
    red: "border-t-dd-accent-red",
  };

  return (
    <div className="flex min-w-[280px] max-w-[320px] flex-1 flex-col">
      <div
        className={`rounded-t-lg border-t-2 ${colorClasses[color]} border-x border-dd-border bg-dd-surface-raised px-4 py-3`}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-dd-on-primary">{label}</h3>
          <Badge
            variant="secondary"
            className="bg-dd-surface-overlay text-dd-on-surface"
          >
            {leads.length}
          </Badge>
        </div>
      </div>
      <div className="flex-1 space-y-2 border-x border-b border-dd-border bg-dd-primary p-2 min-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 rounded-full border-2 border-dd-border border-t-dd-on-muted animate-spin" />
          </div>
        ) : leads.length === 0 ? (
          <div className="py-8 text-center text-sm text-dd-on-muted">
            Nenhum lead
          </div>
        ) : (
          leads.map((lead) => (
            <button
              key={lead.id}
              type="button"
              onClick={() => onSelectLead(lead)}
              className={`w-full rounded-lg border p-3 text-left transition-all hover:border-dd-border ${
                selectedLeadId === lead.id
                  ? "border-dd-border bg-dd-surface-overlay"
                  : "border-dd-border-subtle bg-dd-surface-raised hover:bg-dd-surface-raised"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-dd-on-primary">
                    {lead.nome_completo || "Sem nome"}
                  </p>
                  <p className="text-xs text-dd-on-muted">{lead.telefone}</p>
                </div>
                {lead.em_follow_up && (
                  <Badge
                    variant="outline"
                    className="shrink-0 border-dd-accent-orange/20 bg-dd-accent-orange/10 text-dd-accent-orange text-[10px]"
                  >
                    FU
                  </Badge>
                )}
              </div>
              {lead.tipo_interesse && (
                <Badge
                  variant="outline"
                  className="mt-2 border-dd-border bg-dd-surface-raised text-[10px]"
                >
                  {lead.tipo_interesse}
                </Badge>
              )}
              <div className="mt-2 flex items-center justify-between text-xs text-dd-on-muted">
                <span>{lead.canal_origem || "-"}</span>
                <span>{formatDate(lead.created_at)}</span>
              </div>
              {lead.resumo_qualificacao && (
                <p className="mt-2 line-clamp-2 text-xs text-dd-on-muted">
                  {lead.resumo_qualificacao}
                </p>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
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

  const loadLeadsByStatus = useCallback(async (status: LeadStatus) => {
    setLoadingByStatus((prev) => ({ ...prev, [status]: true }));

    const result = await api.getPaginatedLeads({
      status: status,
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

  useEffect(() => {
    STATUS_COLUMNS.forEach((col) => {
      void loadLeadsByStatus(col.id);
    });
  }, [loadLeadsByStatus]);

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    const result = await api.updateLead(leadId, {
      nome_completo: "",
      telefone: "",
      email: "",
      tipo_interesse: "",
      status: newStatus,
    } as LeadFormValues);
    if (!result.error) {
      // Reload all columns
      STATUS_COLUMNS.forEach((col) => {
        void loadLeadsByStatus(col.id);
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium tracking-tight text-dd-on-primary">
            Pipeline
          </h1>
          <p className="text-xs text-dd-on-muted mt-0.5">
            Visualização Kanban dos leads por status
          </p>
        </div>
        <Input
          placeholder="Buscar lead..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-64 border-dd-border bg-dd-surface-raised placeholder:text-dd-on-muted"
        />
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4">
        {STATUS_COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            label={col.label}
            color={col.color}
            leads={
              searchTerm
                ? (leadsByStatus[col.id] || []).filter(
                    (lead) =>
                      lead.nome_completo
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      lead.telefone?.includes(searchTerm) ||
                      lead.email
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase()),
                  )
                : leadsByStatus[col.id] || []
            }
            loading={loadingByStatus[col.id] || false}
            selectedLeadId={selectedLead?.id || null}
            onSelectLead={setSelectedLead}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>

      {/* Detail Panel */}
      {selectedLead && (
        <div className="fixed inset-y-0 right-0 z-50 w-[min(420px,100vw)] border-l border-dd-border bg-dd-primary shadow-2xl animate-slide-in-right overflow-y-auto">
          <div className="flex items-center justify-between border-b border-dd-border px-5 py-4">
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-lg font-medium text-dd-on-primary">
                {selectedLead.nome_completo || "Lead sem nome"}
              </h2>
              <p className="text-xs text-dd-on-muted">
                {selectedLead.telefone}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedLead(null)}
              className="shrink-0 h-8 w-8 hover:bg-dd-surface-overlay hover:text-dd-on-primary"
            >
              ×
            </Button>
          </div>

          <div className="space-y-4 p-4">
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className={STATUS_COLORS[selectedLead.status]}
              >
                {selectedLead.status}
              </Badge>
              {selectedLead.em_follow_up && (
                <Badge
                  variant="outline"
                  className="border-dd-accent-orange/20 bg-dd-accent-orange/10 text-dd-accent-orange"
                >
                  Follow-up ativo
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-dd-on-muted">Email:</span>{" "}
                <span className="text-dd-on-primary">
                  {selectedLead.email || "-"}
                </span>
              </div>
              <div>
                <span className="text-dd-on-muted">Tipo:</span>{" "}
                <span className="text-dd-on-primary">
                  {selectedLead.tipo_interesse || "-"}
                </span>
              </div>
              <div>
                <span className="text-dd-on-muted">Canal:</span>{" "}
                <span className="text-dd-on-primary">
                  {selectedLead.canal_origem || "-"}
                </span>
              </div>
              <div>
                <span className="text-dd-on-muted">Criado:</span>{" "}
                <span className="text-dd-on-primary">
                  {formatDate(selectedLead.created_at)}
                </span>
              </div>
            </div>

            {selectedLead.resumo_qualificacao && (
              <div className="rounded-lg border border-dd-border bg-dd-surface-raised p-3">
                <h4 className="mb-1 text-xs font-medium uppercase text-dd-on-muted">
                  Qualificação
                </h4>
                <p className="text-sm text-dd-on-surface">
                  {selectedLead.resumo_qualificacao}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <h4 className="text-xs font-medium uppercase text-dd-on-muted">
                Alterar Status
              </h4>
              <div className="flex flex-wrap gap-2">
                {STATUS_COLUMNS.map((col) => (
                  <Button
                    key={col.id}
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange(selectedLead.id, col.id)}
                    disabled={selectedLead.status === col.id}
                    className={`border-dd-border bg-dd-surface-raised hover:bg-dd-surface-overlay hover:text-dd-on-primary ${
                      selectedLead.status === col.id ? "opacity-50" : ""
                    }`}
                  >
                    {col.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
