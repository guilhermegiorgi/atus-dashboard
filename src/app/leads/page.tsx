"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Eye, Edit, Plus, Trash2, Users, Download, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api/client";
import { Lead, LeadFormValues, LeadListFilters } from "@/types/leads";
import { LeadDetailPanel } from "@/components/leads/LeadDetailPanel";
import { LeadFormModal } from "@/components/leads/LeadFormModal";
import { LeadFilters } from "@/components/leads/LeadFilters";
import {
  buildCanonicalLeadFilters,
  getOffsetForPage,
  searchWithinPage,
} from "@/lib/leads/query-state";
import { exportLeadsCsv } from "@/lib/export/csv";

const PAGE_SIZE = 20;

function toneForHumanState(value?: string) {
  switch (value) {
    case "TRIAGE_HUMAN":
    case "HUMAN_ACTIVE":
      return "border-dd-accent-orange/20 bg-dd-accent-orange/10 text-dd-accent-orange";
    case "ASSIGNED_TO_BROKER":
      return "border-dd-accent-blue/20 bg-dd-accent-blue/10 text-dd-accent-blue";
    case "RETURNED_TO_BOT":
      return "border-dd-accent-green/20 bg-dd-accent-green/10 text-dd-accent-green";
    case "CLOSED":
      return "border-dd-border-subtle bg-dd-surface-overlay/10 text-dd-on-surface";
    default:
      return "border-border/50 bg-secondary/30 text-foreground";
  }
}

function toneForStatus(value?: string) {
  switch (value) {
    case "NOVO":
      return "border-dd-accent-orange/20 bg-dd-accent-orange/10 text-dd-accent-orange";
    case "EM_ATENDIMENTO":
      return "border-dd-accent-blue/20 bg-dd-accent-blue/10 text-dd-accent-blue";
    case "CONVERTIDO":
      return "border-dd-accent-green/20 bg-dd-accent-green/10 text-dd-accent-green";
    case "PERDIDO":
      return "border-dd-accent-red/20 bg-dd-accent-red/10 text-dd-accent-red";
    default:
      return "border-primary/20 bg-primary/10 text-primary";
  }
}

export default function LeadsPage() {
  const [filters, setFilters] = useState<LeadListFilters & { search?: string }>(
    {
      limit: PAGE_SIZE,
      offset: 0,
    },
  );
  const [leads, setLeads] = useState<Lead[]>([]);
  const [meta, setMeta] = useState({ total: 0, limit: PAGE_SIZE, offset: 0 });
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const requestFingerprint = JSON.stringify({
    ...buildCanonicalLeadFilters(filters),
    limit: filters.limit ?? PAGE_SIZE,
    offset: filters.offset ?? 0,
  });

  const loadLeads = useCallback(
    async (currentFilters: LeadListFilters & { search?: string }) => {
      setLoading(true);
      setError(null);

      const response = await api.getPaginatedLeads({
        ...buildCanonicalLeadFilters(currentFilters),
        limit: currentFilters.limit ?? PAGE_SIZE,
        offset: currentFilters.offset ?? 0,
      });

      if (response.error || !response.data) {
        setError(response.error ?? "Erro ao carregar leads");
        setLoading(false);
        return;
      }

      setLeads(response.data.data);
      setMeta(response.data.meta);
      setLoading(false);
    },
    [],
  );

  useEffect(() => {
    void loadLeads(filters);
  }, [filters, loadLeads, requestFingerprint]);

  const visibleLeads = useMemo(() => {
    return searchWithinPage(leads, filters.search ?? "");
  }, [filters.search, leads]);

  const totalPages = Math.max(1, Math.ceil(meta.total / meta.limit));
  const currentPage = Math.floor(meta.offset / meta.limit) + 1;
  const currentFormValues: Partial<LeadFormValues> | undefined = editingLead
    ? {
        nome_completo: editingLead.nome_completo || "",
        telefone: editingLead.telefone || "",
        email: editingLead.email || "",
        status:
          editingLead.status === "NOVO" ||
          editingLead.status === "EM_ATENDIMENTO" ||
          editingLead.status === "CONVERTIDO" ||
          editingLead.status === "PERDIDO" ||
          editingLead.status === "AGUARDANDO_RETORNO"
            ? editingLead.status
            : "NOVO",
        localizacao: editingLead.localizacao || "",
        origem: editingLead.origem || "",
        tipo_interesse: editingLead.tipo_interesse || "",
        campanha_origem: editingLead.campanha_origem || "",
        estado_civil: editingLead.estado_civil || "",
        aniversario: editingLead.aniversario || undefined,
        renda_comprovada: editingLead.renda_comprovada || 0,
        renda_comprovada_conjuge: editingLead.renda_comprovada_conjuge || 0,
        fgts: editingLead.fgts || 0,
        fgts_conjuge: editingLead.fgts_conjuge || 0,
        tem_entrada: editingLead.tem_entrada || false,
        entrada: editingLead.entrada || 0,
        tem_carteira_assinada: editingLead.tem_carteira_assinada || false,
        observacoes: editingLead.observacoes || "",
      }
    : undefined;

  const openCreateModal = () => {
    setEditingLead(null);
    setIsFormOpen(true);
  };

  const openEditModal = (lead: Lead) => {
    setSelectedLead(null);
    setEditingLead(lead);
    setIsFormOpen(true);
  };

  const closeFormModal = () => {
    if (saving) {
      return;
    }

    setIsFormOpen(false);
    setEditingLead(null);
  };

  const handleFormSubmit = async (values: LeadFormValues) => {
    setSaving(true);
    setFeedback(null);

    const result = editingLead
      ? await api.updateLead(editingLead.id, values)
      : await api.createLead(values);

    if (result.error) {
      setFeedback(result.error);
      setSaving(false);
      return;
    }

    setIsFormOpen(false);
    setEditingLead(null);
    await loadLeads(filters);
    setSaving(false);
    setFeedback(
      editingLead ? "Lead atualizado com sucesso." : "Lead criado com sucesso.",
    );
  };

  const handleDeleteLead = async (lead: Lead) => {
    const confirmed = window.confirm(
      `Excluir o lead ${lead.nome_completo || lead.telefone}?`,
    );

    if (!confirmed) {
      return;
    }

    const result = await api.deleteLead(lead.id);

    if (result.error) {
      setFeedback(result.error);
      return;
    }

    await loadLeads(filters);
    setFeedback("Lead excluido com sucesso.");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-3 w-64" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="h-9 w-full" />
        <div className="rounded-sm border border-dd-border-subtle overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b border-dd-border-subtle px-4 py-3"
            >
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-20" />
              <div className="ml-auto flex gap-1">
                <Skeleton className="h-7 w-7" />
                <Skeleton className="h-7 w-7" />
                <Skeleton className="h-7 w-7" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-dd-accent-red text-center">
          <p className="text-sm font-medium">Erro ao carregar</p>
          <p className="text-xs text-dd-on-muted mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium tracking-tight text-dd-on-primary">
            Leads
          </h1>
          <p className="text-xs text-dd-on-muted mt-0.5">
            Lista paginada e multicanal alinhada ao contrato real do AtusBot
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() =>
              exportLeadsCsv(
                leads as unknown as Record<string, unknown>[],
                `leads-${currentPage}`,
              )
            }
            className="border-dd-border-subtle text-dd-on-muted hover:text-dd-on-surface"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            CSV
          </Button>
          <Button
            onClick={openCreateModal}
            className="bg-dd-on-primary text-dd-primary hover:bg-dd-on-primary/90"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Novo Lead
          </Button>
        </div>
      </div>

      {feedback && (
        <div className="rounded-sm border border-dd-border-subtle bg-dd-surface-raised px-3 py-2 text-xs text-dd-on-surface">
          {feedback}
        </div>
      )}

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-md border border-dd-accent-blue/20 bg-dd-accent-blue/5 px-4 py-2.5">
          <span className="text-sm font-medium text-dd-accent-blue">
            {selectedIds.size} selecionado{selectedIds.size > 1 ? "s" : ""}
          </span>
          <div className="flex-1" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const selected = leads.filter((l) => selectedIds.has(l.id));
              exportLeadsCsv(
                selected as unknown as Record<string, unknown>[],
                "leads-selecionados",
              );
            }}
            className="h-7 text-xs border-dd-border-subtle"
          >
            <Download className="h-3 w-3 mr-1" />
            Exportar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              if (!window.confirm(`Excluir ${selectedIds.size} leads?`)) return;
              for (const id of Array.from(selectedIds)) {
                await api.deleteLead(id);
              }
              setSelectedIds(new Set());
              await loadLeads(filters);
              setFeedback(`${selectedIds.size} leads excluídos.`);
            }}
            className="h-7 text-xs border-dd-accent-red/20 text-dd-accent-red hover:bg-dd-accent-red/10"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Excluir
          </Button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="flex h-6 w-6 items-center justify-center rounded text-dd-muted hover:text-dd-on-surface hover:bg-dd-surface-overlay"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <LeadFilters
        filters={filters}
        onFiltersChange={(next) =>
          setFilters({ ...next, limit: PAGE_SIZE, offset: 0 })
        }
        onClearFilters={() => setFilters({ limit: PAGE_SIZE, offset: 0 })}
      />

      <Card className="card-premium">
        <CardHeader className="border-b border-dd-border-subtle pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-dd-on-primary">
                <Users className="h-3.5 w-3.5 text-dd-on-muted" />
                {meta.total} leads
              </CardTitle>
              <CardDescription className="text-dd-on-muted text-[10px] mt-1">
                Paginacao por `meta.total`, `meta.limit` e `meta.offset`
              </CardDescription>
            </div>
            <Badge
              variant="secondary"
              className="bg-dd-surface-overlay text-dd-on-muted border-dd-border-subtle text-[10px]"
            >
              {currentPage}/{totalPages}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {visibleLeads.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-10 w-10 mx-auto text-dd-on-muted/40 mb-3" />
              <p className="text-sm text-dd-on-muted">Nenhum lead encontrado</p>
              <p className="text-xs text-dd-on-muted/60 mt-1">
                Nenhum lead encontrado para os filtros atuais
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-sm border border-dd-border-subtle">
              <Table>
                <TableHeader>
                  <TableRow className="border-dd-border-subtle hover:bg-transparent">
                    <TableHead className="w-8">
                      <input
                        type="checkbox"
                        checked={
                          visibleLeads.length > 0 &&
                          visibleLeads.every((l) => selectedIds.has(l.id))
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(
                              new Set(visibleLeads.map((l) => l.id)),
                            );
                          } else {
                            setSelectedIds(new Set());
                          }
                        }}
                        className="h-3.5 w-3.5 rounded border-dd-border-subtle accent-dd-accent-green"
                      />
                    </TableHead>
                    <TableHead className="text-[10px] uppercase tracking-widest text-dd-on-muted font-medium">
                      Lead
                    </TableHead>
                    <TableHead className="text-[10px] uppercase tracking-widest text-dd-on-muted font-medium">
                      Status
                    </TableHead>
                    <TableHead className="text-[10px] uppercase tracking-widest text-dd-on-muted font-medium">
                      Fase
                    </TableHead>
                    <TableHead className="text-[10px] uppercase tracking-widest text-dd-on-muted font-medium">
                      Origem
                    </TableHead>
                    <TableHead className="text-[10px] uppercase tracking-widest text-dd-on-muted font-medium">
                      Tracking
                    </TableHead>
                    <TableHead className="text-[10px] uppercase tracking-widest text-dd-on-muted font-medium">
                      Humano
                    </TableHead>
                    <TableHead className="text-[10px] uppercase tracking-widest text-dd-on-muted font-medium">
                      Datas
                    </TableHead>
                    <TableHead className="text-right text-[10px] uppercase tracking-widest text-dd-on-muted font-medium">
                      Ações
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleLeads.map((lead) => (
                    <TableRow
                      key={lead.id}
                      className="border-dd-border-subtle hover:bg-dd-surface-overlay/30 transition-colors"
                    >
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(lead.id)}
                          onChange={(e) => {
                            const next = new Set(selectedIds);
                            if (e.target.checked) next.add(lead.id);
                            else next.delete(lead.id);
                            setSelectedIds(next);
                          }}
                          className="h-3.5 w-3.5 rounded border-dd-border-subtle accent-dd-accent-green"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm text-dd-on-primary">
                            {lead.nome_completo || "Sem nome"}
                          </p>
                          <p className="text-xs text-dd-on-muted">
                            {lead.telefone}
                          </p>
                          {lead.email && (
                            <p className="text-xs text-dd-on-muted/70">
                              {lead.email}
                            </p>
                          )}
                          {lead.tipo_interesse && (
                            <Badge
                              variant="outline"
                              className="border-dd-border-subtle bg-dd-surface-overlay/30 text-[10px]"
                            >
                              {lead.tipo_interesse}
                            </Badge>
                          )}
                          {lead.external_lead_id && (
                            <p className="text-xs text-dd-on-muted/70">
                              external: {lead.external_lead_id}
                            </p>
                          )}
                          {lead.resumo_qualificacao && (
                            <p className="line-clamp-2 text-xs text-dd-on-muted/70">
                              {lead.resumo_qualificacao}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={toneForStatus(lead.status)}
                        >
                          {lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-dd-on-surface">
                        {lead.fase || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-dd-on-surface">
                            {lead.canal_origem || "-"}
                          </div>
                          <div className="text-xs text-dd-on-muted/70">
                            {lead.sistema_origem || "-"}
                          </div>
                          {lead.origem_detalhada && (
                            <div className="text-xs text-dd-on-muted/70">
                              {lead.origem_detalhada}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-dd-on-surface">
                            {lead.tracked_codigo_ref ||
                              lead.campanha_origem ||
                              "-"}
                          </div>
                          <div className="text-xs text-dd-on-muted/70">
                            click: {lead.link_click_id || "sem click id"}
                          </div>
                          {lead.campanha_origem &&
                            lead.tracked_codigo_ref !==
                              lead.campanha_origem && (
                              <div className="text-xs text-dd-on-muted/70">
                                campanha_origem: {lead.campanha_origem}
                              </div>
                            )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-2">
                          <Badge
                            variant="outline"
                            className={toneForHumanState(
                              lead.conversation_state || lead.intervention_type,
                            )}
                          >
                            {lead.conversation_state ||
                              lead.intervention_type ||
                              "Sem humano"}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="border-dd-border-subtle bg-dd-surface-overlay/30 text-[10px]"
                          >
                            {lead.em_follow_up
                              ? "Follow-up ativo"
                              : "Sem follow-up"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-xs text-dd-on-muted/70">
                          <div>
                            Criado:{" "}
                            {new Date(lead.created_at).toLocaleDateString(
                              "pt-BR",
                            )}
                          </div>
                          <div>
                            Atualizado:{" "}
                            {new Date(lead.updated_at).toLocaleDateString(
                              "pt-BR",
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedLead(lead)}
                            className="h-7 w-7 hover:bg-dd-surface-overlay hover:text-dd-on-surface"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditModal(lead)}
                            className="h-7 w-7 hover:bg-dd-surface-overlay hover:text-dd-on-surface"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => void handleDeleteLead(lead)}
                            className="h-7 w-7 hover:bg-dd-accent-red/10 hover:text-dd-accent-red"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <Pagination className="mt-6 justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  text="Anterior"
                  onClick={(event) => {
                    event.preventDefault();
                    if (currentPage === 1) {
                      return;
                    }

                    setFilters({
                      ...filters,
                      offset: getOffsetForPage(currentPage - 1, meta.limit),
                    });
                  }}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  {currentPage}
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  text="Proxima"
                  onClick={(event) => {
                    event.preventDefault();
                    if (currentPage >= totalPages) {
                      return;
                    }

                    setFilters({
                      ...filters,
                      offset: getOffsetForPage(currentPage + 1, meta.limit),
                    });
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardContent>
      </Card>

      {selectedLead && (
        <LeadDetailPanel
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onEdit={openEditModal}
        />
      )}

      <LeadFormModal
        open={isFormOpen}
        mode={editingLead ? "edit" : "create"}
        initialValues={currentFormValues}
        loading={saving}
        onClose={closeFormModal}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
