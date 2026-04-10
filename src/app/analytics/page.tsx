"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api/client";
import { getOffsetForPage } from "@/lib/leads/query-state";
import {
  AnalyticsFilters,
  AnalyticsGroupedRow,
  AnalyticsLeadRow,
  AnalyticsOverview,
  AnalyticsTimeseriesPoint,
} from "@/types/dashboard";
import {
  BarChart3,
  Clock3,
  Filter,
  LineChart,
  RefreshCcw,
  Sparkles,
  Target,
  Trophy,
  Users,
} from "lucide-react";

const PAGE_SIZE = 10;

const EMPTY_OVERVIEW: AnalyticsOverview = {
  total_leads: 0,
  novos_leads: 0,
  leads_em_tratativa: 0,
  takeovers_humanos: 0,
  leads_com_tracking: 0,
  conversoes_operacionais: 0,
  conversoes_comerciais: 0,
  taxa_conversao_operacional: 0,
  taxa_conversao_comercial: 0,
};

const EMPTY_META = { total: 0, limit: PAGE_SIZE, offset: 0 };

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function formatDate(value: string) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value: string) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function bucketTone(bucket: string) {
  switch (bucket) {
    case "alto":
      return "border-green-500/20 bg-green-500/10 text-green-400";
    case "medio":
      return "border-amber-500/20 bg-amber-500/10 text-amber-300";
    case "baixo":
      return "border-red-500/20 bg-red-500/10 text-red-300";
    default:
      return "border-border/50 bg-secondary/30 text-foreground";
  }
}

function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: typeof Users;
}) {
  return (
    <Card className="glass border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className="rounded-xl border border-primary/20 bg-primary/10 p-2 text-primary">
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function GroupedMetricsTable({
  title,
  description,
  rows,
}: {
  title: string;
  description: string;
  rows: AnalyticsGroupedRow[];
}) {
  return (
    <Card className="glass border-border/50">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Grupo</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Conv. op.</TableHead>
              <TableHead>Conv. com.</TableHead>
              <TableHead>Prontidao</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Sem dados para os filtros atuais
                </TableCell>
              </TableRow>
            ) : (
              rows.slice(0, 6).map((row) => (
                <TableRow key={`${title}-${row.key}`}>
                  <TableCell>
                    <div className="font-medium">{row.label || row.key || "-"}</div>
                    <div className="text-xs text-muted-foreground">
                      Potencial medio {row.score_potencial_medio.toFixed(1)}
                    </div>
                  </TableCell>
                  <TableCell>{row.total_leads}</TableCell>
                  <TableCell>{row.conversoes_operacionais}</TableCell>
                  <TableCell>{row.conversoes_comerciais}</TableCell>
                  <TableCell>{row.score_prontidao_medio.toFixed(1)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function LeadRankingTable({
  title,
  description,
  rows,
  meta,
  page,
  onPageChange,
}: {
  title: string;
  description: string;
  rows: AnalyticsLeadRow[];
  meta: { total: number; limit: number; offset: number };
  page: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(meta.total / Math.max(meta.limit, 1)));

  return (
    <Card className="glass border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="text-xs text-muted-foreground">
            {meta.total} registro(s)
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lead</TableHead>
              <TableHead>Tracking</TableHead>
              <TableHead>Prontidao</TableHead>
              <TableHead>Potencial</TableHead>
              <TableHead>Atualizado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Sem leads para os filtros atuais
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={`${title}-${row.lead_id}`}>
                  <TableCell>
                    <div className="font-medium">{row.nome_completo || row.telefone}</div>
                    <div className="text-xs text-muted-foreground">
                      {row.canal_origem || "-"} / {row.sistema_origem || "-"}
                    </div>
                    <div className="text-xs text-muted-foreground">{row.qualification_summary || "-"}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{row.tracked_codigo_ref || row.campanha_origem || "-"}</div>
                    <div className="text-xs text-muted-foreground">
                      {row.status || "-"} / {row.fase || "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={bucketTone(row.score_prontidao_bucket)}>
                      {row.score_prontidao_bucket || "-"} {row.score_prontidao_operacional}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={bucketTone(row.score_potencial_bucket)}>
                      {row.score_potencial_bucket || "-"} {row.score_potencial_comercial}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDateTime(row.updated_at)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Pagina {page} de {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              Anterior
            </Button>
            <Button
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              Proxima
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const [draftFilters, setDraftFilters] = useState<AnalyticsFilters>({});
  const [filters, setFilters] = useState<AnalyticsFilters>({});
  const [triagePage, setTriagePage] = useState(1);
  const [scorePage, setScorePage] = useState(1);
  const [drilldownPage, setDrilldownPage] = useState(1);
  const [overview, setOverview] = useState<AnalyticsOverview>(EMPTY_OVERVIEW);
  const [timeseries, setTimeseries] = useState<AnalyticsTimeseriesPoint[]>([]);
  const [sources, setSources] = useState<AnalyticsGroupedRow[]>([]);
  const [campaigns, setCampaigns] = useState<AnalyticsGroupedRow[]>([]);
  const [corretors, setCorretors] = useState<AnalyticsGroupedRow[]>([]);
  const [originRankings, setOriginRankings] = useState<AnalyticsGroupedRow[]>([]);
  const [campaignRankings, setCampaignRankings] = useState<AnalyticsGroupedRow[]>([]);
  const [corretorRankings, setCorretorRankings] = useState<AnalyticsGroupedRow[]>([]);
  const [triageReady, setTriageReady] = useState<AnalyticsLeadRow[]>([]);
  const [triageMeta, setTriageMeta] = useState(EMPTY_META);
  const [leadScores, setLeadScores] = useState<AnalyticsLeadRow[]>([]);
  const [leadScoresMeta, setLeadScoresMeta] = useState(EMPTY_META);
  const [drilldownLeads, setDrilldownLeads] = useState<AnalyticsLeadRow[]>([]);
  const [drilldownMeta, setDrilldownMeta] = useState(EMPTY_META);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const requestFingerprint = JSON.stringify({
    filters,
    triagePage,
    scorePage,
    drilldownPage,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadAnalytics() {
      setLoading(true);
      setError(null);

      const triageFilters = {
        ...filters,
        limit: PAGE_SIZE,
        offset: getOffsetForPage(triagePage, PAGE_SIZE),
      };
      const scoreFilters = {
        ...filters,
        limit: PAGE_SIZE,
        offset: getOffsetForPage(scorePage, PAGE_SIZE),
      };
      const drilldownFilters = {
        ...filters,
        limit: PAGE_SIZE,
        offset: getOffsetForPage(drilldownPage, PAGE_SIZE),
      };

      const [
        overviewResult,
        timeseriesResult,
        sourcesResult,
        campaignsResult,
        corretorsResult,
        originRankingsResult,
        campaignRankingsResult,
        corretorRankingsResult,
        triageReadyResult,
        leadScoresResult,
        drilldownResult,
      ] = await Promise.all([
        api.getAnalyticsOverview(filters),
        api.getAnalyticsTimeseries(filters),
        api.getAnalyticsSources(filters),
        api.getAnalyticsCampaigns(filters),
        api.getAnalyticsCorretors(filters),
        api.getAnalyticsRankingOrigins(filters),
        api.getAnalyticsRankingCampaigns(filters),
        api.getAnalyticsRankingCorretors(filters),
        api.getAnalyticsRankingTriageReady(triageFilters),
        api.getAnalyticsRankingLeadScores(scoreFilters),
        api.getAnalyticsLeads(drilldownFilters),
      ]);

      const firstError =
        overviewResult.error ??
        timeseriesResult.error ??
        sourcesResult.error ??
        campaignsResult.error ??
        corretorsResult.error ??
        originRankingsResult.error ??
        campaignRankingsResult.error ??
        corretorRankingsResult.error ??
        triageReadyResult.error ??
        leadScoresResult.error ??
        drilldownResult.error ??
        null;

      if (cancelled) {
        return;
      }

      if (
        firstError ||
        !overviewResult.data ||
        !triageReadyResult.data ||
        !leadScoresResult.data ||
        !drilldownResult.data
      ) {
        setError(firstError ?? "Erro ao carregar analytics");
        setLoading(false);
        return;
      }

      setOverview(overviewResult.data);
      setTimeseries(timeseriesResult.data ?? []);
      setSources(sourcesResult.data ?? []);
      setCampaigns(campaignsResult.data ?? []);
      setCorretors(corretorsResult.data ?? []);
      setOriginRankings(originRankingsResult.data ?? []);
      setCampaignRankings(campaignRankingsResult.data ?? []);
      setCorretorRankings(corretorRankingsResult.data ?? []);
      setTriageReady(triageReadyResult.data.data);
      setTriageMeta(triageReadyResult.data.meta);
      setLeadScores(leadScoresResult.data.data);
      setLeadScoresMeta(leadScoresResult.data.meta);
      setDrilldownLeads(drilldownResult.data.data);
      setDrilldownMeta(drilldownResult.data.meta);
      setLoading(false);
    }

    void loadAnalytics();

    return () => {
      cancelled = true;
    };
  }, [drilldownPage, filters, requestFingerprint, scorePage, triagePage]);

  const summaryCards = useMemo(
    () => [
      {
        title: "Leads analisados",
        value: overview.total_leads,
        description: "Base analitica filtrada",
        icon: Users,
      },
      {
        title: "Conversoes operacionais",
        value: overview.conversoes_operacionais,
        description: formatPercent(overview.taxa_conversao_operacional),
        icon: Target,
      },
      {
        title: "Conversoes comerciais",
        value: overview.conversoes_comerciais,
        description: formatPercent(overview.taxa_conversao_comercial),
        icon: Trophy,
      },
      {
        title: "Tracking associado",
        value: overview.leads_com_tracking,
        description: "Leads com tracked_codigo_ref ou link_click_id",
        icon: Sparkles,
      },
      {
        title: "Em tratativa",
        value: overview.leads_em_tratativa,
        description: "Status operacional do backend",
        icon: Clock3,
      },
      {
        title: "Takeovers humanos",
        value: overview.takeovers_humanos,
        description: "Sem misturar com fila de follow-up",
        icon: BarChart3,
      },
    ],
    [overview]
  );

  function applyFilters() {
    setTriagePage(1);
    setScorePage(1);
    setDrilldownPage(1);
    setFilters({
      date_from: draftFilters.date_from?.trim() || undefined,
      date_to: draftFilters.date_to?.trim() || undefined,
      canal_origem: draftFilters.canal_origem?.trim() || undefined,
      sistema_origem: draftFilters.sistema_origem?.trim() || undefined,
      campanha_origem: draftFilters.campanha_origem?.trim() || undefined,
      tracked_codigo_ref: draftFilters.tracked_codigo_ref?.trim() || undefined,
      status: draftFilters.status?.trim() || undefined,
      fase: draftFilters.fase?.trim() || undefined,
      corretor_id: draftFilters.corretor_id?.trim() || undefined,
      intervention_type: draftFilters.intervention_type?.trim() || undefined,
    });
  }

  function clearFilters() {
    setDraftFilters({});
    setTriagePage(1);
    setScorePage(1);
    setDrilldownPage(1);
    setFilters({});
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
          <p className="text-muted-foreground">Carregando analytics reais...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive text-center">
          <p className="font-semibold">Erro ao carregar analytics</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Consumo direto da camada analitica dedicada, sem reconstruir metricas no frontend
        </p>
      </div>

      <Card className="glass border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-primary" />
                Filtros canonicos
              </CardTitle>
              <CardDescription>
                date_from, date_to, origem, tracking, status, fase, corretor e intervention_type
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Limpar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <Input
              type="date"
              value={draftFilters.date_from ?? ""}
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  date_from: event.target.value || undefined,
                }))
              }
            />
            <Input
              type="date"
              value={draftFilters.date_to ?? ""}
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  date_to: event.target.value || undefined,
                }))
              }
            />
            <Input
              placeholder="Canal origem"
              value={draftFilters.canal_origem ?? ""}
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  canal_origem: event.target.value,
                }))
              }
            />
            <Input
              placeholder="Sistema origem"
              value={draftFilters.sistema_origem ?? ""}
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  sistema_origem: event.target.value,
                }))
              }
            />
            <Input
              placeholder="Tracked codigo ref"
              value={draftFilters.tracked_codigo_ref ?? ""}
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  tracked_codigo_ref: event.target.value,
                }))
              }
            />
            <Input
              placeholder="Campanha origem"
              value={draftFilters.campanha_origem ?? ""}
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  campanha_origem: event.target.value,
                }))
              }
            />
            <Input
              placeholder="Status"
              value={draftFilters.status ?? ""}
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  status: event.target.value,
                }))
              }
            />
            <Input
              placeholder="Fase"
              value={draftFilters.fase ?? ""}
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  fase: event.target.value,
                }))
              }
            />
            <Input
              placeholder="Corretor ID"
              value={draftFilters.corretor_id ?? ""}
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  corretor_id: event.target.value,
                }))
              }
            />
            <Input
              placeholder="Intervention type"
              value={draftFilters.intervention_type ?? ""}
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  intervention_type: event.target.value,
                }))
              }
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={applyFilters}>Aplicar filtros</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map((item) => (
          <SummaryCard
            key={item.title}
            title={item.title}
            value={item.value}
            description={item.description}
            icon={item.icon}
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-4 w-4 text-primary" />
              Serie temporal
            </CardTitle>
            <CardDescription>
              `/analytics/timeseries` por dia, sem recalculo local
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Leads</TableHead>
                  <TableHead>Conv. op.</TableHead>
                  <TableHead>Conv. com.</TableHead>
                  <TableHead>Takeovers</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timeseries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Sem pontos para o periodo atual
                    </TableCell>
                  </TableRow>
                ) : (
                  timeseries.map((point) => (
                    <TableRow key={point.date}>
                      <TableCell>{formatDate(point.date)}</TableCell>
                      <TableCell>{point.leads}</TableCell>
                      <TableCell>{point.operational_conversions}</TableCell>
                      <TableCell>{point.commercial_conversions}</TableCell>
                      <TableCell>{point.human_takeovers}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <GroupedMetricsTable
          title="Rank por origem"
          description="Lista ordenada vinda de /analytics/rankings/origins"
          rows={originRankings}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <GroupedMetricsTable
          title="Sources"
          description="Agrupamento por canal_origem e sistema_origem"
          rows={sources}
        />
        <GroupedMetricsTable
          title="Campaigns"
          description="Agrupamento analitico priorizando tracked_codigo_ref"
          rows={campaigns}
        />
        <GroupedMetricsTable
          title="Corretors"
          description="Agrupamento por corretor e carteira tratada"
          rows={corretors}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <GroupedMetricsTable
          title="Ranking de campanhas"
          description="Ordenacao canonica do backend, sem resort local"
          rows={campaignRankings}
        />
        <GroupedMetricsTable
          title="Ranking de corretores"
          description="Conversao e prontidao media por corretor"
          rows={corretorRankings}
        />
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle>Regras canonicas em uso</CardTitle>
            <CardDescription>Travas aplicadas na tela</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>`conversoes_operacionais` e `conversoes_comerciais` seguem separados.</p>
            <p>`analytics/leads` e rankings usam scores entregues pelo backend.</p>
            <p>`tracked_codigo_ref` aparece antes de `campanha_origem` na leitura de campanha.</p>
            <p>O frontend nao faz sort adicional sobre os rankings ordenados pelo backend.</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 2xl:grid-cols-3">
        <LeadRankingTable
          title="Triagem pronta"
          description="`/analytics/rankings/triage-ready` para priorizacao operacional"
          rows={triageReady}
          meta={triageMeta}
          page={triagePage}
          onPageChange={setTriagePage}
        />
        <LeadRankingTable
          title="Score geral"
          description="`/analytics/rankings/lead-scores` para leitura estrategica"
          rows={leadScores}
          meta={leadScoresMeta}
          page={scorePage}
          onPageChange={setScorePage}
        />
        <LeadRankingTable
          title="Drill-down analitico"
          description="`/analytics/leads` com tracking, corretor e buckets reais"
          rows={drilldownLeads}
          meta={drilldownMeta}
          page={drilldownPage}
          onPageChange={setDrilldownPage}
        />
      </div>
    </div>
  );
}
