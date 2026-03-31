"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Clock, CheckCircle, X, Plus } from "lucide-react";
import { api } from "@/lib/api/client";
import type { LeadFollowup } from "@/types/leads";

interface LeadFollowupPanelProps {
  leadId: string;
  open: boolean;
  onClose: () => void;
  onFollowupChange?: () => void;
}

const followupTypes = [
  { value: "email", label: "Email", color: "text-blue-400" },
  { value: "whatsapp", label: "WhatsApp", color: "text-green-400" },
  { value: "meeting", label: "Reunião", color: "text-orange-400" },
] as const;

const typeLabels: Record<string, string> = {
  email: "Email",
  whatsapp: "WhatsApp",
  meeting: "Reunião",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  completed: "bg-green-500/20 text-green-400 border-green-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
};

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  completed: "Concluído",
  cancelled: "Cancelado",
};

export function LeadFollowupPanel({ leadId, open, onClose, onFollowupChange }: LeadFollowupPanelProps) {
  const [followups, setFollowups] = useState<LeadFollowup[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedType, setSelectedType] = useState<"email" | "whatsapp" | "meeting">("email");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [notes, setNotes] = useState("");

  const loadFollowups = async () => {
    try {
      setLoading(true);
      const response = await api.getLeadFollowups(leadId);
      if (response.data) {
        setFollowups(response.data);
      }
    } catch (error) {
      console.error("Erro ao carregar follow-ups:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadFollowups();
    }
  }, [open, leadId]);

  const handleCreate = async () => {
    if (!scheduledDate || !scheduledTime) return;

    try {
      setCreating(true);
      
      const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();

      const data = {
        lead_id: leadId,
        type: selectedType,
        scheduled_at: scheduledAt,
        notes: notes.trim(),
        status: "pending" as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const response = await api.createLeadFollowup(leadId, data);
      
      if (response.data) {
        setFollowups([...followups, response.data]);
        setScheduledDate("");
        setScheduledTime("");
        setNotes("");
        onFollowupChange?.();
      }
    } catch (error) {
      console.error("Erro ao criar follow-up:", error);
    } finally {
      setCreating(false);
    }
  };

  const handleComplete = async (followup: LeadFollowup) => {
    try {
      const updatedFollowup = {
        ...followup,
        status: "completed" as const,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Atualizar localmente primeiro
      setFollowups(followups.map(f => f.id === followup.id ? updatedFollowup : f));
      onFollowupChange?.();
    } catch (error) {
      console.error("Erro ao completar follow-up:", error);
    }
  };

  const handleCancel = async (followup: LeadFollowup) => {
    try {
      const updatedFollowup = {
        ...followup,
        status: "cancelled" as const,
        updated_at: new Date().toISOString(),
      };

      setFollowups(followups.map(f => f.id === followup.id ? updatedFollowup : f));
      onFollowupChange?.();
    } catch (error) {
      console.error("Erro ao cancelar follow-up:", error);
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

  const isPastScheduled = (scheduledAt: string) => {
    return new Date(scheduledAt) < new Date();
  };

  const pendingFollowups = followups.filter(f => f.status === 'pending');
  const completedFollowups = followups.filter(f => f.status === 'completed');

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden border border-white/10 bg-zinc-950/95 p-0 text-zinc-100 backdrop-blur-xl">
        <DialogHeader className="border-b border-white/5 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-400">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-white">
                Follow-ups do Lead
              </DialogTitle>
              <DialogDescription className="text-zinc-400">
                Gerencie o agendamento e acompanhamento de follow-ups
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid h-[60vh] grid-cols-1 md:grid-cols-2">
          {/* Lista de follow-ups */}
          <div className="flex flex-col border-r border-white/10">
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
                    <p className="text-sm text-zinc-400">Carregando follow-ups...</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Follow-ups Pendentes */}
                  {pendingFollowups.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-yellow-400" />
                        Pendentes ({pendingFollowups.length})
                      </h3>
                      {pendingFollowups.map((followup) => (
                        <div
                          key={followup.id}
                          className={`rounded-xl border border-white/10 p-4 transition-all ${
                            isPastScheduled(followup.scheduled_at) 
                              ? 'border-red-500/50 bg-red-500/10' 
                              : 'bg-white/5 hover:border-purple-500/30'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-medium ${followupTypes.find(t => t.value === followup.type)?.color}`}>
                                  {typeLabels[followup.type]}
                                </span>
                                <Badge variant="outline" className={statusColors[followup.status]}>
                                  {statusLabels[followup.status]}
                                </Badge>
                              </div>
                              {followup.notes && (
                                <p className="text-sm text-zinc-300 leading-relaxed">
                                  {followup.notes}
                                </p>
                              )}
                              <div className="flex items-center gap-2 text-xs text-zinc-500">
                                <Calendar className="h-3 w-3" />
                                <span className={isPastScheduled(followup.scheduled_at) ? 'text-red-400' : ''}>
                                  {formatDateTime(followup.scheduled_at)}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 hover:bg-green-500/10 hover:text-green-400"
                                onClick={() => handleComplete(followup)}
                              >
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 hover:bg-red-500/10 hover:text-red-400"
                                onClick={() => handleCancel(followup)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Follow-ups Concluídos */}
                  {completedFollowups.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        Concluídos ({completedFollowups.length})
                      </h3>
                      {completedFollowups.map((followup) => (
                        <div
                          key={followup.id}
                          className="rounded-xl border border-white/10 bg-white/5 p-4 opacity-75"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-medium ${followupTypes.find(t => t.value === followup.type)?.color}`}>
                                  {typeLabels[followup.type]}
                                </span>
                                <Badge variant="outline" className={statusColors[followup.status]}>
                                  {statusLabels[followup.status]}
                                </Badge>
                              </div>
                              {followup.notes && (
                                <p className="text-sm text-zinc-300 leading-relaxed">
                                  {followup.notes}
                                </p>
                              )}
                              <div className="flex items-center gap-2 text-xs text-zinc-500">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDateTime(followup.scheduled_at)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Nenhum follow-up */}
                  {followups.length === 0 && (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                      <Calendar className="mb-4 h-12 w-12 text-zinc-500" />
                      <p className="text-zinc-400">Nenhum follow-up agendado</p>
                      <p className="text-sm text-zinc-500">Crie seu primeiro follow-up</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Formulário de novo follow-up */}
          <div className="flex flex-col p-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white mb-2">Novo Follow-up</h3>
              <p className="text-sm text-zinc-400">Agende um novo follow-up com o lead</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-200">Tipo de follow-up</label>
                <Select value={selectedType} onValueChange={(value) => setSelectedType(value as typeof selectedType)}>
                  <SelectTrigger className="border-white/10 bg-secondary/50 focus:border-purple-500/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {followupTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <span className={type.color}>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-200">Data</label>
                  <Input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="border-white/10 bg-secondary/50 focus:border-purple-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-200">Hora</label>
                  <Input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="border-white/10 bg-secondary/50 focus:border-purple-500/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-200">Observações</label>
                <textarea
                  placeholder="Adicione notas sobre este follow-up..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[120px] w-full rounded-lg border border-white/10 bg-secondary/50 px-3 py-2 text-sm text-zinc-200 focus:border-purple-500/50 focus:outline-none"
                />
              </div>

              <Button
                onClick={handleCreate}
                disabled={creating || !scheduledDate || !scheduledTime}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-400 text-white shadow-[0_12px_30px_rgba(147,51,234,0.28)] hover:from-purple-400 hover:to-blue-300"
              >
                {creating ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Agendando...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Agendar Follow-up
                  </>
                )}
              </Button>
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