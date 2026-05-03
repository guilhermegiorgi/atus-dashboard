"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  Clock,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";
import { api } from "@/lib/api/client";
import {
  FollowupMetrics,
  FollowupQueueFilters,
  LeadAction,
  OperationalQueueItem,
  OperationalStatus,
} from "@/types/dashboard";
import { getOffsetForPage } from "@/lib/leads/query-state";

const PAGE_SIZE = 20;

const EMPTY_METRICS: FollowupMetrics = {
  expired_followups: 0,
  active_followups: 0,
  followups_sent_today: 0,
  followup_responses_today: 0,
  stuck_followups: 0,
  contaminated_leads: 0,
  sent_last_7_days: 0,
  responses_last_7_days: 0,
};

function actionLabel(action: string) {
  switch (action) {
    case "START_FOLLOWUP":
      return "Iniciou follow-up";
    case "RESET_FOLLOWUP":
      return "Resetou follow-up";
    case "MANUAL_UPDATE":
      return "Atualizacao manual";
    default:
      return action;
  }
}

function recommendedActionLabel(action: string) {
  switch (action) {
    case "start_followup":
      return "Iniciar follow-up";
    case "continue_waiting":
      return "Continuar aguardando";
    case "reset_then_followup":
      return "Resetar e retomar";
    case "manual_review":
      return "Revisao manual";
    case "human_takeover_active":
      return "Takeover humano";
    default:
      return action || "-";
  }
}

function actionTone(action: string) {
  switch (action) {
    case "start_followup":
      return "border-dd-accent-green/20 bg-dd-accent-green/10 text-dd-accent-green";
    case "reset_then_followup":
      return "border-dd-accent-orange/20 bg-dd-accent-orange/10 text-dd-accent-orange";
    case "manual_review":
      return "border-dd-accent-orange/20 bg-dd-accent-orange/10 text-dd-accent-orange";
    case "human_takeover_active":
      return "border-dd-accent-blue/20 bg-dd-accent-blue/10 text-dd-accent-blue";
    default:
      return "border-dd-border-subtle bg-dd-surface-overlay/10 text-foreground";
  }
}

export default function PipelinePage() {
  const [filters, setFilters] = useState<FollowupQueueFilters>({
    limit: PAGE_SIZE,
    offset: 0,
  });
  const [queue, setQueue] = useState<OperationalQueueItem[]>([]);
  const [meta, setMeta] = useState({ total: 0, limit: PAGE_SIZE, offset: 0 });
  const [metrics, setMetrics] = useState<FollowupMetrics>(EMPTY_METRICS);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] =
    useState<OperationalStatus | null>(null);
  const [selectedActions, setSelectedActions] = useState<LeadAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestFingerprint = JSON.stringify(filters);

  const loadQueue = useCallback(
    async (currentFilters: FollowupQueueFilters) => {
      setLoading(true);
      setError(null);

      const [queueResult, metricsResult] = await Promise.all([
        api.getFollowupQueue(currentFilters),
        api.getFollowupMetrics(),
      ]);

      const firstError = queueResult.error ?? metricsResult.error ?? null;

      if (firstError || !queueResult.data) {
        setError(firstError ?? "Erro ao carregar fila operacional");
        setLoading(false);
        return;
      }

      setQueue(queueResult.data.data);
      setMeta(queueResult.data.meta);
      setMetrics(metricsResult.data ?? EMPTY_METRICS);
      setLoading(false);
    },
    [],
  );

  const loadLeadDetails = useCallback(async (leadId: string) => {
    setDetailLoading(true);

    const [statusResult, actionsResult] = await Promise.all([
      api.getLeadOperationalStatus(leadId),
      api.getLeadActions(leadId, 20, 0),
    ]);

    if (statusResult.error || actionsResult.error) {
      setError(
        statusResult.error ??
          actionsResult.error ??
          "Erro ao carregar detalhe operacional",
      );
      setDetailLoading(false);
      return;
    }

    setSelectedStatus(statusResult.data ?? null);
    setSelectedActions(actionsResult.data?.data ?? []);
    setDetailLoading(false);
  }, []);

  useEffect(() => {
    void loadQueue(filters);
  }, [filters, loadQueue, requestFingerprint]);

  useEffect(() => {
    if (!selectedLeadId) {
      setSelectedStatus(null);
      setSelectedActions([]);
      return;
    }

    void loadLeadDetails(selectedLeadId);
  }, [selectedLeadId, loadLeadDetails]);

  const totalPages = Math.max(1, Math.ceil(meta.total / meta.limit));
  const currentPage = Math.floor(meta.offset / meta.limit) + 1;
  const selectedRow = useMemo(
    () => queue.find((item) => item.lead_id === selectedLeadId) ?? null,
    [queue, selectedLeadId],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 rounded-full border-2 border-dd-border-subtle border-t-dd-on-muted animate-spin" />
          <p className="text-dd-on-muted text-xs">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-dd-accent-red text-center">
          <p className="text-sm font-medium">Erro ao carregar</p>
          <p className="text-xs text-dd-on-muted mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Fila Operacional</h1>
        <p className="text-dd-on-muted">
          Leads travados, contaminados ou prontos para retomada automatica
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card className="card-premium">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-dd-on-muted">
              Na fila
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{meta.total}</div>
            <p className="mt-1 text-xs text-dd-on-muted">
              Total paginado da fila operacional
            </p>
          </CardContent>
        </Card>
        <Card className="card-premium">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-dd-on-muted">
              Expirados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-dd-accent-orange">
              {metrics.expired_followups}
            </div>
            <p className="mt-1 text-xs text-dd-on-muted">
              Precisam de retomada imediata
            </p>
          </CardContent>
        </Card>
        <Card className="card-premium">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-dd-on-muted">
              Contaminados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-dd-accent-orange">
              {metrics.contaminated_leads}
            </div>
            <p className="mt-1 text-xs text-dd-on-muted">
              Exigem revisao antes de lote
            </p>
          </CardContent>
        </Card>
        <Card className="card-premium">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-dd-on-muted">
              Respostas Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-dd-accent-green">
              {metrics.followup_responses_today}
            </div>
            <p className="mt-1 text-xs text-dd-on-muted">
              Retornos capturados pelo follow-up
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="card-premium">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Use apenas os filtros canonicos da fila operacional
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Input
            placeholder="Status"
            value={filters.status ?? ""}
            onChange={(event) =>
              setFilters({
                ...filters,
                status: event.target.value || undefined,
                offset: 0,
              })
            }
          />
          <Input
            placeholder="Fase"
            value={filters.fase ?? ""}
            onChange={(event) =>
              setFilters({
                ...filters,
                fase: event.target.value || undefined,
                offset: 0,
              })
            }
          />
          <Input
            placeholder="Tipo de interesse"
            value={filters.tipo_interesse ?? ""}
            onChange={(event) =>
              setFilters({
                ...filters,
                tipo_interesse: event.target.value || undefined,
                offset: 0,
              })
            }
          />
          <Input
            placeholder="Canal de origem"
            value={filters.canal_origem ?? ""}
            onChange={(event) =>
              setFilters({
                ...filters,
                canal_origem: event.target.value || undefined,
                offset: 0,
              })
            }
          />
          <Input
            placeholder="Sistema de origem"
            value={filters.sistema_origem ?? ""}
            onChange={(event) =>
              setFilters({
                ...filters,
                sistema_origem: event.target.value || undefined,
                offset: 0,
              })
            }
          />
          <Input
            placeholder="Estado de triagem"
            value={filters.triage_state ?? ""}
            onChange={(event) =>
              setFilters({
                ...filters,
                triage_state: event.target.value || undefined,
                offset: 0,
              })
            }
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant={filters.expired_only ? "default" : "outline"}
              onClick={() =>
                setFilters({
                  ...filters,
                  expired_only: !filters.expired_only,
                  offset: 0,
                })
              }
            >
              <Clock className="mr-2 h-4 w-4" />
              Expirados
            </Button>
            <Button
              type="button"
              variant={filters.only_contaminated ? "default" : "outline"}
              onClick={() =>
                setFilters({
                  ...filters,
                  only_contaminated: !filters.only_contaminated,
                  offset: 0,
                })
              }
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Contaminados
            </Button>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setFilters({ limit: PAGE_SIZE, offset: 0 })}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Limpar filtros
          </Button>
        </CardContent>
      </Card>

      <Card className="card-premium">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Fila</CardTitle>
              <CardDescription>
                Pagina {currentPage} de {totalPages}
              </CardDescription>
            </div>
            <Badge variant="secondary">{meta.total} itens</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {queue.length === 0 ? (
            <div className="py-16 text-center text-dd-on-muted">
              Nenhum lead encontrado para os filtros atuais.
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-dd-border-subtle">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lead</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Origem</TableHead>
                    <TableHead>Proximo campo</TableHead>
                    <TableHead>Acao recomendada</TableHead>
                    <TableHead className="text-right">Selecionar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {queue.map((item) => (
                    <TableRow
                      key={item.lead_id}
                      className={
                        item.lead_id === selectedLeadId
                          ? "bg-dd-surface-overlay/10"
                          : ""
                      }
                    >
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{item.telefone}</div>
                          <div className="text-xs text-dd-on-muted">
                            {item.qualification_summary ||
                              "Sem resumo de qualificacao"}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {item.is_contaminated && (
                              <Badge
                                variant="outline"
                                className="border-dd-accent-orange/20 bg-dd-accent-orange/10 text-dd-accent-orange"
                              >
                                Contaminado
                              </Badge>
                            )}
                            {item.confirmation_pending && (
                              <Badge
                                variant="outline"
                                className="border-dd-accent-blue/20 bg-dd-accent-blue/10 text-dd-accent-blue"
                              >
                                Confirmacao pendente
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div>{item.status || "-"}</div>
                          <div className="text-xs text-dd-on-muted">
                            {item.fase || "-"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div>{item.canal_origem || "-"}</div>
                          <div className="text-xs text-dd-on-muted">
                            {item.sistema_origem || "-"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.next_field || "-"}
                        {item.missing_fields.length > 0 && (
                          <div className="text-xs text-dd-on-muted">
                            Faltando: {item.missing_fields.join(", ")}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={actionTone(item.recommended_action)}
                        >
                          {recommendedActionLabel(item.recommended_action)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          onClick={() => setSelectedLeadId(item.lead_id)}
                        >
                          Ver detalhe
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <Pagination className="mt-6 justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  text="Anterior"
                  onClick={(event) => {
                    event.preventDefault();
                    if (currentPage === 1) return;
                    setFilters({
                      ...filters,
                      offset: getOffsetForPage(currentPage - 1, meta.limit),
                    });
                  }}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  {currentPage}
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  text="Proxima"
                  onClick={(event) => {
                    event.preventDefault();
                    if (currentPage >= totalPages) return;
                    setFilters({
                      ...filters,
                      offset: getOffsetForPage(currentPage + 1, meta.limit),
                    });
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardContent>
      </Card>

      <Card className="card-premium">
        <CardHeader>
          <CardTitle>Detalhe Operacional</CardTitle>
          <CardDescription>
            {selectedRow
              ? `Lead ${selectedRow.telefone}`
              : "Selecione um lead da fila para ver o detalhe operacional"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!selectedLeadId ? (
            <div className="py-12 text-dd-on-muted">
              Nenhum lead selecionado.
            </div>
          ) : detailLoading ? (
            <div className="py-12 text-dd-on-muted">
              Carregando detalhe operacional...
            </div>
          ) : !selectedStatus ? (
            <div className="py-12 text-dd-on-muted">
              Sem detalhe operacional disponível.
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4">
                <div className="rounded-xl border border-dd-border-subtle p-4">
                  <div className="text-xs uppercase tracking-wide text-dd-on-muted">
                    Recomendacao atual
                  </div>
                  <div className="mt-2">
                    <Badge
                      variant="outline"
                      className={actionTone(selectedStatus.recommended_action)}
                    >
                      {recommendedActionLabel(
                        selectedStatus.recommended_action,
                      )}
                    </Badge>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-dd-border-subtle p-4">
                    <div className="text-xs uppercase tracking-wide text-dd-on-muted">
                      Proximo campo
                    </div>
                    <div className="mt-2 font-medium">
                      {selectedStatus.next_field || "-"}
                    </div>
                  </div>
                  <div className="rounded-xl border border-dd-border-subtle p-4">
                    <div className="text-xs uppercase tracking-wide text-dd-on-muted">
                      Tracking
                    </div>
                    <div className="mt-2 font-medium">
                      {selectedStatus.tracked_codigo_ref ||
                        selectedStatus.campanha_origem ||
                        "-"}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-dd-border-subtle p-4">
                  <div className="text-xs uppercase tracking-wide text-dd-on-muted">
                    Campos faltantes
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedStatus.missing_fields.length > 0 ? (
                      selectedStatus.missing_fields.map((field) => (
                        <Badge key={field} variant="secondary">
                          {field}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-dd-on-muted">
                        Nenhum campo faltante.
                      </span>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-dd-border-subtle p-4">
                  <div className="text-xs uppercase tracking-wide text-dd-on-muted">
                    Ultima interacao
                  </div>
                  <div className="mt-3 space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <Bot className="mt-0.5 h-4 w-4 text-primary" />
                      <div>
                        <div className="text-xs text-dd-on-muted">
                          Ultima mensagem do bot
                        </div>
                        <div>{selectedStatus.last_bot_message || "-"}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-dd-accent-green" />
                      <div>
                        <div className="text-xs text-dd-on-muted">
                          Ultima mensagem do lead
                        </div>
                        <div>{selectedStatus.last_lead_message || "-"}</div>
                      </div>
                    </div>
                    <div className="text-xs text-dd-on-muted">
                      Direcao: {selectedStatus.last_message_direction || "-"}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-dd-border-subtle p-4">
                  <div className="text-xs uppercase tracking-wide text-dd-on-muted">
                    Resumo de qualificacao
                  </div>
                  <div className="mt-2 text-sm">
                    {selectedStatus.qualification_summary || "-"}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-dd-border-subtle p-4">
                  <div className="text-xs uppercase tracking-wide text-dd-on-muted">
                    Sinais operacionais
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="outline">
                      {selectedStatus.status || "-"}
                    </Badge>
                    <Badge variant="outline">
                      {selectedStatus.fase || "-"}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={
                        selectedStatus.is_contaminated
                          ? "border-dd-accent-orange/20 bg-dd-accent-orange/10 text-dd-accent-orange"
                          : "border-dd-accent-green/20 bg-dd-accent-green/10 text-dd-accent-green"
                      }
                    >
                      {selectedStatus.is_contaminated
                        ? "Contaminado"
                        : "Nao contaminado"}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={
                        selectedStatus.confirmation_pending
                          ? "border-dd-accent-blue/20 bg-dd-accent-blue/10 text-dd-accent-blue"
                          : "border-dd-border-subtle"
                      }
                    >
                      {selectedStatus.confirmation_pending
                        ? "Confirmacao pendente"
                        : "Sem confirmacao pendente"}
                    </Badge>
                    {selectedStatus.intervention_type && (
                      <Badge
                        variant="outline"
                        className="border-dd-accent-blue/20 bg-dd-accent-blue/10 text-dd-accent-blue"
                      >
                        <ShieldAlert className="mr-1 h-3 w-3" />
                        {selectedStatus.intervention_type}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-dd-border-subtle p-4">
                  <div className="text-xs uppercase tracking-wide text-dd-on-muted">
                    Timeline de acoes
                  </div>
                  <div className="mt-3 space-y-3">
                    {selectedActions.length > 0 ? (
                      selectedActions.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-lg border border-dd-border-subtle p-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="font-medium">
                              {actionLabel(item.action)}
                            </div>
                            <Badge variant="outline">{item.status}</Badge>
                          </div>
                          <div className="mt-1 text-xs text-dd-on-muted">
                            Ator: {item.actor} ·{" "}
                            {new Date(item.created_at).toLocaleString("pt-BR")}
                          </div>
                          {item.details && (
                            <div className="mt-2 text-xs text-dd-on-muted break-all">
                              {item.details}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-dd-on-muted">
                        Nenhuma acao recente.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
