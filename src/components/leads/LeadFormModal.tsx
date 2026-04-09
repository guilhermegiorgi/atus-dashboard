"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LEAD_STATUSES, LeadFormValues, LeadStatus } from "@/types/leads";
import {
  Building2,
  CircleDollarSign,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  Sparkles,
  UserRound,
} from "lucide-react";

interface LeadFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  initialValues?: Partial<LeadFormValues>;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: LeadFormValues) => Promise<void> | void;
}

const defaultValues: LeadFormValues = {
  nome_completo: "",
  telefone: "",
  email: "",
  status: "NOVO",
  localizacao: "",
  origem: "",
  tipo_interesse: "",
  renda_comprovada: 0,
  observacoes: "",
};

const statusLabels: Record<LeadStatus, string> = {
  NOVO: "Novo",
  EM_ATENDIMENTO: "Em Atendimento",
  CONVERTIDO: "Convertido",
  PERDIDO: "Perdido",
  AGUARDANDO_RETORNO: "Aguardando Retorno",
};

export function LeadFormModal({
  open,
  mode,
  initialValues,
  loading = false,
  onClose,
  onSubmit,
}: LeadFormModalProps) {
  const [values, setValues] = useState<LeadFormValues>(defaultValues);

  const mergedValues = useMemo<LeadFormValues>(() => {
    const nextStatus = initialValues?.status;

    return {
      ...defaultValues,
      ...initialValues,
      status: LEAD_STATUSES.includes(nextStatus as LeadStatus) ? (nextStatus as LeadStatus) : "NOVO",
      renda_comprovada: Number(initialValues?.renda_comprovada || 0),
    };
  }, [initialValues]);

  useEffect(() => {
    if (open) {
      setValues(mergedValues);
    }
  }, [mergedValues, open]);

  const isCreateMode = mode === "create";
  const currentStatus = values.status ?? "NOVO";
  const rendaComprovada = values.renda_comprovada ?? 0;
  const localizacao = values.localizacao ?? "";
  const origem = values.origem ?? "";
  const observacoes = values.observacoes ?? "";
  const statusTone =
    currentStatus === "CONVERTIDO"
      ? "text-green-300 border-green-500/30 bg-green-500/10"
      : currentStatus === "PERDIDO"
        ? "text-red-300 border-red-500/30 bg-red-500/10"
        : currentStatus === "EM_ATENDIMENTO"
          ? "text-blue-300 border-blue-500/30 bg-blue-500/10"
          : "text-amber-200 border-amber-500/30 bg-amber-500/10";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit({
      ...values,
      telefone: values.telefone.trim(),
      nome_completo: values.nome_completo.trim(),
      email: values.email.trim(),
      localizacao: (values.localizacao ?? "").trim(),
      origem: (values.origem ?? "").trim(),
      tipo_interesse: values.tipo_interesse.trim(),
      observacoes: (values.observacoes ?? "").trim(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="w-[95vw] max-w-6xl xl:max-w-7xl max-h-[90vh] overflow-y-auto overflow-x-hidden border border-white/10 bg-zinc-950/95 p-0 text-zinc-100 backdrop-blur-xl">
        <div className="relative overflow-hidden border-b border-white/5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.3),transparent_35%),radial-gradient(circle_at_top_left,rgba(251,191,36,0.12),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0))]" />
          <div className="relative grid gap-6 px-6 py-6 md:grid-cols-[1.5fr_0.9fr]">
            <DialogHeader className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 text-white shadow-[0_0_40px_rgba(249,115,22,0.22)]">
                  <UserRound className="h-7 w-7" />
                </div>
                <div className="space-y-3">
                  <div className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${statusTone}`}>
                    {statusLabels[currentStatus]}
                  </div>
                  <DialogTitle className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
                    {isCreateMode ? "Criar lead premium" : "Refinar lead premium"}
                  </DialogTitle>
                  <DialogDescription className="max-w-2xl text-sm leading-6 text-zinc-300">
                    {isCreateMode
                      ? "Registre o lead com contexto comercial completo para iniciar uma operação mais sofisticada."
                      : "Atualize o perfil do lead com mais contexto, qualificação e clareza para o time comercial."}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-zinc-400">
                  <CircleDollarSign className="h-4 w-4 text-orange-400" />
                  Renda
                </div>
                <div className="text-lg font-semibold text-white">
                  {rendaComprovada > 0
                    ? rendaComprovada.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                    : "A definir"}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-zinc-400">
                  <Building2 className="h-4 w-4 text-orange-400" />
                  Interesse
                </div>
                <div className="text-lg font-semibold text-white">{values.tipo_interesse || "Não informado"}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-zinc-400">
                  <Sparkles className="h-4 w-4 text-orange-400" />
                  Origem
                </div>
                <div className="text-lg font-semibold text-white">{origem || "Não informada"}</div>
              </div>
            </div>
          </div>
        </div>

        <form className="grid gap-6 px-6 py-6 md:grid-cols-[1.15fr_0.85fr]" onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/8 bg-gradient-to-b from-white/6 to-white/[0.03] p-5 shadow-[0_20px_80px_rgba(0,0,0,0.22)]">
              <div className="mb-4 flex items-center gap-2 text-sm font-medium text-white">
                <UserRound className="h-4 w-4 text-orange-400" />
                Identificação do lead
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-zinc-200" htmlFor="lead-nome">
                    Nome completo
                  </label>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    <Input
                      id="lead-nome"
                      value={values.nome_completo}
                      onChange={(event) => setValues((current) => ({ ...current, nome_completo: event.target.value }))}
                      placeholder="Ex.: João da Silva"
                      className="border-white/10 bg-secondary/50 pl-10 focus:border-orange-500/50"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-200" htmlFor="lead-telefone">
                    Telefone
                  </label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    <Input
                      id="lead-telefone"
                      value={values.telefone}
                      onChange={(event) => setValues((current) => ({ ...current, telefone: event.target.value }))}
                      placeholder="5565999999999"
                      className="border-white/10 bg-secondary/50 pl-10 focus:border-orange-500/50"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-200" htmlFor="lead-email">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    <Input
                      id="lead-email"
                      type="email"
                      value={values.email}
                      onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
                      placeholder="cliente@exemplo.com"
                      className="border-white/10 bg-secondary/50 pl-10 focus:border-orange-500/50"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/8 bg-gradient-to-b from-white/6 to-white/[0.03] p-5 shadow-[0_20px_80px_rgba(0,0,0,0.22)]">
              <div className="mb-4 flex items-center gap-2 text-sm font-medium text-white">
                <Sparkles className="h-4 w-4 text-orange-400" />
                Qualificação comercial
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-200">Status</label>
                  <Select
                    value={currentStatus}
                    onValueChange={(value) => setValues((current) => ({ ...current, status: value as LeadStatus }))}
                  >
                    <SelectTrigger className="w-full border-white/10 bg-secondary/50 focus:border-orange-500/50">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      {LEAD_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {statusLabels[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-200" htmlFor="lead-renda">
                    Renda comprovada
                  </label>
                  <div className="relative">
                    <CircleDollarSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    <Input
                      id="lead-renda"
                      type="number"
                      min="0"
                      step="0.01"
                      value={rendaComprovada}
                      onChange={(event) =>
                        setValues((current) => ({
                          ...current,
                          renda_comprovada: Number(event.target.value || 0),
                        }))
                      }
                      className="border-white/10 bg-secondary/50 pl-10 focus:border-orange-500/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-200" htmlFor="lead-localizacao">
                    Localização
                  </label>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    <Input
                      id="lead-localizacao"
                      value={localizacao}
                      onChange={(event) => setValues((current) => ({ ...current, localizacao: event.target.value }))}
                      placeholder="Ex.: Cuiabá - MT"
                      className="border-white/10 bg-secondary/50 pl-10 focus:border-orange-500/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-200" htmlFor="lead-origem">
                    Origem
                  </label>
                  <div className="relative">
                    <Sparkles className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    <Input
                      id="lead-origem"
                      value={origem}
                      onChange={(event) => setValues((current) => ({ ...current, origem: event.target.value }))}
                      placeholder="Ex.: Facebook Ads"
                      className="border-white/10 bg-secondary/50 pl-10 focus:border-orange-500/50"
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-zinc-200" htmlFor="lead-interesse">
                    Interesse
                  </label>
                  <div className="relative">
                    <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    <Input
                      id="lead-interesse"
                      value={values.tipo_interesse}
                      onChange={(event) => setValues((current) => ({ ...current, tipo_interesse: event.target.value }))}
                      placeholder="Ex.: Apartamento 2 quartos"
                      className="border-white/10 bg-secondary/50 pl-10 focus:border-orange-500/50"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-orange-500/15 bg-gradient-to-b from-orange-500/10 to-transparent p-5 shadow-[0_20px_80px_rgba(249,115,22,0.12)]">
              <div className="mb-4 flex items-center gap-2 text-sm font-medium text-white">
                <MessageSquareText className="h-4 w-4 text-orange-400" />
                Notas do atendimento
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-200" htmlFor="lead-observacoes">
                  Observações
                </label>
                <textarea
                  id="lead-observacoes"
                      value={observacoes}
                  onChange={(event) => setValues((current) => ({ ...current, observacoes: event.target.value }))}
                  placeholder="Registre informações úteis sobre o momento do lead, objeções, contexto familiar e intenção de compra."
                  className="min-h-52 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-500 focus:border-orange-500/50"
                />
              </div>
            </div>

            <div className="rounded-3xl border border-white/8 bg-gradient-to-b from-white/6 to-white/[0.03] p-5">
              <div className="mb-4 flex items-center gap-2 text-sm font-medium text-white">
                <Sparkles className="h-4 w-4 text-orange-400" />
                Resumo em tempo real
              </div>
              <div className="space-y-3">
                <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Lead</div>
                  <div className="mt-2 text-sm font-medium leading-6 text-zinc-100">
                    {values.nome_completo || "Nome ainda não preenchido"}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Contato principal</div>
                  <div className="mt-2 text-sm font-medium leading-6 text-zinc-100">
                    {values.email || values.telefone || "Sem contato informado"}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Posicionamento comercial</div>
                  <div className="mt-2 text-sm font-medium leading-6 text-zinc-100">
                    {statusLabels[currentStatus]} · {values.tipo_interesse || "Interesse em definição"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-white/5 bg-white/[0.02] px-0 pt-5 md:col-span-2">
            <Button
              type="button"
              variant="outline"
              className="border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-[0_12px_30px_rgba(249,115,22,0.28)] hover:from-orange-400 hover:to-amber-300"
              disabled={loading}
            >
              {loading ? "Salvando..." : isCreateMode ? "Criar lead" : "Salvar alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
