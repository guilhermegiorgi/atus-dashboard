"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { User, Calendar, CheckCircle, Users, RefreshCw } from "lucide-react";
import { api } from "@/lib/api/client";
import type { LeadAssignment, Corretor } from "@/types/leads";

interface LeadAssignmentPanelProps {
  leadId: string;
  open: boolean;
  onClose: () => void;
  onAssignmentChange?: () => void;
}

export function LeadAssignmentPanel({ leadId, open, onClose, onAssignmentChange }: LeadAssignmentPanelProps) {
  const [assignments, setAssignments] = useState<LeadAssignment[]>([]);
  const [corretores, setCorretores] = useState<Corretor[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [selectedCorretorId, setSelectedCorretorId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [assignmentsResponse, corretoresResponse] = await Promise.all([
        api.getLeadAssignments(leadId),
        api.getCorretores()
      ]);

      if (assignmentsResponse.data) {
        setAssignments(assignmentsResponse.data);
      }
      if (corretoresResponse.data) {
        setCorretores(corretoresResponse.data);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open, leadId]);

  const handleAssign = async () => {
    if (!selectedCorretorId) return;

    try {
      setAssigning(true);
      const response = await api.assignLead(leadId, selectedCorretorId, notes);

      if (response.data) {
        await loadData();
        setSelectedCorretorId("");
        setNotes("");
        onAssignmentChange?.();
      }
    } catch (error) {
      console.error("Erro ao atribuir lead:", error);
    } finally {
      setAssigning(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'completed':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'transferred':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'completed':
        return 'Concluído';
      case 'transferred':
        return 'Transferido';
      default:
        return status;
    }
  };

  const activeAssignment = assignments.find(a => a.status === 'active');

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden border border-white/10 bg-zinc-950/95 p-0 text-zinc-100 backdrop-blur-xl">
        <DialogHeader className="border-b border-white/5 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-400">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-white">
                Atribuição de Leads
              </DialogTitle>
              <DialogDescription className="text-zinc-400">
                Gerenciar atribuições de corretores para este lead
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid h-[60vh] grid-cols-1 md:grid-cols-2">
          {/* Lista de atribuições */}
          <div className="flex flex-col border-r border-white/10">
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
                    <p className="text-sm text-zinc-400">Carregando atribuições...</p>
                  </div>
                </div>
              ) : assignments.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <Users className="mb-4 h-12 w-12 text-zinc-500" />
                  <p className="text-zinc-400">Nenhuma atribuição registrada</p>
                  <p className="text-sm text-zinc-500">As atribuições aparecerão aqui</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {assignments.map((assignment) => {
                    const corretor = corretores.find(c => c.id === assignment.corretor_id);

                    return (
                      <div
                        key={assignment.id}
                        className={`rounded-xl border border-white/10 p-4 transition-all hover:border-blue-500/30 ${
                          assignment.status === 'active' ? 'bg-blue-500/10 border-blue-500/30' : 'bg-white/5'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${getStatusColor(assignment.status)}`}>
                            <User className="h-4 w-4" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-zinc-200">
                                {corretor?.nome || "Corretor não encontrado"}
                              </span>
                              <Badge variant="outline" className={`text-xs ${getStatusColor(assignment.status)}`}>
                                {getStatusLabel(assignment.status)}
                              </Badge>
                            </div>
                            {assignment.notes && (
                              <p className="text-sm text-zinc-300 leading-relaxed">
                                {assignment.notes}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-zinc-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDateTime(assignment.assigned_at)}
                              </span>
                              {assignment.assigned_by && (
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  Por: {assignment.assigned_by}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Formulário de nova atribuição */}
          <div className="flex flex-col p-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white mb-2">Nova Atribuição</h3>
              <p className="text-sm text-zinc-400">Atribua este lead a um corretor</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-200">Corretor</label>
                <Select value={selectedCorretorId} onValueChange={(value) => setSelectedCorretorId(value || "")}>
                  <SelectTrigger className="border-white/10 bg-secondary/50 focus:border-blue-500/50">
                    <SelectValue placeholder="Selecione um corretor" />
                  </SelectTrigger>
                  <SelectContent>
                    {corretores.map((corretor) => (
                      <SelectItem key={corretor.id} value={corretor.id}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{corretor.nome}</span>
                          <span className="text-xs text-zinc-500">({corretor.especialidade})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-200">Observações (opcional)</label>
                <textarea
                  placeholder="Adicione notas sobre esta atribuição..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[80px] w-full rounded-lg border border-white/10 bg-secondary/50 px-3 py-2 text-sm text-zinc-200 focus:border-blue-500/50 focus:outline-none"
                />
              </div>

              <Button
                onClick={handleAssign}
                disabled={assigning || !selectedCorretorId}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-400 text-white shadow-[0_12px_30px_rgba(59,130,246,0.28)] hover:from-blue-400 hover:to-purple-300"
              >
                {assigning ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Atribuindo...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Atribuir Lead
                  </>
                )}
              </Button>

              {activeAssignment && (
                <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
                  <div className="flex items-center gap-2 text-sm text-yellow-400">
                    <RefreshCw className="h-4 w-4" />
                    <span>Lead atualmente atribuído a: {corretores.find(c => c.id === activeAssignment.corretor_id)?.nome}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-white/5 bg-white/[0.02] px-6 py-4">
          <Button variant="outline" onClick={onClose} className="border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white">
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}