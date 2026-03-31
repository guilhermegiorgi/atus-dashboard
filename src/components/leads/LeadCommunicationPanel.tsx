"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Mail, MessageSquare, Phone, Send, Clock, User, CheckCircle } from "lucide-react";
import { api } from "@/lib/api/client";
import type { LeadCommunication } from "@/types/leads";

interface LeadCommunicationPanelProps {
  leadId: string;
  open: boolean;
  onClose: () => void;
}

const communicationTypes = [
  { value: "email", label: "Email", icon: Mail, color: "text-blue-400" },
  { value: "whatsapp", label: "WhatsApp", icon: MessageSquare, color: "text-green-400" },
  { value: "sms", label: "SMS", icon: Phone, color: "text-purple-400" },
  { value: "meeting", label: "Reunião", icon: Calendar, color: "text-orange-400" },
  { value: "note", label: "Nota", icon: CheckCircle, color: "text-gray-400" },
] as const;

const typeLabels: Record<string, string> = {
  email: "Email",
  whatsapp: "WhatsApp",
  sms: "SMS",
  meeting: "Reunião",
  note: "Nota",
};

const directionLabels: Record<string, string> = {
  inbound: "Entrada",
  outbound: "Saída",
};

const directionColors: Record<string, string> = {
  inbound: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  outbound: "bg-green-500/20 text-green-400 border-green-500/30",
};

export function LeadCommunicationPanel({ leadId, open, onClose }: LeadCommunicationPanelProps) {
  const [communications, setCommunications] = useState<LeadCommunication[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedType, setSelectedType] = useState<"email" | "whatsapp" | "sms" | "meeting" | "note">("email");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [isScheduled, setIsScheduled] = useState(false);

  const loadCommunications = async () => {
    try {
      setLoading(true);
      const response = await api.getLeadCommunications(leadId);
      if (response.data) {
        setCommunications(response.data);
      }
    } catch (error) {
      console.error("Erro ao carregar comunicações:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadCommunications();
    }
  }, [open, leadId]);

  const handleSend = async () => {
    if (!content.trim()) return;

    try {
      setSending(true);
      
      const scheduledAt = isScheduled && scheduledDate && scheduledTime 
        ? new Date(`${scheduledDate}T${scheduledTime}`).toISOString()
        : undefined;

      const data = {
        lead_id: leadId,
        type: selectedType,
        direction: "outbound" as const,
        subject: subject || undefined,
        content: content.trim(),
        scheduled_at: scheduledAt,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const response = await api.createLeadCommunication(leadId, data);
      
      if (response.data) {
        setCommunications([response.data, ...communications]);
        setContent("");
        setSubject("");
        setScheduledDate("");
        setScheduledTime("");
        setIsScheduled(false);
      }
    } catch (error) {
      console.error("Erro ao enviar comunicação:", error);
    } finally {
      setSending(false);
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

  const getCommunicationIcon = (type: string) => {
    const commType = communicationTypes.find(t => t.value === type);
    return commType?.icon || MessageSquare;
  };

  const getCommunicationColor = (type: string) => {
    const commType = communicationTypes.find(t => t.value === type);
    return commType?.color || "text-gray-400";
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden border border-white/10 bg-zinc-950/95 p-0 text-zinc-100 backdrop-blur-xl">
        <DialogHeader className="border-b border-white/5 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-400">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-white">
                Comunicações do Lead
              </DialogTitle>
              <DialogDescription className="text-zinc-400">
                Histórico completo de interações e comunicações
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid h-[60vh] grid-cols-1 md:grid-cols-2">
          {/* Lista de comunicações */}
          <div className="flex flex-col border-r border-white/10">
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
                    <p className="text-sm text-zinc-400">Carregando comunicações...</p>
                  </div>
                </div>
              ) : communications.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <MessageSquare className="mb-4 h-12 w-12 text-zinc-500" />
                  <p className="text-zinc-400">Nenhuma comunicação registrada</p>
                  <p className="text-sm text-zinc-500">As interações aparecerão aqui</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {communications.map((comm) => {
                    const Icon = getCommunicationIcon(comm.type);
                    const colorClass = getCommunicationColor(comm.type);
                    const directionClass = directionColors[comm.direction];

                    return (
                      <div
                        key={comm.id}
                        className="rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-orange-500/30"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${colorClass.replace('text', 'bg').replace('400', '500/20')}`}>
                            <Icon className={`h-4 w-4 ${colorClass}`} />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-medium ${colorClass}`}>
                                {typeLabels[comm.type]}
                              </span>
                              <Badge variant="outline" className={`text-xs ${directionClass}`}>
                                {directionLabels[comm.direction]}
                              </Badge>
                              {comm.scheduled_at && !comm.completed_at && (
                                <Badge variant="outline" className="text-xs border-yellow-500/30 bg-yellow-500/20 text-yellow-400">
                                  <Clock className="mr-1 h-3 w-3" />
                                  Agendado
                                </Badge>
                              )}
                            </div>
                            {comm.subject && (
                              <p className="text-sm font-medium text-zinc-200">{comm.subject}</p>
                            )}
                            <p className="text-sm text-zinc-300 leading-relaxed">
                              {comm.content}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-zinc-500">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {comm.created_by || "Sistema"}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDateTime(comm.created_at)}
                              </span>
                              {comm.scheduled_at && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  Agendado: {formatDateTime(comm.scheduled_at)}
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

          {/* Formulário de nova comunicação */}
          <div className="flex flex-col p-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white mb-2">Nova Comunicação</h3>
              <p className="text-sm text-zinc-400">Registre uma nova interação com o lead</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-200">Tipo de comunicação</label>
                <Select value={selectedType} onValueChange={(value) => setSelectedType(value as typeof selectedType)}>
                  <SelectTrigger className="border-white/10 bg-secondary/50 focus:border-orange-500/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {communicationTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <Icon className={`h-4 w-4 ${type.color}`} />
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {selectedType === "email" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-200">Assunto</label>
                  <Input
                    placeholder="Assunto do email..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="border-white/10 bg-secondary/50 focus:border-orange-500/50"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-200">Mensagem</label>
                <Textarea
                  placeholder={`Digite sua mensagem ${typeLabels[selectedType].toLowerCase()}...`}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[120px] border-white/10 bg-secondary/50 focus:border-orange-500/50"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="schedule"
                    checked={isScheduled}
                    onChange={(e) => setIsScheduled(e.target.checked)}
                    className="rounded border-white/10 bg-secondary/50"
                  />
                  <label htmlFor="schedule" className="text-sm text-zinc-300">
                    Agendar para mais tarde
                  </label>
                </div>

                {isScheduled && (
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="border-white/10 bg-secondary/50 focus:border-orange-500/50"
                    />
                    <Input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="border-white/10 bg-secondary/50 focus:border-orange-500/50"
                    />
                  </div>
                )}
              </div>

              <Button
                onClick={handleSend}
                disabled={sending || !content.trim() || (isScheduled && (!scheduledDate || !scheduledTime))}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-[0_12px_30px_rgba(249,115,22,0.28)] hover:from-orange-400 hover:to-amber-300"
              >
                {sending ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    {isScheduled ? "Agendar" : "Enviar"}
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