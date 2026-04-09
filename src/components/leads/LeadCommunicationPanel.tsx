"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MessageSquare, Send } from "lucide-react";
import { api } from "@/lib/api/client";
import type { Conversa } from "@/types/leads";

interface LeadCommunicationPanelProps {
  leadId: string;
  open: boolean;
  onClose: () => void;
}

export function LeadCommunicationPanel({ leadId, open, onClose }: LeadCommunicationPanelProps) {
  const [conversations, setConversations] = useState<Conversa[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversa | null>(null);
  const [messages, setMessages] = useState<Record<string, unknown>[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [content, setContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadConversations = async (autoSelectLatest = false) => {
    try {
      setLoadingConversations(true);
      const response = await api.getLeadConversations(leadId);
      if (response.data) {
        setConversations(response.data);
        if (autoSelectLatest && response.data.length > 0) {
          setSelectedConversation(response.data[0]); // assuming latest is first
        }
      }
    } catch (error) {
      console.error("Erro ao carregar conversas:", error);
    } finally {
      setLoadingConversations(false);
    }
  };

  const loadMessages = async (conversaId: string) => {
    try {
      setLoadingMessages(true);
      const response = await api.getConversationMessages(conversaId);
      if (response.data?.data) {
        // Assume API returns newest first or oldest first. We will sort oldest first for chat flow
        const sorted = [...response.data.data].sort((a, b) => new Date(a.timestamp as string).getTime() - new Date(b.timestamp as string).getTime());
        setMessages(sorted);
      }
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadConversations(true);
    } else {
      setConversations([]);
      setSelectedConversation(null);
      setMessages([]);
      setContent("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, leadId]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    } else {
      setMessages([]);
    }
  }, [selectedConversation]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!content.trim()) return;

    try {
      setSending(true);
      const response = await api.sendWhatsAppMessage(leadId, content.trim(), false);
      
      if (response.data?.success) {
        setContent("");
        // Reload conversations to get the new message or new conversation
        await loadConversations(true);
        if (selectedConversation) {
          await loadMessages(selectedConversation.id);
        }
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return "";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="w-[95vw] max-w-6xl xl:max-w-7xl max-h-[90vh] overflow-y-auto overflow-x-hidden border border-white/10 bg-zinc-950/95 p-0 text-zinc-100 backdrop-blur-xl">
        <DialogHeader className="border-b border-white/5 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-400">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-white">
                Chat WhatsApp
              </DialogTitle>
              <DialogDescription className="text-zinc-400">
                Histórico interativo de conversas com o lead
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] min-h-[500px]">
          {/* Left panel: List of conversations */}
          <div className="flex flex-col border-b border-white/10 md:border-b-0 md:border-r bg-black/20">
            <div className="p-4 border-b border-white/10">
              <h3 className="text-sm font-semibold text-zinc-300">Histórico de Conversas</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[500px]">
              {loadingConversations ? (
                <div className="flex justify-center p-4">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center p-4 text-sm text-zinc-500">
                  Nenhuma conversa iniciada.
                </div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                      selectedConversation?.id === conv.id
                        ? "border-green-500/50 bg-green-500/10"
                        : "border-white/5 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-zinc-300">
                        {conv.started_at ? formatDate(conv.started_at) : "Desconhecido"}
                      </span>
                      <Badge variant="outline" className={`text-[10px] ${conv.status === 'ATIVA' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'}`}>
                        {conv.status || "FINALIZADA"}
                      </Badge>
                    </div>
                    <div className="text-xs text-zinc-400">
                      {conv.message_count} mensagens
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right panel: Messages & Input */}
          <div className="flex flex-col bg-zinc-950/50">
            <div className="flex-1 overflow-y-auto p-6 max-h-[500px] flex flex-col gap-4">
              {loadingMessages ? (
                <div className="flex h-full items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500/30 border-t-green-500" />
                    <p className="text-sm text-zinc-400">Carregando mensagens...</p>
                  </div>
                </div>
              ) : (!selectedConversation && conversations.length > 0) ? (
                <div className="flex h-full items-center justify-center text-zinc-500">
                  Selecione uma conversa ao lado.
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <MessageSquare className="mb-4 h-12 w-12 text-zinc-600" />
                  <p className="text-zinc-400">Nenhuma mensagem aqui</p>
                  <p className="text-sm text-zinc-500">Use o formulário abaixo para enviar a primeira mensagem.</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isSentByUs = msg.direcao === "SAIDA";
                  return (
                    <div key={msg.id as string} className={`flex ${isSentByUs ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        isSentByUs 
                          ? "bg-green-600/20 border border-green-500/30 text-green-100 rounded-tr-sm" 
                          : "bg-white/10 border border-white/5 text-zinc-200 rounded-tl-sm"
                      }`}>
                        <div className="text-sm whitespace-pre-wrap">{msg.conteudo as string}</div>
                        <div className={`mt-1 text-[10px] text-right ${isSentByUs ? "text-green-400/70" : "text-zinc-500"}`}>
                          {formatTime(msg.timestamp as string)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="p-4 border-t border-white/10 bg-black/40">
              <Textarea
                placeholder="Escreva sua mensagem via WhatsApp..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[80px] border-white/10 bg-secondary/50 focus:border-green-500/50 resize-none mb-3"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-500">Pressione Enter para enviar</span>
                <Button
                  onClick={handleSend}
                  disabled={sending || !content.trim()}
                  className="bg-gradient-to-r from-green-500 to-emerald-400 text-white shadow-[0_4px_15px_rgba(34,197,94,0.2)] hover:from-green-400 hover:to-emerald-300"
                >
                  {sending ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Enviar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}