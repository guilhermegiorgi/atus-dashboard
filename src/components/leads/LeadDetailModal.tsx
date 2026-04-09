"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lead } from "@/types/leads";

interface LeadDetailModalProps {
  lead: Lead;
  open: boolean;
  onClose: () => void;
  onEdit: (lead: Lead) => void;
}

export function LeadDetailModal({
  lead,
  open,
  onClose,
  onEdit,
}: LeadDetailModalProps) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{lead.nome_completo || "Lead sem nome"}</DialogTitle>
          <DialogDescription>
            Detalhe do lead com campos reais do AtusBot
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="space-y-4 rounded-xl border border-border/50 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Cadastro
            </h3>
            <div><strong>Telefone:</strong> {lead.telefone || "-"}</div>
            <div><strong>Email:</strong> {lead.email || "-"}</div>
            <div><strong>Status:</strong> {lead.status || "-"}</div>
            <div><strong>Fase:</strong> {lead.fase || "-"}</div>
            <div><strong>Tipo de interesse:</strong> {lead.tipo_interesse || "-"}</div>
          </section>

          <section className="space-y-4 rounded-xl border border-border/50 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Origem e Tracking
            </h3>
            <div><strong>Canal:</strong> {lead.canal_origem || "-"}</div>
            <div><strong>Sistema:</strong> {lead.sistema_origem || "-"}</div>
            <div><strong>Campanha:</strong> {lead.campanha_origem || "-"}</div>
            <div><strong>Tracked ref:</strong> {lead.tracked_codigo_ref || "-"}</div>
            <div><strong>Link click ID:</strong> {lead.link_click_id || "-"}</div>
            <div><strong>External lead ID:</strong> {lead.external_lead_id || "-"}</div>
          </section>

          <section className="space-y-4 rounded-xl border border-border/50 p-4 md:col-span-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Atendimento
            </h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">
                {lead.conversation_state || "Sem state humano"}
              </Badge>
              <Badge variant="outline">
                {lead.intervention_type || "Sem takeover legado"}
              </Badge>
              <Badge variant="outline">
                {lead.em_follow_up ? "Follow-up ativo" : "Sem follow-up ativo"}
              </Badge>
            </div>
            <div><strong>Resumo de qualificacao:</strong> {lead.resumo_qualificacao || "-"}</div>
            <div><strong>Origem detalhada:</strong> {lead.origem_detalhada || "-"}</div>
            <div>
              <strong>Atualizado em:</strong>{" "}
              {new Date(lead.updated_at).toLocaleString("pt-BR")}
            </div>
          </section>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Fechar</Button>
          <Button onClick={() => onEdit(lead)}>Editar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
