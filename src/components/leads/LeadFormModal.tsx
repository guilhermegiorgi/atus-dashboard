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
import { Textarea } from "@/components/ui/textarea";
import { LEAD_STATUSES, LeadFormValues, LeadStatus } from "@/types/leads";

interface LeadFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  initialValues?: Partial<LeadFormValues>;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: LeadFormValues) => Promise<void> | void;
}

const DEFAULT_VALUES: LeadFormValues = {
  nome_completo: "",
  telefone: "",
  email: "",
  tipo_interesse: "",
  campanha_origem: "",
  mensagem_inicial: "",
  estado_civil: "",
  aniversario: "",
  renda_comprovada: 0,
  renda_comprovada_conjuge: 0,
  fgts: 0,
  fgts_conjuge: 0,
  tem_entrada: false,
  entrada: 0,
  tem_carteira_assinada: false,
  status: "NOVO",
  observacoes: "",
};

export function LeadFormModal({
  open,
  mode,
  initialValues,
  loading = false,
  onClose,
  onSubmit,
}: LeadFormModalProps) {
  const [values, setValues] = useState<LeadFormValues>(DEFAULT_VALUES);
  const isCreate = mode === "create";

  const mergedValues = useMemo(() => {
    const nextStatus = initialValues?.status;

    return {
      ...DEFAULT_VALUES,
      ...initialValues,
      status: LEAD_STATUSES.includes(nextStatus as LeadStatus)
        ? (nextStatus as LeadStatus)
        : "NOVO",
    };
  }, [initialValues]);

  useEffect(() => {
    if (open) {
      setValues(mergedValues);
    }
  }, [mergedValues, open]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onSubmit({
      ...values,
      nome_completo: values.nome_completo.trim(),
      telefone: values.telefone.trim(),
      email: values.email.trim(),
      tipo_interesse: values.tipo_interesse.trim(),
      campanha_origem: values.campanha_origem?.trim() || "",
      mensagem_inicial: values.mensagem_inicial?.trim() || "",
      observacoes: values.observacoes?.trim() || "",
    });
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="w-[min(94vw,1400px)] h-[88vh] max-w-none overflow-hidden p-0 sm:max-w-none">
        <DialogHeader className="shrink-0 border-b border-border/50 px-6 py-5">
          <DialogTitle>{isCreate ? "Novo lead interno" : "Editar lead"}</DialogTitle>
          <DialogDescription>
            {isCreate
              ? "O cadastro manual usa /api/v1/inbound/leads com canal INTERNO e sistema DASHBOARD."
              : "A edicao usa apenas os campos suportados por PUT /api/v1/leads/:id."}
          </DialogDescription>
        </DialogHeader>

        <form className="flex h-full min-h-0 flex-col" onSubmit={handleSubmit}>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
            <div className="grid gap-6 xl:grid-cols-2">
              <section className="space-y-4 rounded-2xl border border-border/50 bg-background/50 p-5">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Dados basicos
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Identificacao principal e canal de contato do lead.
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium" htmlFor="lead-nome">
                      Nome completo
                    </label>
                    <Input
                      id="lead-nome"
                      value={values.nome_completo}
                      onChange={(event) =>
                        setValues({ ...values, nome_completo: event.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="lead-telefone">
                      Telefone
                    </label>
                    <Input
                      id="lead-telefone"
                      value={values.telefone}
                      onChange={(event) =>
                        setValues({ ...values, telefone: event.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="lead-email">
                      Email
                    </label>
                    <Input
                      id="lead-email"
                      value={values.email}
                      onChange={(event) =>
                        setValues({ ...values, email: event.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium" htmlFor="lead-tipo-interesse">
                      Tipo de interesse
                    </label>
                    <Input
                      id="lead-tipo-interesse"
                      value={values.tipo_interesse}
                      onChange={(event) =>
                        setValues({ ...values, tipo_interesse: event.target.value })
                      }
                      placeholder="COMPRA, ALUGUEL..."
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-4 rounded-2xl border border-border/50 bg-background/50 p-5">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Origem e intake
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Contexto inicial do cadastro e da entrada manual no dashboard.
                  </p>
                </div>

                {isCreate ? (
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="lead-campanha-origem">
                        Campanha de origem
                      </label>
                      <Input
                        id="lead-campanha-origem"
                        value={values.campanha_origem ?? ""}
                        onChange={(event) =>
                          setValues({ ...values, campanha_origem: event.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="lead-mensagem-inicial">
                        Mensagem inicial
                      </label>
                      <Textarea
                        id="lead-mensagem-inicial"
                        value={values.mensagem_inicial ?? ""}
                        onChange={(event) =>
                          setValues({ ...values, mensagem_inicial: event.target.value })
                        }
                        className="min-h-36"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status</label>
                      <Select
                        value={values.status}
                        onValueChange={(status) =>
                          setValues({ ...values, status: status as LeadStatus })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                        <SelectContent>
                          {LEAD_STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="lead-estado-civil">
                        Estado civil
                      </label>
                      <Input
                        id="lead-estado-civil"
                        value={values.estado_civil ?? ""}
                        onChange={(event) =>
                          setValues({ ...values, estado_civil: event.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="lead-aniversario">
                        Aniversario
                      </label>
                      <Input
                        id="lead-aniversario"
                        type="date"
                        value={values.aniversario ?? ""}
                        onChange={(event) =>
                          setValues({ ...values, aniversario: event.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="lead-renda">
                        Renda comprovada
                      </label>
                      <Input
                        id="lead-renda"
                        type="number"
                        value={values.renda_comprovada ?? 0}
                        onChange={(event) =>
                          setValues({
                            ...values,
                            renda_comprovada: Number(event.target.value || 0),
                          })
                        }
                      />
                    </div>
                  </div>
                )}
              </section>

              <section className="space-y-4 rounded-2xl border border-border/50 bg-background/50 p-5">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Qualificacao e financeiro
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Campos usados na edicao operacional do lead.
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="lead-renda-conjuge">
                      Renda conjuge
                    </label>
                    <Input
                      id="lead-renda-conjuge"
                      type="number"
                      value={values.renda_comprovada_conjuge ?? 0}
                      onChange={(event) =>
                        setValues({
                          ...values,
                          renda_comprovada_conjuge: Number(event.target.value || 0),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="lead-fgts">
                      FGTS
                    </label>
                    <Input
                      id="lead-fgts"
                      type="number"
                      value={values.fgts ?? 0}
                      onChange={(event) =>
                        setValues({ ...values, fgts: Number(event.target.value || 0) })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="lead-fgts-conjuge">
                      FGTS conjuge
                    </label>
                    <Input
                      id="lead-fgts-conjuge"
                      type="number"
                      value={values.fgts_conjuge ?? 0}
                      onChange={(event) =>
                        setValues({
                          ...values,
                          fgts_conjuge: Number(event.target.value || 0),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="lead-entrada">
                      Entrada
                    </label>
                    <Input
                      id="lead-entrada"
                      type="number"
                      value={values.entrada ?? 0}
                      onChange={(event) =>
                        setValues({ ...values, entrada: Number(event.target.value || 0) })
                      }
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-4 rounded-2xl border border-border/50 bg-background/50 p-5">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Observacoes
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Campo livre para contexto operacional adicional.
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="lead-observacoes">
                    Observacoes
                  </label>
                  <Textarea
                    id="lead-observacoes"
                    value={values.observacoes ?? ""}
                    onChange={(event) =>
                      setValues({ ...values, observacoes: event.target.value })
                    }
                    className="min-h-40"
                  />
                </div>
              </section>
            </div>
          </div>

          <DialogFooter className="shrink-0 border-t border-border/50 px-6 py-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
