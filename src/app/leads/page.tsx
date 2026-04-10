"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Eye, Edit, Plus, Trash2, Users } from "lucide-react";
import { api } from "@/lib/api/client";
import { Lead, LeadFormValues, LeadListFilters } from "@/types/leads";
import { LeadDetailModal } from "@/components/leads/LeadDetailModal";
import { LeadFormModal } from "@/components/leads/LeadFormModal";
import { LeadFilters } from "@/components/leads/LeadFilters";
import {
  buildCanonicalLeadFilters,
  getOffsetForPage,
  searchWithinPage,
} from "@/lib/leads/query-state";

const PAGE_SIZE = 20;

function toneForHumanState(value?: string) {
  switch (value) {
    case "TRIAGE_HUMAN":
    case "HUMAN_ACTIVE":
      return "border-amber-500/20 bg-amber-500/10 text-amber-300";
    case "ASSIGNED_TO_BROKER":
      return "border-blue-500/20 bg-blue-500/10 text-blue-300";
    case "RETURNED_TO_BOT":
      return "border-green-500/20 bg-green-500/10 text-green-400";
    case "CLOSED":
      return "border-zinc-500/20 bg-zinc-500/10 text-zinc-300";
    default:
      return "border-border/50 bg-secondary/30 text-foreground";
  }
}

function toneForStatus(value?: string) {
  switch (value) {
    case "NOVO":
      return "border-yellow-500/20 bg-yellow-500/10 text-yellow-300";
    case "EM_ATENDIMENTO":
      return "border-blue-500/20 bg-blue-500/10 text-blue-300";
    case "CONVERTIDO":
      return "border-green-500/20 bg-green-500/10 text-green-400";
    case "PERDIDO":
      return "border-red-500/20 bg-red-500/10 text-red-300";
    default:
      return "border-primary/20 bg-primary/10 text-primary";
  }
}

export default function LeadsPage() {
  const [filters, setFilters] = useState<LeadListFilters & { search?: string }>({
    limit: PAGE_SIZE,
    offset: 0,
  });
  const [leads, setLeads] = useState<Lead[]>([]);
  const [meta, setMeta] = useState({ total: 0, limit: PAGE_SIZE, offset: 0 });
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

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
    []
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
    setFeedback(editingLead ? "Lead atualizado com sucesso." : "Lead criado com sucesso.");
  };

  const handleDeleteLead = async (lead: Lead) => {
    const confirmed = window.confirm(
      `Excluir o lead ${lead.nome_completo || lead.telefone}?`
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
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
          <p className="text-muted-foreground">Carregando leads...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive text-center">
          <p className="font-semibold">Erro ao carregar</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground">
            Lista paginada e multicanal alinhada ao contrato real do AtusBot
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Lead
        </Button>
      </div>

      {feedback && (
        <div className="rounded-xl border border-border/50 px-4 py-3 text-sm">
          {feedback}
        </div>
      )}

      <LeadFilters
        filters={filters}
        onFiltersChange={(next) =>
          setFilters({ ...next, limit: PAGE_SIZE, offset: 0 })
        }
        onClearFilters={() => setFilters({ limit: PAGE_SIZE, offset: 0 })}
      />

      <Card className="glass border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                {meta.total} leads
              </CardTitle>
              <CardDescription>
                Paginacao canonica por `meta.total`, `meta.limit` e `meta.offset`
              </CardDescription>
              <p className="mt-2 text-xs text-muted-foreground">
                A busca textual abaixo filtra apenas os leads ja carregados nesta pagina.
              </p>
            </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              Pagina {currentPage} de {totalPages}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {visibleLeads.length === 0 ? (
            <div className="text-center py-16">
              <Users className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-lg font-medium mb-2">Nenhum lead encontrado</p>
              <p className="text-muted-foreground mb-6">
                Nenhum lead encontrado para os filtros atuais
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border/50">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lead</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Fase</TableHead>
                    <TableHead>Origem</TableHead>
                    <TableHead>Tracking</TableHead>
                    <TableHead>Humano</TableHead>
                    <TableHead>Datas</TableHead>
                    <TableHead className="text-right">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleLeads.map((lead) => (
                    <TableRow key={lead.id} className="hover:bg-secondary/20 transition-colors">
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{lead.nome_completo || "Sem nome"}</p>
                          <p className="text-sm text-muted-foreground">{lead.telefone}</p>
                          {lead.email && (
                            <p className="text-xs text-muted-foreground">{lead.email}</p>
                          )}
                          {lead.tipo_interesse && (
                            <Badge
                              variant="outline"
                              className="border-border/50 bg-secondary/30 text-xs"
                            >
                              {lead.tipo_interesse}
                            </Badge>
                          )}
                          {lead.external_lead_id && (
                            <p className="text-xs text-muted-foreground">
                              external: {lead.external_lead_id}
                            </p>
                          )}
                          {lead.resumo_qualificacao && (
                            <p className="line-clamp-2 text-xs text-muted-foreground">
                              {lead.resumo_qualificacao}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={toneForStatus(lead.status)}>
                          {lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{lead.fase || "-"}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div>{lead.canal_origem || "-"}</div>
                          <div className="text-xs text-muted-foreground">
                            {lead.sistema_origem || "-"}
                          </div>
                          {lead.origem_detalhada && (
                            <div className="text-xs text-muted-foreground">
                              {lead.origem_detalhada}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {lead.tracked_codigo_ref || lead.campanha_origem || "-"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            click: {lead.link_click_id || "sem click id"}
                          </div>
                          {lead.campanha_origem && lead.tracked_codigo_ref !== lead.campanha_origem && (
                            <div className="text-xs text-muted-foreground">
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
                              lead.conversation_state || lead.intervention_type
                            )}
                          >
                            {lead.conversation_state || lead.intervention_type || "Sem humano"}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="border-border/50 bg-secondary/30"
                          >
                            {lead.em_follow_up ? "Follow-up ativo" : "Sem follow-up"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div>
                            Criado: {new Date(lead.created_at).toLocaleDateString("pt-BR")}
                          </div>
                          <div>
                            Atualizado: {new Date(lead.updated_at).toLocaleDateString("pt-BR")}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedLead(lead)}
                            className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditModal(lead)}
                            className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => void handleDeleteLead(lead)}
                            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
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
        <LeadDetailModal
          lead={selectedLead}
          open={Boolean(selectedLead)}
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
