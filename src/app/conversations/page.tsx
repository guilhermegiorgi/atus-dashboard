"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, ArrowLeft, MessageSquare, Clock } from "lucide-react";
import { api, Lead, Conversa } from "@/lib/api/client";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  NOVO: { label: "Novo", variant: "secondary" },
  EM_ATENDIMENTO: { label: "Em Atendimento", variant: "default" },
  CONVERTIDO: { label: "Convertido", variant: "outline" },
  PERDIDO: { label: "Perdido", variant: "destructive" },
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
      console.log('Leads API Response:', response);
      
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        const leadsData = Array.isArray(response.data) ? response.data : (response.data as { data?: Lead[] }).data || [];
        console.log('Leads data:', leadsData);
        setLeads(leadsData);
      }
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError("Erro ao carregar leads");
    } finally {
      setLoading(false);
    }
  };

const fetchConversations = async (leadId: string) => {
    try {
      const response = await api.getLeadConversations(leadId);
      console.log('Conversations API Response:', response);
      
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        const convData = Array.isArray(response.data) ? response.data : (response.data as { data?: Conversa[] }).data || [];
        console.log('Conversations data:', convData);
        setConversations(convData);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError("Erro ao carregar conversas");
    } finally {
      setLoading(false);
    }
  };

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    fetchConversations(lead.id);
  };

  const filteredLeads = leads.filter((lead) =>
    lead.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.telefone.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive">Erro: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Conversations</h1>
        <p className="text-muted-foreground">
          Histórico de conversas com leads
        </p>
      </div>

      {!selectedLead ? (
        <Card>
          <CardHeader>
            <CardTitle>Leads</CardTitle>
            <CardDescription>
              Selecione um lead para ver o histórico de conversas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email ou telefone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.nome_completo}</TableCell>
                    <TableCell>{lead.email}</TableCell>
                    <TableCell>{lead.telefone}</TableCell>
                    <TableCell>
                      <Badge variant={statusMap[lead.status]?.variant || "default"}>
                        {statusMap[lead.status]?.label || lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLeadClick(lead)}
                      >
                        Ver Conversas
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Button
            variant="ghost"
            onClick={() => setSelectedLead(null)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>{selectedLead.nome_completo}</CardTitle>
              <CardDescription>
                {selectedLead.email} • {selectedLead.telefone}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Badge variant={statusMap[selectedLead.status]?.variant || "default"}>
                  {statusMap[selectedLead.status]?.label || selectedLead.status}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Criado em: {new Date(selectedLead.created_at).toLocaleDateString('pt-BR')}</p>
                {selectedLead.codigo_ref && (
                  <p>Código de Referência: {selectedLead.codigo_ref}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Histórico de Conversas</CardTitle>
              <CardDescription>
                {conversations.length} conversa{conversations.length !== 1 ? 's' : ''} encontrada{conversations.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {conversations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma conversa encontrada</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {new Date(conv.created_at).toLocaleString('pt-BR')}
                      </div>
                      <div className="space-y-2">
                        <div className="bg-muted p-3 rounded-lg">
                          <div className="text-xs text-muted-foreground mb-1">Cliente:</div>
                          {conv.mensagem}
                        </div>
                        <div className="bg-primary text-primary-foreground p-3 rounded-lg">
                          <div className="text-xs opacity-70 mb-1">Bot:</div>
                          {conv.resposta}
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