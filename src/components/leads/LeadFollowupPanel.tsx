"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Bot, User, CheckCircle, Clock, PauseCircle, PlayCircle } from "lucide-react";
import { api } from "@/lib/api/client";
import type { Note } from "@/types/leads";

interface LeadFollowupPanelProps {
  leadId: string;
  open: boolean;
  onClose: () => void;
  onFollowupChange?: () => void;
}

export function LeadFollowupPanel({ leadId, open, onClose, onFollowupChange }: LeadFollowupPanelProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [followupStatus, setFollowupStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [addingNote, setAddingNote] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch status
      const statusRes = await api.getLeadFollowupStatus(leadId);
      if (statusRes.data) {
        setFollowupStatus(statusRes.data);
      }
      
      // Fetch notes
      const notesRes = await api.getLeadNotes(leadId);
      if (notesRes.data) {
        // Filter out only follow_up related notes or show all notes
        // We will show all notes of type 'follow_up'
        const fuNotes = notesRes.data.filter((n: Note) => n.type === 'follow_up');
        setNotes(fuNotes);
      }
    } catch (error) {
      console.error("Erro ao carregar dados de follow-up:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open, leadId]);

  const handleIntervene = async () => {
    try {
      setChangingStatus(true);
      await api.interveneLead(leadId, "HUMAN_TAKEOVER", "Ação manual via painel");
      await loadData();
      onFollowupChange?.();
    } catch (error) {
      console.error("Erro ao intervir:", error);
    } finally {
      setChangingStatus(false);
    }
  };

  const handleRelease = async () => {
    try {
      setChangingStatus(true);
      await api.releaseLeadFollowup(leadId);
      await loadData();
      onFollowupChange?.();
    } catch (error) {
      console.error("Erro ao liberar bot:", error);
    } finally {
      setChangingStatus(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNoteContent.trim()) return;
    try {
      setAddingNote(true);
      await api.createLeadNote(leadId, newNoteContent.trim(), "follow_up");
      setNewNoteContent("");
      await loadData();
    } catch (error) {
      console.error("Erro ao adicionar nota:", error);
    } finally {
      setAddingNote(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const isBotActive = !followupStatus?.active && !followupStatus?.is_paused; // Or whatever logic represents "Bot is handling it" vs "Human is handling it". Assume `active` means Follow-up by human is active. Let's rely on standard UI assumptions:
  const isHumanTakeover = followupStatus?.em_follow_up || followupStatus?.active || !!followupStatus?.intervention_type; 

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="w-[95vw] sm:max-w-5xl max-h-[90vh] overflow-y-auto overflow-x-hidden border border-white/10 bg-zinc-950/95 p-0 text-zinc-100 backdrop-blur-xl">
        <DialogHeader className="border-b border-white/5 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-400">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-white">
                Follow-up & Intervenção
              </DialogTitle>
              <DialogDescription className="text-zinc-400">
                Assuma o controle da conversa ou gerencie as notas de follow-up
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[400px]">
          {/* Left panel: Bot Control */}
          <div className="flex flex-col border-b border-white/10 md:border-b-0 md:border-r p-6 bg-black/20">
            <h3 className="text-lg font-semibold text-white mb-4">Controle do Chatbot</h3>
            
            {loading ? (
              <div className="flex justify-center p-4">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-6 flex-1 bg-white/5 rounded-xl border border-white/10 p-6 text-center">
                {isHumanTakeover ? (
                  <>
                    <div className="h-20 w-20 rounded-full bg-blue-500/20 flex items-center justify-center border-4 border-blue-500/30">
                      <User className="h-10 w-10 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-blue-400 mb-2">Intervenção Humana Ativa</h4>
                      <p className="text-sm text-zinc-400 max-w-xs mx-auto">
                        O bot está pausado. As conversas estão sob controle de um corretor humano no momento.
                      </p>
                    </div>
                    <Button 
                      onClick={handleRelease} 
                      disabled={changingStatus}
                      className="mt-4 bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10"
                    >
                      {changingStatus ? "Processando..." : (
                        <>
                          <PlayCircle className="mr-2 h-4 w-4" />
                          Liberar Bot (Remover Follow-up)
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="h-20 w-20 rounded-full bg-green-500/20 flex items-center justify-center border-4 border-green-500/30">
                      <Bot className="h-10 w-10 text-green-400" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-green-400 mb-2">Bot Autônomo Ativo</h4>
                      <p className="text-sm text-zinc-400 max-w-xs mx-auto">
                        O bot de IA está controlando as respostas neste momento. Você pode intervir para assumir a conversa.
                      </p>
                    </div>
                    <Button 
                      onClick={handleIntervene} 
                      disabled={changingStatus}
                      className="mt-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-400 hover:to-blue-400 text-white"
                    >
                      {changingStatus ? "Processando..." : (
                        <>
                          <PauseCircle className="mr-2 h-4 w-4" />
                          Assumir Conversa (Pausar Bot)
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right panel: Notes */}
          <div className="flex flex-col p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Notas de Follow-up</h3>
            
            <div className="flex-1 overflow-y-auto space-y-3 mb-4 max-h-[250px] pr-2">
              {loading ? (
                 <div className="flex justify-center p-4">
                 <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
               </div>
              ) : notes.length === 0 ? (
                <div className="text-center p-6 text-sm text-zinc-500 border border-dashed border-white/10 rounded-xl">
                  Nenhuma nota de follow-up registrada.
                </div>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="bg-white/5 border border-white/10 p-3 rounded-lg">
                    <p className="text-sm text-zinc-200 whitespace-pre-wrap">{note.content}</p>
                    <div className="flex justify-between items-center mt-2 text-xs text-zinc-500">
                      <span>{note.author_name || "Usuário"}</span>
                      <span>{formatDate(note.created_at)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-auto space-y-3 pt-4 border-t border-white/10">
              <label className="text-sm font-medium text-zinc-300">Nova Nota</label>
              <Textarea
                placeholder="Excedeu tempo de resposta, aguardando retorno do cliente..."
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                className="min-h-[80px] border-white/10 bg-secondary/50 focus:border-purple-500/50 resize-none"
              />
              <Button
                onClick={handleAddNote}
                disabled={addingNote || !newNoteContent.trim()}
                className="w-full bg-white/10 hover:bg-white/20 text-white"
              >
                {addingNote ? "Salvando..." : "Salvar Nota"}
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