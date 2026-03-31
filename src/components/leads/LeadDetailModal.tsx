"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lead } from "@/lib/api/client";
import {
  Building2,
  CalendarDays,
  DollarSign,
  EditIcon,
  Mail,
  MapPin,
  MessageSquareText,
  MessageSquare,
  Phone,
  Sparkles,
  UserRound,
} from "lucide-react";

interface LeadDetailModalProps {
  lead: Lead;
  open: boolean;
  onClose: () => void;
  onEdit: (lead: Lead) => void;
  onOpenCommunication?: (lead: Lead) => void;
}

const statusColors: Record<string, string> = {
  NOVO: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  EM_ATENDIMENTO: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  CONVERTIDO: "bg-green-500/20 text-green-400 border-green-500/30",
  PERDIDO: "bg-red-500/20 text-red-400 border-red-500/30",
};

export function LeadDetailModal({ lead, open, onClose, onEdit, onOpenCommunication }: LeadDetailModalProps) {
  const statusClass = statusColors[lead.status] || "bg-gray-500/20 text-gray-400 border-gray-500/30";

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (value: string | null | undefined) => {
    if (!value) {
      return "Não informado";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Não informado";
    }

    return date.toLocaleDateString("pt-BR");
  };

  const leadInitials = lead.nome_completo
    ? lead.nome_completo
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("")
    : "LD";

  const detailItems = [
    { icon: Mail, label: "Email", value: lead.email || "Não informado" },
    { icon: Phone, label: "Telefone", value: lead.telefone || "Não informado" },
    { icon: MapPin, label: "Localização", value: lead.localizacao || "Não informado" },
    { icon: Building2, label: "Interesse", value: lead.tipo_interesse || "Não informado" },
  ];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden border border-white/10 bg-zinc-950/95 p-0 text-zinc-100 backdrop-blur-xl">
        <div className="relative overflow-hidden border-b border-white/5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.28),transparent_35%),radial-gradient(circle_at_top_left,rgba(251,191,36,0.14),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0))]" />
          <div className="relative grid gap-6 px-6 py-6 md:grid-cols-[1.5fr_1fr]">
            <DialogHeader className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 text-lg font-semibold text-white shadow-[0_0_40px_rgba(249,115,22,0.22)]">
                  {leadInitials}
                </div>
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${statusClass}`}>
                      {lead.status.replace("_", " ")}
                    </span>
                    {lead.origem && (
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
                        Origem: {lead.origem}
                      </span>
                    )}
                    {lead.codigo_ref && (
                      <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs text-orange-200">
                        Ref. {lead.codigo_ref}
                      </span>
                    )}
                  </div>
                  <DialogTitle className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
                    {lead.nome_completo || "Lead sem nome"}
                  </DialogTitle>
                  <DialogDescription className="max-w-2xl text-sm leading-6 text-zinc-300">
                    Visualização executiva do lead com contexto comercial, dados de contato e indicadores para atendimento premium.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-zinc-400">
                  <DollarSign className="h-4 w-4 text-orange-400" />
                  Potencial
                </div>
                <div className="text-lg font-semibold text-white">{formatCurrency(lead.renda_comprovada || 0)}</div>
                <div className="mt-1 text-xs text-zinc-400">Renda comprovada atual</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-zinc-400">
                  <CalendarDays className="h-4 w-4 text-orange-400" />
                  Último contato
                </div>
                <div className="text-lg font-semibold text-white">{formatDate(lead.ultimo_contato)}</div>
                <div className="mt-1 text-xs text-zinc-400">Acompanhamento do relacionamento</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-zinc-400">
                  <Sparkles className="h-4 w-4 text-orange-400" />
                  Faixa de interesse
                </div>
                <div className="text-lg font-semibold text-white">
                  {lead.fixa_preco_max || lead.fixa_preco_min
                    ? `${formatCurrency(lead.fixa_preco_min || 0)} · ${formatCurrency(lead.fixa_preco_max || 0)}`
                    : "Não informada"}
                </div>
                <div className="mt-1 text-xs text-zinc-400">Parâmetro de negociação</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 px-6 py-6 md:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/8 bg-gradient-to-b from-white/6 to-white/[0.03] p-5 shadow-[0_20px_80px_rgba(0,0,0,0.22)]">
              <div className="mb-4 flex items-center gap-2 text-sm font-medium text-white">
                <UserRound className="h-4 w-4 text-orange-400" />
                Dados de contato
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {detailItems.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/8 bg-black/20 p-4">
                    <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-zinc-500">
                      <item.icon className="h-4 w-4 text-orange-400" />
                      {item.label}
                    </div>
                    <div className="text-sm font-medium leading-6 text-zinc-100">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/8 bg-gradient-to-b from-white/6 to-white/[0.03] p-5 shadow-[0_20px_80px_rgba(0,0,0,0.22)]">
              <div className="mb-4 flex items-center gap-2 text-sm font-medium text-white">
                <Building2 className="h-4 w-4 text-orange-400" />
                Perfil comercial
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Tipo de imóvel</div>
                  <div className="mt-2 text-sm font-medium text-zinc-100">{lead.tipo_imovel || "Não informado"}</div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Origem</div>
                  <div className="mt-2 text-sm font-medium text-zinc-100">{lead.origem || "Não informada"}</div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Quartos e banheiros</div>
                  <div className="mt-2 text-sm font-medium text-zinc-100">
                    {lead.qtd_quartos || 0} quartos · {lead.qtd_banheiros || 0} banheiros
                  </div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">FGTS disponível</div>
                  <div className="mt-2 text-sm font-medium text-zinc-100">
                    {formatCurrency((lead.fgts || 0) + (lead.fgts_conjuge || 0))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-orange-500/15 bg-gradient-to-b from-orange-500/10 to-transparent p-5 shadow-[0_20px_80px_rgba(249,115,22,0.12)]">
              <div className="mb-4 flex items-center gap-2 text-sm font-medium text-white">
                <MessageSquareText className="h-4 w-4 text-orange-400" />
                Contexto do relacionamento
              </div>
              <div className="space-y-3 text-sm text-zinc-300">
                <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Observações</div>
                  <div className="mt-2 leading-6 text-zinc-100">
                    {lead.observacoes || "Nenhuma observação registrada até o momento."}
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Primeiro contato</div>
                    <div className="mt-2 text-sm font-medium text-zinc-100">{formatDate(lead.primeiro_contato)}</div>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Criado em</div>
                    <div className="mt-2 text-sm font-medium text-zinc-100">{formatDate(lead.created_at)}</div>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Estado civil</div>
                    <div className="mt-2 text-sm font-medium text-zinc-100">{lead.estado_civil || "Não informado"}</div>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Entrada</div>
                    <div className="mt-2 text-sm font-medium text-zinc-100">
                      {lead.tem_entrada ? formatCurrency(lead.entrada || 0) : "Ainda não informada"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/8 bg-gradient-to-b from-white/6 to-white/[0.03] p-5">
              <div className="mb-4 flex items-center gap-2 text-sm font-medium text-white">
                <Sparkles className="h-4 w-4 text-orange-400" />
                Sinais de qualificação
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-200">
                  {lead.tem_carteira_assinada ? "Carteira assinada" : "Sem carteira assinada"}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-200">
                  {lead.em_followup ? `Follow-up ativo · ${lead.followup_rodadas || 0} rodadas` : "Sem follow-up ativo"}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-200">
                  {lead.tem_entrada ? "Possui entrada" : "Sem entrada definida"}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-200">
                  Conversão: {formatDate(lead.conversao_data)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-white/5 bg-white/[0.02] px-6 py-5">
          <Button
            variant="outline"
            className="border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
            onClick={onClose}
          >
            Fechar
          </Button>
          {onOpenCommunication && (
            <Button
              variant="outline"
              className="border-white/10 bg-white/5 text-zinc-300 hover:bg-green-500/10 hover:text-green-400"
              onClick={() => onOpenCommunication(lead)}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Comunicação
            </Button>
          )}
          <Button
            className="bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-[0_12px_30px_rgba(249,115,22,0.28)] hover:from-orange-400 hover:to-amber-300"
            onClick={() => onEdit(lead)}
          >
            <EditIcon className="mr-2 h-4 w-4" />
            Editar lead
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
