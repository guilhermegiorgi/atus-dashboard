# Atus Imobiliária — Lead Dashboard Agent
# Orquestrador Modular de Contexto para Claude Code

## 🚀 Como Invocar

```bash
# Sessão nova
claude .claude/ATUS_AGENT.md

# Feature específica
claude .claude/ATUS_AGENT.md --feature lead-pipeline
claude .claude/ATUS_AGENT.md --feature tracking-links
claude .claude/ATUS_AGENT.md --feature dashboard-kpis
claude .claude/ATUS_AGENT.md --feature global-search

# Modo bugfix
claude .claude/ATUS_AGENT.md --bugfix
```

---

## ⚠️ Regra Fundamental (NUNCA violar)

NÃO carregue todos os sub-prompts. Leia `setup.config.json` e `SPEC.md`
e carregue APENAS o contexto relevante para a tarefa atual.

Contexto monolítico degrada o raciocínio. Contexto enxuto = raciocínio preciso.

---

## 🧠 Algoritmo de Carga Dinâmica

Após ler `SPEC.md` e `setup.config.json`, execute este algoritmo:

```typescript
function determineSubprompts(task: Task, cfg: ProjectConfig): string[] {
  const load: string[] = [
    "infra/db-schema.md",          // SEMPRE — fonte da verdade do schema
    "patterns/error-handling.md",  // SEMPRE — bugs são o estado atual
  ];

  if (task.domain === "leads" || task.domain === "pipeline")
    load.push("domains/leads.md", "features/lead-pipeline.md");

  if (task.domain === "chatbot" || task.domain === "qualificacao")
    load.push("domains/chatbot.md", "patterns/lead-corrections.md");

  if (task.domain === "corretores" || task.domain === "tracking")
    load.push("domains/corretores.md", "features/tracking-links.md");

  if (task.domain === "crm" || task.domain === "leadsale")
    load.push("domains/crm-leadsale.md");

  if (task.type === "bugfix")
    load.push("patterns/bugfix-protocol.md");

  if (task.feature === "kpis")
    load.push("features/dashboard-kpis.md");

  if (task.feature === "global-search")
    load.push("features/global-search.md");

  if (task.feature === "kanban")
    load.push("features/kanban-board.md");

  if (task.involves?.includes("roles"))
    load.push("infra/auth.md");

  return [...new Set(load)];
}
```

Ao iniciar a sessão, imprima:
```
Context loaded: [lista de sub-prompts] — N sub-prompts, ~Xk tokens
```

---

## 📋 Checklist de Início de Sessão

1. [ ] Ler `SPEC.md` — estado atual (funcionando, bugs, bloqueados)
2. [ ] Ler `setup.config.json` — versões, flags, integrações ativas
3. [ ] Executar algoritmo de carga e anunciar sub-prompts escolhidos
4. [ ] Perguntar: "Qual é o objetivo desta sessão?" se não veio via flag
5. [ ] NUNCA assumir estado do código — verificar arquivo real antes de propor mudança

---

## 🔒 Contratos Imutáveis

- API AtusBot: `chatbot.atusbr.com.br` (endpoints /api/v1/, /mcp/)
- Design System: Blackstar (fundo #000000, bordas 12%, sem sombras)
- Leads usam painel lateral (não modal)
- Pipeline Kanban disponível em /board

---

## 🚫 Anti-Padrões

- NUNCA propor mudança de schema sem checar `infra/db-schema.md`
- NUNCA editar integração sem ler o sub-prompt do domínio
- NUNCA "consertar" bug sem verificar impacto em outros módulos
- NUNCA encerrar sessão sem atualizar `SPEC.md`
- NUNCA hardcodar valores que estão em `setup.config.json`

---

## 📁 Índice de Sub-Prompts

| Arquivo | Carregar Quando | Tokens Est. |
|---|---|---|
| `domains/leads.md` | Leads, estados, qualificação | ~1200 |
| `domains/corretores.md` | Perfis, tracking, performance | ~900 |
| `domains/chatbot.md` | Fluxo do bot, campos, correções | ~1000 |
| `domains/crm-leadsale.md` | Integração Leadsale | ~800 |
| `features/lead-pipeline.md` | Funil, estágios | ~900 |
| `features/kanban-board.md` | Board Kanban /board | ~700 |
| `features/dashboard-kpis.md` | Métricas, filtros, KPIs | ~800 |
| `features/tracking-links.md` | Links, analytics de origem | ~700 |
| `features/global-search.md` | Busca Ctrl+K | ~500 |
| `infra/db-schema.md` | SEMPRE — fonte da verdade | ~1500 |
| `infra/api-routes.md` | Criação/alteração de rotas | ~900 |
| `infra/auth.md` | Permissões, roles, sessões | ~700 |
| `patterns/lead-corrections.md` | Update de campos do lead | ~600 |
| `patterns/error-handling.md` | SEMPRE — erros conhecidos | ~700 |
| `patterns/bugfix-protocol.md` | task.type === "bugfix" | ~800 |

---

## 🗺️ Rotas do Projeto

| Rota | Descrição |
|---|---|
| `/` | Home com overview |
| `/dashboard` | Métricas e KPIs |
| `/leads` | Lista de leads + painel lateral |
| `/board` | Pipeline Kanban |
| `/pipeline` | Fila operacional |
| `/conversations` | Caixa de mensagens |
| `/tracking` | Links rastreáveis |
| `/analytics` | Relatórios |
