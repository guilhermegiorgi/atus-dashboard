"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Eye, Edit, Trash2, Users, Filter } from "lucide-react";
import { api, Lead } from "@/lib/api/client";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; className: string }> = {
  NOVO: { label: "Novo", variant: "default", className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  EM_ATENDIMENTO: { label: "Em Atendimento", variant: "secondary", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  CONVERTIDO: { label: "Convertido", variant: "outline", className: "bg-green-500/20 text-green-400 border-green-500/30" },
  PERDIDO: { label: "Perdido", variant: "destructive", className: "bg-red-500/20 text-red-400 border-red-500/30" },
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
        
        if (response.error) {
          setError(response.error);
        } else if (response.data) {
          const leadsData = (response.data as { data?: Lead[] }).data || response.data;
          setLeads(Array.isArray(leadsData) ? leadsData : []);
        }
      } catch (err) {
        console.error('Erro ao carregar leads:', err);
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
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
          <p className="text-muted-foreground">Carregando leads...</p>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground">
            Gerencie e acompanhe todos os seus leads
          </p>
        </div>
        <Button className="glow-primary">
          <Plus className="mr-2 h-4 w-4" />
          Novo Lead
        </Button>
      </div>

      <Card className="glass border-border/50 animate-slide-up">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 bg-secondary/50 border-border/50 focus:border-primary/50"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value || "all")}>
              <SelectTrigger className="w-full md:w-[200px] bg-secondary/50 border-border/50">
                <Filter className="mr-2 h-4 w-4" />
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

      <Card className="glass border-border/50 animate-slide-up stagger-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                {filteredLeads.length} {filteredLeads.length === 1 ? "lead" : "leads"}
              </CardTitle>
              <CardDescription>
                Lista completa de leads no sistema
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredLeads.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Nenhum lead encontrado</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Tente ajustar seus filtros de busca
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/30 border-border/50">
                    <TableHead className="font-semibold">Nome</TableHead>
                    <TableHead className="font-semibold">Telefone</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Renda</TableHead>
                    <TableHead className="text-right font-semibold">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead, index) => (
                    <TableRow 
                      key={lead.id} 
                      className="hover:bg-secondary/30 transition-colors border-border/50 animate-slide-up"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-orange-600/20 flex items-center justify-center text-primary text-sm font-semibold">
                            {(lead.nome_completo || 'SN').charAt(0).toUpperCase()}
                          </div>
                          {lead.nome_completo || 'Sem nome'}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {lead.telefone || '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {lead.email || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={statusConfig[lead.status]?.variant || "default"}
                          className={statusConfig[lead.status]?.className}
                        >
                          {statusConfig[lead.status]?.label || lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">
                          R$ {(lead.renda_comprovada || 0).toLocaleString('pt-BR')}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
