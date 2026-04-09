"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Filter, RefreshCw, Search, X } from "lucide-react";
import { LEAD_STATUSES, LeadListFilters } from "@/types/leads";

interface LeadFiltersProps {
  filters: LeadListFilters & { search?: string };
  onFiltersChange: (filters: LeadListFilters & { search?: string }) => void;
  onClearFilters: () => void;
}

export function LeadFilters({
  filters,
  onFiltersChange,
  onClearFilters,
}: LeadFiltersProps) {
  const activeFilters = Object.entries(filters).filter(
    ([, value]) => value !== undefined && value !== ""
  );

  return (
    <Card className="glass border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Filtros de Leads</CardTitle>
            {activeFilters.length > 0 && (
              <Badge variant="secondary">{activeFilters.length} ativo(s)</Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            <RefreshCw className="mr-2 h-3 w-3" />
            Limpar tudo
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-200">
              Busca local na pagina
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input
                value={filters.search ?? ""}
                onChange={(event) =>
                  onFiltersChange({ ...filters, search: event.target.value })
                }
                placeholder="Nome, email ou telefone"
                className="border-white/10 bg-secondary/50 pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-200">Status</label>
            <Select
              value={filters.status ?? "all"}
              onValueChange={(value) =>
                onFiltersChange({
                  ...filters,
                  status:
                    value === "all" ? undefined : (value as LeadListFilters["status"]),
                })
              }
            >
              <SelectTrigger className="border-white/10 bg-secondary/50">
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {LEAD_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-200">Fase</label>
            <Input
              value={filters.fase ?? ""}
              onChange={(event) =>
                onFiltersChange({ ...filters, fase: event.target.value || undefined })
              }
              placeholder="Ex.: COLETA"
              className="border-white/10 bg-secondary/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-200">
              Tipo de Interesse
            </label>
            <Input
              value={filters.tipo_interesse ?? ""}
              onChange={(event) =>
                onFiltersChange({
                  ...filters,
                  tipo_interesse: event.target.value || undefined,
                })
              }
              placeholder="Ex.: COMPRA"
              className="border-white/10 bg-secondary/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-200">
              Canal de Origem
            </label>
            <Input
              value={filters.canal_origem ?? ""}
              onChange={(event) =>
                onFiltersChange({
                  ...filters,
                  canal_origem: event.target.value || undefined,
                })
              }
              placeholder="Ex.: PORTAL"
              className="border-white/10 bg-secondary/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-200">
              Sistema de Origem
            </label>
            <Input
              value={filters.sistema_origem ?? ""}
              onChange={(event) =>
                onFiltersChange({
                  ...filters,
                  sistema_origem: event.target.value || undefined,
                })
              }
              placeholder="Ex.: IMOVELWEB"
              className="border-white/10 bg-secondary/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-200">Com Nome</label>
            <Select
              value={filters.has_nome === undefined ? "all" : String(filters.has_nome)}
              onValueChange={(value) =>
                onFiltersChange({
                  ...filters,
                  has_nome: value === "all" ? undefined : value === "true",
                })
              }
            >
              <SelectTrigger className="border-white/10 bg-secondary/50">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="true">Sim</SelectItem>
                <SelectItem value="false">Nao</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-200">Com Email</label>
            <Select
              value={filters.has_email === undefined ? "all" : String(filters.has_email)}
              onValueChange={(value) =>
                onFiltersChange({
                  ...filters,
                  has_email: value === "all" ? undefined : value === "true",
                })
              }
            >
              <SelectTrigger className="border-white/10 bg-secondary/50">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="true">Sim</SelectItem>
                <SelectItem value="false">Nao</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 border-t border-white/10 pt-4">
            {activeFilters.map(([key, value]) => (
              <Badge key={key} variant="secondary" className="gap-1">
                {key}: {String(value)}
                <button
                  type="button"
                  onClick={() => onFiltersChange({ ...filters, [key]: undefined })}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
