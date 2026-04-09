"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MessageSquare, Bot, UserPlus, Reply, Phone, MoreVertical } from "lucide-react";
import { api, InboxConversationSummary } from "@/lib/api/client";
import { LeadCommunicationPanel } from "@/components/leads/LeadCommunicationPanel";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const conversationStateConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; className: string }> = {
  ACTIVE_STANDBY: { label: "Standby", variant: "secondary", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  HUMAN_TAKEOVER: { label: "Atendimento Humano", variant: "default", className: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  TRIAGE: { label: "Triagem", variant: "outline", className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  RESOLVED: { label: "Resolvido", variant: "outline", className: "bg-green-500/20 text-green-400 border-green-500/30" },
};

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<InboxConversationSummary[]>([]);
  const [totalConversations, setTotalConversations] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [page, setPage] = useState(1);
  const limit = 50;
  const [activeTab, setActiveTab] = useState<string>("ACTIVE_STANDBY,HUMAN_TAKEOVER,TRIAGE"); // Comma separated for "Ativas"

  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isCommunicating, setIsCommunicating] = useState(false);

  const fetchInbox = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const offset = (page - 1) * limit;
      // Depending on the API implementation, state could be a comma separated list or single. We pass it as is.
      const response = await api.getInboxConversations(limit, offset, activeTab === "ALL" ? undefined : activeTab);
      
      if (response.error) {
        setError(response.error);
        return;
      }
      
      const convData = Array.isArray(response.data) ? response.data : [];
      setConversations(convData);
      
      if (response.meta && typeof response.meta.total === 'number') {
        setTotalConversations(response.meta.total);
      } else {
        setTotalConversations(convData.length);
      }
    } catch {
      setError("Erro ao carregar inbox.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, activeTab]);

  useEffect(() => {
    void fetchInbox();
  }, [fetchInbox]);

  const handleAction = async (action: "return-bot" | "assign", leadId: string) => {
    try {
      if (action === "return-bot") {
        await api.returnInboxConversationToBot(leadId);
      } else if (action === "assign") {
        // Here you would optimally open a modal to select corretor, 
        // to simplify for now we assign to a hardcoded "self" ID or standard ID.
        // Assuming your backend handles assignment by token if ID is null.
        await api.assignInboxConversation(leadId, null);
      }
      await fetchInbox();
    } catch {
      alert("Falha ao executar ação de inbox.");
    }
  };

  if (loading && conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
          <p className="text-muted-foreground">Carregando inbox...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inbox Humana</h1>
        <p className="text-muted-foreground">
          Gestão de conversas ativas e intervenções com o bot
        </p>
      </div>

      <div className="flex gap-2 border-b border-border/50 pb-4 overflow-x-auto">
        <Button 
          variant={activeTab === "ACTIVE_STANDBY,HUMAN_TAKEOVER,TRIAGE" ? "default" : "outline"}
          onClick={() => { setActiveTab("ACTIVE_STANDBY,HUMAN_TAKEOVER,TRIAGE"); setPage(1); }}
        >
          Filas Ativas
        </Button>
        <Button 
          variant={activeTab === "HUMAN_TAKEOVER" ? "default" : "outline"}
          onClick={() => { setActiveTab("HUMAN_TAKEOVER"); setPage(1); }}
        >
          Meus Atendimentos
        </Button>
        <Button 
          variant={activeTab === "TRIAGE" ? "default" : "outline"}
          onClick={() => { setActiveTab("TRIAGE"); setPage(1); }}
        >
          Triagem
        </Button>
        <Button 
          variant={activeTab === "ALL" ? "default" : "outline"}
          onClick={() => { setActiveTab("ALL"); setPage(1); }}
        >
          Todas
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
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Caixa de Entrada
              </CardTitle>
              <CardDescription>
                Selecione uma conversa para continuar o atendimento
              </CardDescription>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Phone className="h-3 w-3" />
              {totalConversations} {totalConversations === 1 ? 'conversa' : 'conversas'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {conversations.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Inbox vazia nesta categoria</p>
            </div>
          ) : (
            <div className="rounded-xl border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/30 border-border/50">
                    <TableHead className="font-semibold">Contato</TableHead>
                    <TableHead className="font-semibold">Estado da Conversa</TableHead>
                    <TableHead className="font-semibold">Contexto</TableHead>
                    <TableHead className="font-semibold">Última Mensagem</TableHead>
                    <TableHead className="text-right font-semibold">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {conversations.map((conv, index) => (
                    <TableRow 
                      key={conv.telefone}
                      className="hover:bg-secondary/30 transition-colors border-border/50 animate-slide-up"
                      style={{ animationDelay: `${index * 20}ms` }}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-orange-600/20 flex items-center justify-center text-primary text-sm font-semibold">
                            {(conv.nome_completo || 'SN').charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span>{conv.nome_completo || 'Sem nome'}</span>
                            <span className="text-xs text-muted-foreground">{conv.telefone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 items-start">
                          <Badge 
                            variant={conversationStateConfig[conv.conversation_state]?.variant || "default"}
                            className={conversationStateConfig[conv.conversation_state]?.className}
                          >
                            {conversationStateConfig[conv.conversation_state]?.label || conv.conversation_state}
                          </Badge>
                          {conv.assigned_corretor_id && (
                            <span className="text-[10px] text-muted-foreground px-1 bg-secondary rounded-sm">
                              Atribuído
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm">{conv.status || '-'} • {conv.fase || '-'}</span>
                          <span className="text-xs text-muted-foreground line-clamp-1" title={conv.qualification_summary}>
                            {conv.qualification_summary || "Sem sumário"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 max-w-[200px] lg:max-w-[300px]">
                          {conv.last_message_direction === "ENTRADA" ? (
                            <Reply className="h-3 w-3 text-muted-foreground flex-shrink-0 rotate-180" />
                          ) : (
                            <Reply className="h-3 w-3 text-primary flex-shrink-0" />
                          )}
                          <span className="text-sm truncate text-muted-foreground">
                            {conv.last_message_preview || "Nenhuma mensagem"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="bg-primary/10 text-primary hover:bg-primary hover:text-white"
                            onClick={() => {
                              setSelectedLeadId(conv.lead_id);
                              setIsCommunicating(true);
                            }}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Abrir Chat
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-secondary hover:text-secondary-foreground h-8 w-8">
                              <MoreVertical className="h-4 w-4 text-muted-foreground" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações de Inbox</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleAction("assign", conv.lead_id)}>
                                <UserPlus className="h-4 w-4 mr-2" /> Assumir Conversa
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAction("return-bot", conv.lead_id)}>
                                <Bot className="h-4 w-4 mr-2" /> Devolver ao Bot
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {totalConversations > 0 && (
            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <div className="text-sm text-muted-foreground">
                Exibindo <span className="font-medium text-foreground">{conversations.length}</span> de <span className="font-medium text-foreground">{totalConversations}</span>
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
                <div className="text-sm font-medium px-2 py-1 bg-secondary/30 rounded-md">
                  Página {page}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={conversations.length < limit || loading}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedLeadId && (
        <LeadCommunicationPanel
          leadId={selectedLeadId}
          open={isCommunicating}
          onClose={() => {
            setIsCommunicating(false);
            setSelectedLeadId(null);
          }}
        />
      )}
    </div>
  );
}
