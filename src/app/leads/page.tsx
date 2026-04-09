"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Eye, Edit, Trash2, Users, MessageSquare, CalendarDays } from "lucide-react";
import { api, Lead } from "@/lib/api/client";
import { LeadDetailModal } from "@/components/leads/LeadDetailModal";
import { LeadFormModal } from "@/components/leads/LeadFormModal";
import { LeadFormValues, LeadFilterOptions } from "@/types/leads";
import { LeadFilters } from "@/components/leads/LeadFilters";
import { LeadCommunicationPanel } from "@/components/leads/LeadCommunicationPanel";
import { LeadAssignmentPanel } from "@/components/leads/LeadAssignmentPanel";
import { LeadFollowupPanel } from "@/components/leads/LeadFollowupPanel";
import { SLADashboard } from "@/components/leads/SLADashboard";
import { LeadFlowDashboard } from "@/components/leads/LeadFlowDashboard";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; className: string }> = {
  NOVO: { label: "Novo", variant: "default", className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  EM_ATENDIMENTO: { label: "Em Atendimento", variant: "secondary", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  CONVERTIDO: { label: "Convertido", variant: "outline", className: "bg-green-500/20 text-green-400 border-green-500/30" },
  PERDIDO: { label: "Perdido", variant: "destructive", className: "bg-red-500/20 text-red-400 border-red-500/30" },
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<LeadFilterOptions>({
    page: 1,
    limit: 50,
  });
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isCommunicationPanelOpen, setIsCommunicationPanelOpen] = useState(false);
  const [isAssignmentPanelOpen, setIsAssignmentPanelOpen] = useState(false);
  const [isFollowupPanelOpen, setIsFollowupPanelOpen] = useState(false);

  const loadLeads = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getLeads(filters);

      if (response.error) {
        setError(response.error);
        return;
      }

      const leadsData = Array.isArray(response.data) ? response.data : [];
      
      setLeads(leadsData);
      if (response.meta && typeof response.meta.total === 'number') {
        setTotalLeads(response.meta.total);
      } else {
        setTotalLeads(leadsData.length);
      }
    } catch {
      setError("Erro ao carregar leads");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void loadLeads();
  }, [loadLeads]);

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
    if (isSaving) {
      return;
    }

    setIsFormOpen(false);
    setEditingLead(null);
  };

  const upsertLeadOnList = (lead: Lead) => {
    setLeads((currentLeads: Lead[]) => {
      const otherLeads = currentLeads.filter((currentLead: Lead) => currentLead.id !== lead.id);
      return [lead, ...otherLeads];
    });
  };

  const handleFormSubmit = async (values: LeadFormValues) => {
    try {
      setIsSaving(true);
      setFeedback(null);

      if (editingLead) {
        const response = await api.updateLead(editingLead.id, values);

        if (response.error) {
          setFeedback({ type: "error", message: response.error });
          return;
        }

        const updatedLead = response.data;

        if (updatedLead) {
          upsertLeadOnList(updatedLead);
          setSelectedLead(updatedLead);
        } else {
          await loadLeads();
        }

        setFeedback({ type: "success", message: "Lead atualizado com sucesso." });
      } else {
        const response = await api.createLead(values);

        if (response.error) {
          setFeedback({ type: "error", message: response.error });
          return;
        }

        if (response.data) {
          upsertLeadOnList(response.data);
        } else {
          await loadLeads();
        }

        setFeedback({ type: "success", message: "Lead criado com sucesso." });
      }

      setIsFormOpen(false);
      setEditingLead(null);
    } catch {
      setFeedback({ type: "error", message: "Não foi possível salvar o lead." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteLead = async (lead: Lead) => {
    const confirmed = window.confirm(`Deseja excluir o lead "${lead.nome_completo || lead.telefone}"?`);

    if (!confirmed) {
      return;
    }

    try {
      setFeedback(null);
      const response = await api.deleteLead(lead.id);

      if (response.error) {
        setFeedback({ type: "error", message: response.error });
        return;
      }

      setLeads((currentLeads: Lead[]) =>
        currentLeads.filter((currentLead: Lead) => currentLead.id !== lead.id)
      );

      if (selectedLead?.id === lead.id) {
        setSelectedLead(null);
      }

      if (editingLead?.id === lead.id) {
        setEditingLead(null);
      }

      setFeedback({ type: "success", message: "Lead excluído com sucesso." });
    } catch {
      setFeedback({ type: "error", message: "Não foi possível excluir o lead." });
    }
  };

  const currentFormValues: Partial<LeadFormValues> | undefined = editingLead
    ? {
        nome_completo: editingLead.nome_completo || "",
        telefone: editingLead.telefone || "",
        email: editingLead.email || "",
        status: (editingLead.status as LeadFormValues["status"]) || "NOVO",
        localizacao: editingLead.localizacao || "",
        origem: editingLead.origem || "",
        tipo_interesse: editingLead.tipo_interesse || "",
        renda_comprovada: editingLead.renda_comprovada || 0,
        observacoes: editingLead.observacoes || "",
      }
    : undefined;

  const openCommunicationPanel = (lead: Lead) => {
    setSelectedLead(lead);
    setIsCommunicationPanelOpen(true);
  };

  const closeCommunicationPanel = () => {
    setIsCommunicationPanelOpen(false);
  };

  const openAssignmentPanel = (lead: Lead) => {
    setSelectedLead(lead);
    setIsAssignmentPanelOpen(true);
  };

  const closeAssignmentPanel = () => {
    setIsAssignmentPanelOpen(false);
  };

  const handleAssignmentChange = () => {
    loadLeads();
  };

  const openFollowupPanel = (lead: Lead) => {
    setSelectedLead(lead);
    setIsFollowupPanelOpen(true);
  };

  const closeFollowupPanel = () => {
    setIsFollowupPanelOpen(false);
  };

  const handleFollowupChange = () => {
    loadLeads();
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
            Gerencie e acompanhe todos os seus leads
          </p>
        </div>
        <Button className="glow-primary" onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Lead
        </Button>
      </div>

      {feedback && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            feedback.type === "success"
              ? "border-green-500/30 bg-green-500/10 text-green-300"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          {feedback.message}
        </div>
      )}

      <LeadFilters
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={() => setFilters({})}
      />

      {/* Dashboard de Métricas */}
      <div className="grid gap-6 lg:grid-cols-2">
        <LeadFlowDashboard />
        <SLADashboard />
      </div>

      <Card className="glass border-border/50 animate-slide-up stagger-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                {leads.length} {leads.length === 1 ? "lead" : "leads"}
              </CardTitle>
              <CardDescription>
                Lista completa de leads no sistema
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Nenhum lead encontrado</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Tente ajustar seus filtros de busca
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/30 border-border/50">
                    <TableHead className="font-semibold">Nome</TableHead>
                    <TableHead className="font-semibold">Telefone</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Origem e Referência</TableHead>
                    <TableHead className="font-semibold">Status / Fila</TableHead>
                    <TableHead className="text-right font-semibold">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead: Lead, index: number) => (
                    <TableRow 
                      key={lead.id} 
                      className="hover:bg-secondary/30 transition-colors border-border/50 animate-slide-up"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-orange-600/20 flex items-center justify-center text-primary text-sm font-semibold">
                            {(lead.nome_completo || 'SN').charAt(0).toUpperCase()}
                          </div>
                          {lead.nome_completo || 'Sem nome'}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {lead.telefone || '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {lead.email || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-medium">{lead.origem || '-'}</span>
                          {(lead.codigo_ref || lead.link_click_id) && (
                            <span className="text-xs text-muted-foreground flex gap-1 items-center">
                              {lead.codigo_ref && <Badge variant="outline" className="text-[10px] h-4 leading-none px-1 py-0">{lead.codigo_ref}</Badge>}
                              {lead.link_click_id && <span className="truncate max-w-[80px]" title={lead.link_click_id}>ID: {lead.link_click_id}</span>}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col items-start gap-1">
                          <Badge 
                            variant={statusConfig[lead.status]?.variant || "default"}
                            className={statusConfig[lead.status]?.className}
                          >
                            {statusConfig[lead.status]?.label || lead.status}
                          </Badge>
                          {lead.intervention_type && lead.intervention_type !== "NONE" && (
                            <Badge variant="secondary" className="bg-purple-500/10 text-purple-400 border-purple-500/30 text-[10px] h-4 leading-none px-1 py-0 shadow-sm">
                              {lead.intervention_type}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" onClick={() => setSelectedLead(lead)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-green-500/10 hover:text-green-400"
                            onClick={() => openCommunicationPanel(lead)}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-purple-500/10 hover:text-purple-400"
                            onClick={() => openFollowupPanel(lead)}
                          >
                            <CalendarDays className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-blue-500/10 hover:text-blue-400"
                            onClick={() => openAssignmentPanel(lead)}
                          >
                            <Users className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                            onClick={() => openEditModal(lead)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleDeleteLead(lead)}
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
          
          {totalLeads > 0 && (
            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <div className="text-sm text-muted-foreground">
                Exibindo <span className="font-medium text-foreground">{leads.length}</span> de <span className="font-medium text-foreground">{totalLeads}</span> leads totais
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters(f => ({ ...f, page: Math.max(1, (f.page || 1) - 1) }))}
                  disabled={(filters.page || 1) <= 1 || loading}
                >
                  Anterior
                </Button>
                <div className="text-sm font-medium px-2 py-1 bg-secondary/30 rounded-md">
                  Página {filters.page || 1}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters(f => ({ ...f, page: (f.page || 1) + 1 }))}
                  disabled={leads.length < (filters.limit || 50) || loading}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          open={
            !!selectedLead &&
            !isCommunicationPanelOpen &&
            !isAssignmentPanelOpen &&
            !isFollowupPanelOpen
          }
          onClose={() => setSelectedLead(null)}
          onEdit={openEditModal}
          onOpenCommunication={openCommunicationPanel}
        />
      )}

      <LeadFormModal
        open={isFormOpen}
        mode={editingLead ? "edit" : "create"}
        initialValues={currentFormValues}
        loading={isSaving}
        onClose={closeFormModal}
        onSubmit={handleFormSubmit}
      />

      {selectedLead && (
        <LeadCommunicationPanel
          leadId={selectedLead.id}
          open={isCommunicationPanelOpen}
          onClose={closeCommunicationPanel}
        />
      )}

      {selectedLead && (
        <LeadAssignmentPanel
          leadId={selectedLead.id}
          open={isAssignmentPanelOpen}
          onClose={closeAssignmentPanel}
          onAssignmentChange={handleAssignmentChange}
        />
      )}

      {selectedLead && (
        <LeadFollowupPanel
          leadId={selectedLead.id}
          open={isFollowupPanelOpen}
          onClose={closeFollowupPanel}
          onFollowupChange={handleFollowupChange}
        />
      )}
    </div>
  );
}
