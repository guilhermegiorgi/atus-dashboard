"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Eye, Edit, Trash2 } from "lucide-react";
import { api, Lead } from "@/lib/api/client";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  NOVO: { label: "Novo", variant: "default" },
  EM_ATENDIMENTO: { label: "Em Atendimento", variant: "secondary" },
  CONVERTIDO: { label: "Convertido", variant: "outline" },
  PERDIDO: { label: "Perdido", variant: "destructive" },
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await api.getLeads();
        console.log('Leads API Response:', response);
        
        if (response.error) {
          setError(response.error);
        } else if (response.data) {
          const leadsData = (response.data as { data?: Lead[] }).data || response.data;
          setLeads(Array.isArray(leadsData) ? leadsData : []);
        }
      } catch (err) {
        console.error('Error fetching leads:', err);
        setError("Erro ao carregar leads");
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      (lead.nome_completo?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (lead.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (lead.telefone || '').includes(searchTerm);
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground">
            Gerencie todos os seus leads e oportunidades
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Lead
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value || "all")}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="NOVO">Novo</SelectItem>
                <SelectItem value="EM_ATENDIMENTO">Em Atendimento</SelectItem>
                <SelectItem value="CONVERTIDO">Convertido</SelectItem>
                <SelectItem value="PERDIDO">Perdido</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filteredLeads.length} {filteredLeads.length === 1 ? "lead" : "leads"}
          </CardTitle>
          <CardDescription>
            Lista completa de leads no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredLeads.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nenhum lead encontrado</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Renda</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.nome_completo || 'Sem nome'}</TableCell>
                    <TableCell>{lead.telefone || '-'}</TableCell>
                    <TableCell>{lead.email || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={statusMap[lead.status]?.variant || "default"}>
                        {statusMap[lead.status]?.label || lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell>R$ {(lead.renda_comprovada || 0).toLocaleString('pt-BR')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
