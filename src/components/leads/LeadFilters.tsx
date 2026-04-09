"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Filter, Search, DollarSign, RefreshCw, X } from "lucide-react";
import { api, Corretor } from "@/lib/api/client";
import { LeadFilterOptions, LeadStatus, LEAD_STATUSES } from "@/types/leads";

interface LeadFiltersProps {
  filters: LeadFilterOptions;
  onFiltersChange: (filters: LeadFilterOptions) => void;
  onClearFilters: () => void;
}

const statusLabels: Record<LeadStatus, string> = {
  NOVO: "Novo",
  EM_ATENDIMENTO: "Em Atendimento", 
  CONVERTIDO: "Convertido",
  PERDIDO: "Perdido",
  AGUARDANDO_RETORNO: "Aguard. Retorno",
};

export function LeadFilters({ filters, onFiltersChange, onClearFilters }: LeadFiltersProps) {
  const [corretores, setCorretores] = useState<Corretor[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  const loadCorretores = async () => {
    try {
      const response = await api.getCorretores();
      if (response.data) {
        setCorretores(response.data);
      }
    } catch (error) {
      console.error("Erro ao carregar corretores:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCorretores();
  }, []);

  const hasActiveFilters = Object.keys(filters).length > 0;

  const handleFilterChange = (key: keyof LeadFilterOptions, value: unknown) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const handleClearFilter = (key: keyof LeadFilterOptions) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  const handleClearAllFilters = () => {
    onClearFilters();
  };

  return (
    <Card className="glass border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Filtros Avançados</CardTitle>
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {Object.keys(filters).length} ativo(s)
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAllFilters}
                className="text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Limpar tudo
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="text-xs"
            >
              {expanded ? "Recolher" : "Expandir"}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Filtros básicos sempre visíveis */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-200">Busca rápida</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input
                placeholder="Nome, email ou telefone..."
                value={filters.search || ""}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="border-white/10 bg-secondary/50 pl-10 focus:border-orange-500/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-200">Status</label>
            <Select
              value={filters.status || "all"}
              onValueChange={(value) => handleFilterChange("status", value === "all" ? undefined : value)}
            >
              <SelectTrigger className="border-white/10 bg-secondary/50 focus:border-orange-500/50">
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {LEAD_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {statusLabels[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-200">Corretor</label>
            <Select
              value={filters.corretor_id || "all"}
              onValueChange={(value) => handleFilterChange("corretor_id", value === "all" ? undefined : value)}
              disabled={loading}
            >
              <SelectTrigger className="border-white/10 bg-secondary/50 focus:border-orange-500/50">
                <SelectValue placeholder="Todos os corretores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os corretores</SelectItem>
                {corretores.map((corretor) => (
                  <SelectItem key={corretor.id} value={corretor.id}>
                    {corretor.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-200">Origem</label>
            <Input
              placeholder="Ex: Facebook, Google..."
              value={filters.origem || ""}
              onChange={(e) => handleFilterChange("origem", e.target.value)}
              className="border-white/10 bg-secondary/50 focus:border-orange-500/50"
            />
          </div>
        </div>

        {/* Filtros avançados - visíveis quando expandido */}
        {expanded && (
          <div className="space-y-6 border-t border-white/10 pt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-200">Renda mínima</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <Input
                    type="number"
                    placeholder="R$ 0"
                    value={filters.minRenda || ""}
                    onChange={(e) => handleFilterChange("minRenda", e.target.value ? Number(e.target.value) : undefined)}
                    className="border-white/10 bg-secondary/50 pl-10 focus:border-orange-500/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-200">Renda máxima</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <Input
                    type="number"
                    placeholder="Sem limite"
                    value={filters.maxRenda || ""}
                    onChange={(e) => handleFilterChange("maxRenda", e.target.value ? Number(e.target.value) : undefined)}
                    className="border-white/10 bg-secondary/50 pl-10 focus:border-orange-500/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-200">Possui entrada</label>
                <Select
                  value={filters.temEntrada === undefined ? "all" : String(filters.temEntrada)}
                  onValueChange={(value) => handleFilterChange("temEntrada", value === "all" ? undefined : value === "true")}
                >
                  <SelectTrigger className="border-white/10 bg-secondary/50 focus:border-orange-500/50">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="true">Sim</SelectItem>
                    <SelectItem value="false">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-200">Carteira assinada</label>
                <Select
                  value={filters.temCarteira === undefined ? "all" : String(filters.temCarteira)}
                  onValueChange={(value) => handleFilterChange("temCarteira", value === "all" ? undefined : value === "true")}
                >
                  <SelectTrigger className="border-white/10 bg-secondary/50 focus:border-orange-500/50">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="true">Sim</SelectItem>
                    <SelectItem value="false">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-200">Data inicial</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <Input
                    type="date"
                    value={filters.dateFrom || ""}
                    onChange={(e) => handleFilterChange("dateFrom", e.target.value || undefined)}
                    className="border-white/10 bg-secondary/50 pl-10 focus:border-orange-500/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-200">Data final</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <Input
                    type="date"
                    value={filters.dateTo || ""}
                    onChange={(e) => handleFilterChange("dateTo", e.target.value || undefined)}
                    className="border-white/10 bg-secondary/50 pl-10 focus:border-orange-500/50"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tags de filtros ativos */}
        {hasActiveFilters && (
          <div className="space-y-3 border-t border-white/10 pt-4">
            <div className="text-sm font-medium text-zinc-300">Filtros ativos:</div>
            <div className="flex flex-wrap gap-2">
              {filters.status && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Status: {statusLabels[filters.status]}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleClearFilter("status")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {filters.corretor_id && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Corretor: {corretores.find(c => c.id === filters.corretor_id)?.nome || "Desconhecido"}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleClearFilter("corretor_id")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {filters.origem && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Origem: {filters.origem}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleClearFilter("origem")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {filters.minRenda && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Renda mínima: R$ {filters.minRenda.toLocaleString('pt-BR')}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleClearFilter("minRenda")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {filters.maxRenda && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Renda máxima: R$ {filters.maxRenda.toLocaleString('pt-BR')}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleClearFilter("maxRenda")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {filters.temEntrada !== undefined && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Entrada: {filters.temEntrada ? "Sim" : "Não"}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleClearFilter("temEntrada")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {filters.temCarteira !== undefined && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Carteira: {filters.temCarteira ? "Sim" : "Não"}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleClearFilter("temCarteira")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {filters.dateFrom && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  De: {new Date(filters.dateFrom).toLocaleDateString('pt-BR')}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleClearFilter("dateFrom")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {filters.dateTo && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Até: {new Date(filters.dateTo).toLocaleDateString('pt-BR')}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleClearFilter("dateTo")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}