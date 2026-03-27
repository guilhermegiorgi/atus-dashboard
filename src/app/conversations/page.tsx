"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, ArrowLeft, MessageSquare, Clock, User, Bot } from "lucide-react";
import { api, Lead, Conversa } from "@/lib/api/client";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; className: string }> = {
  NOVO: { label: "Novo", variant: "default", className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  EM_ATENDIMENTO: { label: "Em Atendimento", variant: "secondary", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  CONVERTIDO: { label: "Convertido", variant: "outline", className: "bg-green-500/20 text-green-400 border-green-500/30" },
  PERDIDO: { label: "Perdido", variant: "destructive", className: "bg-red-500/20 text-red-400 border-red-500/30" },
};

export default function ConversationsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [conversations, setConversations] = useState<Conversa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await api.getLeads();
      
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        const leadsData = Array.isArray(response.data) ? response.data : (response.data as { data?: Lead[] }).data || [];
        setLeads(leadsData);
      }
    } catch (err) {
      console.error('Erro ao carregar leads:', err);
      setError("Erro ao carregar leads");
    } finally {
      setLoading(false);
    }
  };

  const fetchConversations = async (leadId: string) => {
    try {
      const response = await api.getLeadConversations(leadId);
      
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        const convData = Array.isArray(response.data) ? response.data : (response.data as { data?: Conversa[] }).data || [];
        setConversations(convData);
      }
    } catch (err) {
      console.error('Erro ao carregar conversas:', err);
      setError("Erro ao carregar conversas");
    }
  };

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    fetchConversations(lead.id);
  };

  const filteredLeads = leads.filter((lead) =>
    (lead.nome_completo?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (lead.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (lead.telefone || '').includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
          <p className="text-muted-foreground">Carregando conversas...</p>
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Conversas</h1>
        <p className="text-muted-foreground">
          Histórico de conversas com seus leads
        </p>
      </div>

      {!selectedLead ? (
        <>
          <Card className="glass border-border/50 animate-slide-up">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email ou telefone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-11 bg-secondary/50 border-border/50"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-border/50 animate-slide-up stagger-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    {filteredLeads.length} {filteredLeads.length === 1 ? "lead" : "leads"}
                  </CardTitle>
                  <CardDescription>
                    Selecione um lead para ver o histórico de conversas
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredLeads.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">Nenhum lead encontrado</p>
                </div>
              ) : (
                <div className="rounded-xl border border-border/50 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary/30 border-border/50">
                        <TableHead className="font-semibold">Nome</TableHead>
                        <TableHead className="font-semibold">Email</TableHead>
                        <TableHead className="font-semibold">Telefone</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="text-right font-semibold">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLeads.map((lead, index) => (
                        <TableRow 
                          key={lead.id}
                          className="hover:bg-secondary/30 transition-colors cursor-pointer border-border/50 animate-slide-up"
                          style={{ animationDelay: `${index * 30}ms` }}
                          onClick={() => handleLeadClick(lead)}
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-orange-600/20 flex items-center justify-center text-primary text-sm font-semibold">
                                {(lead.nome_completo || 'SN').charAt(0).toUpperCase()}
                              </div>
                              {lead.nome_completo || 'Sem nome'}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{lead.email || '-'}</TableCell>
                          <TableCell className="text-muted-foreground">{lead.telefone || '-'}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={statusConfig[lead.status]?.variant || "default"}
                              className={statusConfig[lead.status]?.className}
                            >
                              {statusConfig[lead.status]?.label || lead.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLeadClick(lead);
                              }}
                              className="hover:bg-primary/10 hover:text-primary"
                            >
                              Ver Conversas
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="space-y-6 animate-fade-in">
          <Button
            variant="ghost"
            onClick={() => setSelectedLead(null)}
            className="hover:bg-secondary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para lista
          </Button>

          <Card className="glass border-border/50 animate-slide-up">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-primary-foreground text-xl font-bold">
                    {(selectedLead.nome_completo || 'SN').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <CardTitle>{selectedLead.nome_completo || 'Sem nome'}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <span>{selectedLead.email || '-'}</span>
                      <span>•</span>
                      <span>{selectedLead.telefone || '-'}</span>
                    </CardDescription>
                  </div>
                </div>
                <Badge 
                  variant={statusConfig[selectedLead.status]?.variant || "default"}
                  className={statusConfig[selectedLead.status]?.className}
                >
                  {statusConfig[selectedLead.status]?.label || selectedLead.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Criado em: {new Date(selectedLead.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
                {selectedLead.codigo_ref && (
                  <div>
                    Código: {selectedLead.codigo_ref}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-border/50 animate-slide-up stagger-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Histórico de Conversas
              </CardTitle>
              <CardDescription>
                {conversations.length} conversa{conversations.length !== 1 ? 's' : ''} encontrada{conversations.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {conversations.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">Nenhuma conversa encontrada</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    As conversas aparecerão aqui quando forem registradas
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {conversations.map((conv, index) => (
                    <div
                      key={conv.id}
                      className="rounded-xl border border-border/50 p-4 space-y-4 hover:border-primary/30 transition-colors animate-slide-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {new Date(conv.created_at).toLocaleString('pt-BR')}
                      </div>
                      <div className="space-y-4">
                        <div className="flex gap-3">
                          <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 bg-secondary/50 rounded-xl rounded-tl-none p-4">
                            <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                              <User className="h-3 w-3" />
                              Cliente
                            </div>
                            <p className="text-sm">{conv.mensagem || 'Sem mensagem'}</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <Bot className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 bg-primary/10 rounded-xl rounded-tl-none p-4 border border-primary/20">
                            <div className="text-xs text-primary mb-2 flex items-center gap-1">
                              <Bot className="h-3 w-3" />
                              Atus Bot
                            </div>
                            <p className="text-sm">{conv.resposta || 'Sem resposta'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
