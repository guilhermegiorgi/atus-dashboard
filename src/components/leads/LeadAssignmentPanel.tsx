"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { User, CheckCircle, Users } from "lucide-react";
import { api } from "@/lib/api/client";
import type { Corretor, Lead } from "@/types/leads";

interface LeadAssignmentPanelProps {
  leadId: string;
  open: boolean;
  onClose: () => void;
  onAssignmentChange?: () => void;
}

export function LeadAssignmentPanel({ leadId, open, onClose, onAssignmentChange }: LeadAssignmentPanelProps) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [corretores, setCorretores] = useState<Corretor[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [selectedCorretorId, setSelectedCorretorId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [leadResponse, corretoresResponse] = await Promise.all([
        api.getLeadById(leadId),
        api.getCorretores()
      ]);

      if (leadResponse.data) {
        setLead(leadResponse.data as Lead);
        setSelectedCorretorId(leadResponse.data.corretor_id || "unassigned");
      }
      if (corretoresResponse.data) {
        setCorretores(corretoresResponse.data);
      }
    } catch (error) {
      console.error("Erro ao carregar atribuições:", error);
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
      const targetId = selectedCorretorId === "unassigned" ? null : selectedCorretorId;
      const response = await api.assignLead(leadId, targetId as any, notes);

      if (response.data) {
        await loadData();
        setNotes("");
        onAssignmentChange?.();
        onClose();
      }
    } catch (error) {
      console.error("Erro ao atribuir lead:", error);
    } finally {
      setAssigning(false);
    }
  };

  const currentCorretor = corretores.find(c => c.id === lead?.corretor_id);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto overflow-x-hidden border border-white/10 bg-zinc-950/95 p-0 text-zinc-100 backdrop-blur-xl">
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
                Gerenciar atendimento e atribuição para este lead
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500/30 border-t-blue-500" />
            </div>
          ) : (
            <>
              {/* Status Atual */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-zinc-400 mb-1">Corretor Atual</h4>
                  {currentCorretor ? (
                    <div className="flex items-center gap-2">
                       <User className="h-4 w-4 text-blue-400" />
                       <span className="text-lg font-semibold text-white">{currentCorretor.nome}</span>
                    </div>
                  ) : (
                    <span className="text-lg font-semibold text-zinc-500 italic">Não atribuído</span>
                  )}
                </div>
              </div>

              {/* Formulário de nova atribuição */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-200">Alterar Corretor</label>
                  <Select value={selectedCorretorId} onValueChange={(value) => setSelectedCorretorId(value || "unassigned")}>
                    <SelectTrigger className="border-white/10 bg-secondary/50 focus:border-blue-500/50">
                      <SelectValue placeholder="Selecione um corretor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">
                        <div className="flex items-center gap-2 text-zinc-500 italic">
                          <span>Nenhum (Remover atribuição)</span>
                        </div>
                      </SelectItem>
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
                  <label className="text-sm font-medium text-zinc-200">Observações da transferência (Opcional)</label>
                  <textarea
                    placeholder="Adicione notas sobre esta atribuição..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[80px] w-full rounded-lg border border-white/10 bg-secondary/50 px-3 py-2 text-sm text-zinc-200 focus:border-blue-500/50 focus:outline-none"
                  />
                </div>

                <Button
                  onClick={handleAssign}
                  disabled={assigning || !selectedCorretorId || selectedCorretorId === (lead?.corretor_id || "unassigned")}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-400 text-white shadow-[0_12px_30px_rgba(59,130,246,0.28)] hover:from-blue-400 hover:to-purple-300"
                >
                  {assigning ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                      Atualizando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Salvar Atribuição
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="border-t border-white/5 bg-white/[0.02] px-6 py-4">
          <Button variant="outline" onClick={onClose} className="border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white">
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}