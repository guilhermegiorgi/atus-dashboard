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
import { Mail, Phone, MapPin, DollarSign, Building2, EditIcon } from "lucide-react";

interface LeadDetailModalProps {
  lead: Lead;
  open: boolean;
  onClose: () => void;
}

const statusColors: Record<string, string> = {
  NOVO: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  EM_ATENDIMENTO: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  CONVERTIDO: "bg-green-500/20 text-green-400 border-green-500/30",
  PERDIDO: "bg-red-500/20 text-red-400 border-red-500/30",
};

export function LeadDetailModal({ lead, open, onClose }: LeadDetailModalProps) {
  const statusClass = statusColors[lead.status] || "bg-gray-500/20 text-gray-400 border-gray-500/30";

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md bg-zinc-950/95 backdrop-blur-xl border border-white/10 text-zinc-100">
        <DialogHeader className="pb-4 border-b border-white/5">
          <DialogTitle className="text-xl font-semibold text-white flex items-center gap-2">
            <span className="w-1 h-6 bg-orange-500 rounded-full" />
            {lead.nome_completo}
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Detalhes do lead
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">Status</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusClass}`}>
              {lead.status.replace("_", " ").toUpperCase()}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-zinc-300">
              <Mail className="w-4 h-4 text-orange-500" />
              <span className="text-sm">{lead.email}</span>
            </div>

            <div className="flex items-center gap-3 text-zinc-300">
              <Phone className="w-4 h-4 text-orange-500" />
              <span className="text-sm">{lead.telefone}</span>
            </div>

            <div className="flex items-center gap-3 text-zinc-300">
              <MapPin className="w-4 h-4 text-orange-500" />
              <span className="text-sm">{lead.localizacao}</span>
            </div>

            <div className="flex items-center gap-3 text-zinc-300">
              <DollarSign className="w-4 h-4 text-orange-500" />
              <span className="text-sm">Renda: {formatCurrency(lead.renda_comprovada)}</span>
            </div>

            <div className="flex items-center gap-3 text-zinc-300">
              <Building2 className="w-4 h-4 text-orange-500" />
              <span className="text-sm">Interesse: {lead.tipo_interesse}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-white/5 pt-4">
          <Button
            variant="outline"
            className="border-white/10 text-zinc-300 hover:bg-white/5 hover:text-white"
            onClick={onClose}
          >
            Fechar
          </Button>
          <Button
            className="bg-orange-500 hover:bg-orange-600 text-white"
            onClick={() => console.log("Edit lead", lead.id)}
          >
            <EditIcon className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
