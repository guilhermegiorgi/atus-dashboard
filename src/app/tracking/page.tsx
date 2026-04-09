"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api/client";
import { CreateTrackedLinkValues, TrackedLink } from "@/types/dashboard";
import { Link2, MousePointerClick, Plus, RefreshCcw, Target, Ticket } from "lucide-react";

const PAGE_SIZE = 20;

const EMPTY_FORM: CreateTrackedLinkValues = {
  nome: "",
  nome_campanha: "",
  source: "",
  medium: "",
  content: "",
  term: "",
  whatsapp_num: "",
  whatsapp_msg: "",
  url_base: "",
  expira_em: "",
};

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function activeTone(active: boolean) {
  return active
    ? "border-green-500/20 bg-green-500/10 text-green-400"
    : "border-red-500/20 bg-red-500/10 text-red-300";
}

export default function TrackingPage() {
  const [ativoFilter, setAtivoFilter] = useState<"all" | "true" | "false">("all");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [links, setLinks] = useState<TrackedLink[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedLink, setSelectedLink] = useState<TrackedLink | null>(null);
  const [form, setForm] = useState<CreateTrackedLinkValues>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadLinks() {
      setLoading(true);
      setError(null);

      const result = await api.getTrackedLinks({
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
        ativo:
          ativoFilter === "all" ? undefined : ativoFilter === "true",
      });

      if (cancelled) {
        return;
      }

      if (result.error || !result.data) {
        setError(result.error ?? "Erro ao carregar tracked-links");
        setLoading(false);
        return;
      }

      setLinks(result.data);
      setLoading(false);
    }

    void loadLinks();

    return () => {
      cancelled = true;
    };
  }, [ativoFilter, page]);

  useEffect(() => {
    if (!selectedId) {
      setSelectedLink(null);
      return;
    }

    const currentId = selectedId;
    let cancelled = false;

    async function loadDetail() {
      setDetailLoading(true);
      const result = await api.getTrackedLink(currentId);

      if (cancelled) {
        return;
      }

      if (result.error || !result.data) {
        setError(result.error ?? "Erro ao carregar detalhe do tracked-link");
        setDetailLoading(false);
        return;
      }

      setSelectedLink(result.data);
      setDetailLoading(false);
    }

    void loadDetail();

    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const visibleLinks = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    if (!normalized) {
      return links;
    }

    return links.filter((link) =>
      [link.nome, link.nome_campanha, link.codigo_ref, link.source, link.medium]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalized))
    );
  }, [links, search]);

  const hasNextPage = links.length === PAGE_SIZE;

  async function handleCreateTrackedLink() {
    if (!form.nome.trim() || !form.whatsapp_num.trim()) {
      setError("Nome e whatsapp_num sao obrigatorios");
      return;
    }

    setSaving(true);
    setError(null);

    const result = await api.createTrackedLink(form);

    if (result.error || !result.data) {
      setError(result.error ?? "Erro ao criar tracked-link");
      setSaving(false);
      return;
    }

    setForm(EMPTY_FORM);
    setSelectedId(result.data.id);

    const refreshed = await api.getTrackedLinks({
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
      ativo: ativoFilter === "all" ? undefined : ativoFilter === "true",
    });

    if (refreshed.data) {
      setLinks(refreshed.data);
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
          <p className="text-muted-foreground">Carregando tracking e campanhas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive text-center">
          <p className="font-semibold">Erro ao carregar tracking</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Tracking e Campanhas</h1>
        <p className="text-muted-foreground">
          Painel canonico de `/tracked-links`, com criacao, listagem e detalhe real
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card className="glass border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Links na pagina
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{links.length}</div>
            <p className="mt-1 text-xs text-muted-foreground">`limit` e `offset` reais do endpoint</p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Clicks somados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {links.reduce((total, item) => total + item.clicks, 0)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Indicador do lote atual</p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Leads convertidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400">
              {links.reduce((total, item) => total + item.leads_convertidos, 0)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Total devolvido pela API</p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Regra de atribuicao
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Leads devem ser lidos por `tracked_codigo_ref` e `link_click_id`, nao por `lead.codigo_ref`.
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card className="glass border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-primary" />
                  Links rastreaveis
                </CardTitle>
                <CardDescription>
                  O endpoint nao devolve `meta.total`, entao a pagina usa avancar/voltar por lote
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setPage(1)}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Voltar ao inicio
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-[1fr_auto_auto_auto]">
              <Input
                placeholder="Buscar por nome, campanha ou codigo"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <Button
                variant={ativoFilter === "all" ? "default" : "outline"}
                onClick={() => {
                  setPage(1);
                  setAtivoFilter("all");
                }}
              >
                Todos
              </Button>
              <Button
                variant={ativoFilter === "true" ? "default" : "outline"}
                onClick={() => {
                  setPage(1);
                  setAtivoFilter("true");
                }}
              >
                Ativos
              </Button>
              <Button
                variant={ativoFilter === "false" ? "default" : "outline"}
                onClick={() => {
                  setPage(1);
                  setAtivoFilter("false");
                }}
              >
                Inativos
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Codigo</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Clicks</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleLinks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Nenhum tracked-link encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  visibleLinks.map((link) => (
                    <TableRow
                      key={link.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedId(link.id)}
                    >
                      <TableCell>
                        <div className="font-medium">{link.nome}</div>
                        <div className="text-xs text-muted-foreground">
                          {link.nome_campanha || "sem campanha"}
                        </div>
                      </TableCell>
                      <TableCell>{link.codigo_ref}</TableCell>
                      <TableCell>
                        {link.source || "-"} / {link.medium || "-"}
                      </TableCell>
                      <TableCell>{link.clicks}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={activeTone(link.ativo)}>
                          {link.ativo ? "ativo" : "inativo"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">Pagina atual {page}</div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  Anterior
                </Button>
                <Button size="sm" disabled={!hasNextPage} onClick={() => setPage(page + 1)}>
                  Proxima
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" />
              Novo tracked-link
            </CardTitle>
            <CardDescription>
              POST canonico em `/api/v1/tracked-links`
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Input
              placeholder="Nome"
              value={form.nome}
              onChange={(event) => setForm((current) => ({ ...current, nome: event.target.value }))}
            />
            <Input
              placeholder="Nome campanha"
              value={form.nome_campanha ?? ""}
              onChange={(event) =>
                setForm((current) => ({ ...current, nome_campanha: event.target.value }))
              }
            />
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                placeholder="Source"
                value={form.source ?? ""}
                onChange={(event) => setForm((current) => ({ ...current, source: event.target.value }))}
              />
              <Input
                placeholder="Medium"
                value={form.medium ?? ""}
                onChange={(event) => setForm((current) => ({ ...current, medium: event.target.value }))}
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                placeholder="Content"
                value={form.content ?? ""}
                onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
              />
              <Input
                placeholder="Term"
                value={form.term ?? ""}
                onChange={(event) => setForm((current) => ({ ...current, term: event.target.value }))}
              />
            </div>
            <Input
              placeholder="WhatsApp num"
              value={form.whatsapp_num}
              onChange={(event) =>
                setForm((current) => ({ ...current, whatsapp_num: event.target.value }))
              }
            />
            <Input
              placeholder="WhatsApp msg"
              value={form.whatsapp_msg ?? ""}
              onChange={(event) =>
                setForm((current) => ({ ...current, whatsapp_msg: event.target.value }))
              }
            />
            <Input
              placeholder="URL base"
              value={form.url_base ?? ""}
              onChange={(event) => setForm((current) => ({ ...current, url_base: event.target.value }))}
            />
            <Input
              type="date"
              value={form.expira_em ?? ""}
              onChange={(event) => setForm((current) => ({ ...current, expira_em: event.target.value }))}
            />
            <Button disabled={saving} onClick={handleCreateTrackedLink}>
              Criar link
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-primary" />
            Detalhe da campanha
          </CardTitle>
          <CardDescription>
            Clique em um tracked-link da tabela para abrir o detalhe real
          </CardDescription>
        </CardHeader>
        <CardContent>
          {detailLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              Carregando detalhe...
            </div>
          ) : !selectedLink ? (
            <div className="py-12 text-center text-muted-foreground">
              Selecione um tracked-link para ver o detalhe
            </div>
          ) : (
            <div className="grid gap-6 xl:grid-cols-3">
              <div className="space-y-3">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Identificacao
                </div>
                <div className="rounded-2xl border border-border/50 bg-secondary/20 p-4">
                  <div className="text-lg font-semibold">{selectedLink.nome}</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedLink.nome_campanha || "sem campanha"}
                  </div>
                  <div className="mt-3">
                    <Badge variant="outline" className={activeTone(selectedLink.ativo)}>
                      {selectedLink.ativo ? "ativo" : "inativo"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Tracking
                </div>
                <div className="rounded-2xl border border-border/50 bg-secondary/20 p-4 text-sm">
                  <div className="flex items-center gap-2 font-medium">
                    <Ticket className="h-4 w-4 text-primary" />
                    {selectedLink.codigo_ref}
                  </div>
                  <div className="mt-3 text-muted-foreground">
                    {selectedLink.source || "-"} / {selectedLink.medium || "-"}
                  </div>
                  <div className="text-muted-foreground">
                    {selectedLink.content || "-"} / {selectedLink.term || "-"}
                  </div>
                  <div className="mt-3 break-all text-xs text-muted-foreground">
                    {selectedLink.link || "-"}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Performance
                </div>
                <div className="rounded-2xl border border-border/50 bg-secondary/20 p-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MousePointerClick className="h-4 w-4 text-primary" />
                    {selectedLink.clicks} click(s)
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Target className="h-4 w-4 text-green-400" />
                    {selectedLink.leads_convertidos} lead(s) convertidos
                  </div>
                  <div className="mt-3 text-muted-foreground">
                    Expira em: {formatDateTime(selectedLink.expira_em)}
                  </div>
                  <div className="text-muted-foreground">
                    Criado em: {formatDateTime(selectedLink.created_at)}
                  </div>
                </div>
              </div>

              <div className="xl:col-span-3 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-border/50 bg-secondary/20 p-4 text-sm">
                  <div className="font-medium">WhatsApp</div>
                  <div className="mt-2 text-muted-foreground">{selectedLink.whatsapp_num}</div>
                  <div className="mt-2 text-muted-foreground">{selectedLink.whatsapp_msg || "-"}</div>
                </div>
                <div className="rounded-2xl border border-border/50 bg-secondary/20 p-4 text-sm">
                  <div className="font-medium">URL base</div>
                  <div className="mt-2 break-all text-muted-foreground">
                    {selectedLink.url_base || "-"}
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
