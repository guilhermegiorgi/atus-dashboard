"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, AlertCircle, RefreshCw, Eye, MessageSquare, AlertTriangle } from "lucide-react";
import { api, Lead, LeadOperationalStatus } from "@/lib/api/client";
import { LeadCommunicationPanel } from "@/components/leads/LeadCommunicationPanel";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function FollowupQueuePage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [totalLeads, setTotalLeads] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 50;
  const [expiredOnly, setExpiredOnly] = useState(false);
  const [contaminatedOnly, setContaminatedOnly] = useState(false);

  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [opStatus, setOpStatus] = useState<LeadOperationalStatus | null>(null);
  const [loadingOpStatus, setLoadingOpStatus] = useState(false);

  const [isCommunicating, setIsCommunicating] = useState(false);

  const loadQueue = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const offset = (page - 1) * limit;
      
      const response = await api.getFollowupQueue({ limit, offset, expired_only: expiredOnly, only_contaminated: contaminatedOnly });
      
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
      setError("Erro ao carregar fila operacional");
    } finally {
      setLoading(false);
    }
  }, [page, limit, expiredOnly, contaminatedOnly]);

  useEffect(() => {
    void loadQueue();
  }, [loadQueue]);

  const handleOpenOpStatus = async (leadId: string) => {
    setSelectedLeadId(leadId);
    setOpStatus(null);
    setLoadingOpStatus(true);
    try {
      const response = await api.getOperationalStatus(leadId);
      if (response.data) {
        setOpStatus(response.data);
      }
    } catch {
      alert("Erro ao carregar status operacional.");
    } finally {
      setLoadingOpStatus(false);
    }
  };

  const handleReleaseFollowup = async (leadId: string) => {
    try {
      await api.releaseLeadFollowup(leadId);
      alert("Follow-up liberado com sucesso.");
      setSelectedLeadId(null);
      await loadQueue();
    } catch {
      alert("Falha ao liberar follow-up.");
    }
  };

  if (loading && leads.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
          <p className="text-muted-foreground">Carregando fila operacional...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Fila Operacional / Follow-up</h1>
        <p className="text-muted-foreground">
          Gestão de leads emperrados no funil que exigem intervenção manual do analista
        </p>
      </div>

      <div className="flex gap-4 border-b border-border/50 pb-4">
        <Button 
          variant={!expiredOnly && !contaminatedOnly ? "default" : "outline"}
          onClick={() => { setExpiredOnly(false); setContaminatedOnly(false); setPage(1); }}
        >
          Todos Operacionais
        </Button>
        <Button 
          variant={expiredOnly ? "default" : "outline"}
          onClick={() => { setExpiredOnly(true); setContaminatedOnly(false); setPage(1); }}
          className={expiredOnly ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30" : ""}
        >
          <Clock className="w-4 h-4 mr-2" />
          SLA Expirado
        </Button>
        <Button 
          variant={contaminatedOnly ? "default" : "outline"}
          onClick={() => { setContaminatedOnly(true); setExpiredOnly(false); setPage(1); }}
          className={contaminatedOnly ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" : ""}
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          Contaminados
        </Button>
        <Button variant="ghost" onClick={loadQueue}>
          <RefreshCw className="w-4 h-4 mr-2" /> Atualizar
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 text-destructive px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <Card className="glass border-border/50 animate-slide-up">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              Leads Pendentes de Operação
            </CardTitle>
            <Badge variant="secondary">
              {totalLeads} {totalLeads === 1 ? 'pendente' : 'pendentes'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Nenhum lead pendente de operação nesta fila.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/30 border-border/50">
                    <TableHead className="font-semibold">Nome</TableHead>
                    <TableHead className="font-semibold">Contato</TableHead>
                    <TableHead className="font-semibold">Último Contato</TableHead>
                    <TableHead className="text-right font-semibold">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead, index) => (
                    <TableRow 
                      key={lead.id}
                      className="hover:bg-secondary/30 transition-colors border-border/50 animate-slide-up"
                      style={{ animationDelay: `${index * 20}ms` }}
                    >
                      <TableCell className="font-medium">
                        {lead.nome_completo || 'Sem Nome'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {lead.telefone || '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {lead.updated_at ? new Date(lead.updated_at).toLocaleString("pt-BR") : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="bg-primary/10 text-primary hover:bg-primary hover:text-white"
                          onClick={() => handleOpenOpStatus(lead.id)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Detalhes da Operação
                        </Button>
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
                Página {page}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1 || loading}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={leads.length < limit || loading}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedLeadId && !isCommunicating} onOpenChange={(open) => !open && setSelectedLeadId(null)}>
        <DialogContent className="sm:max-w-[600px] border-border/50 glass">
          <DialogHeader>
            <DialogTitle>Status Operacional do Lead</DialogTitle>
            <DialogDescription>Dados processados pelo backend na fila de follow-up</DialogDescription>
          </DialogHeader>

          {loadingOpStatus ? (
            <div className="py-8 text-center text-muted-foreground">Carregando métricas operacionais...</div>
          ) : opStatus ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Fase</span>
                  <div className="font-medium">{opStatus.fase}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Status / Intervenção</span>
                  <div className="font-medium gap-2 flex items-center">
                    <Badge variant="outline">{opStatus.status}</Badge>
                    {opStatus.intervention_type !== "NONE" && <Badge variant="destructive">{opStatus.intervention_type}</Badge>}
                  </div>
                </div>
              </div>

              {opStatus.is_contaminated && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl p-3 text-sm flex gap-2">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                  <div>
                    <strong className="block">Este lead está contaminado.</strong>
                    Ele requer intervenção humana antes que o bot possa continuar ou o negócio deve ser marcado como perdido/desqualificado.
                  </div>
                </div>
              )}

              <div className="bg-secondary/30 rounded-xl p-3 border border-border/50">
                <div className="text-xs font-semibold uppercase tracking-wider mb-2 text-muted-foreground">Resumo de Qualificação</div>
                <div className="text-sm">{opStatus.qualification_summary || 'Nenhum resumo disponível.'}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary/30 rounded-xl p-3 border border-border/50">
                  <div className="text-xs font-semibold uppercase tracking-wider mb-2 text-muted-foreground">Campos Pendentes</div>
                  {opStatus.missing_fields && opStatus.missing_fields.length > 0 ? (
                    <ul className="text-sm list-disc pl-4 space-y-1">
                      {opStatus.missing_fields.map((field: string) => <li key={field}>{field}</li>)}
                    </ul>
                  ) : (
                    <div className="text-sm text-green-400">Todos os campos coletados.</div>
                  )}
                </div>
                
                <div className="bg-secondary/30 rounded-xl p-3 border border-border/50">
                  <div className="text-xs font-semibold uppercase tracking-wider mb-2 text-muted-foreground">Ação Recomendada</div>
                  <div className="text-sm font-medium text-blue-400">{opStatus.recommended_action || '-'}</div>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4 mt-4 border-t border-border/50">
                <Button variant="outline" onClick={() => handleReleaseFollowup(opStatus.lead_id)}>
                  Liberar do Follow-up
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setIsCommunicating(true)}>
                  <MessageSquare className="h-4 w-4 mr-2" /> Falar com Lead
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">Não foi possível carregar os detalhes.</div>
          )}
        </DialogContent>
      </Dialog>

      {selectedLeadId && (
        <LeadCommunicationPanel
          leadId={selectedLeadId}
          open={isCommunicating}
          onClose={() => {
            setIsCommunicating(false);
          }}
        />
      )}
    </div>
  );
}
