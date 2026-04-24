# SPEC — Atus Imobiliária · Lead Dashboard

> **Última atualização:** 2026-04-24
> **Responsável:** Guilherme Giorgi
> **Stack:** Next.js 14 · TypeScript · Tailwind CSS

---

## 🟢 Funcionando (Estável)

- [x] Dashboard principal com métricas
- [x] Lista de leads com CRUD completo
- [x] Pipeline Kanban (/board)
- [x] Fila operacional (/pipeline)
- [x] Conversas/ inbox (/conversations)
- [x] Links de rastreamento (/tracking)
- [x] Análise/relatórios (/analytics)
- [x] Busca global (Ctrl+K)
- [x] Painel lateral de detalhes do lead

---

## 🔴 Bugs Ativos

| # | Descrição | Impacto | Módulo | Status |
|---|---|---|---|---|
| 1 | Testar as novas funcionalidades em produção | Alto | Geral | Pendente |

---

## 🟡 Em Desenvolvimento (Sessão Atual)

- [ ] Testar as novas funcionalidades implementadas:
  - Painel lateral em /leads
  - Pipeline Kanban em /board
  - Busca global (Ctrl+K)
- [ ] Bugfix se necessário

---

## ⛔ Bloqueado

- Nenhum

---

## 🏗️ Arquitetura Atual

### Stack
- **Frontend:** Next.js 14 (App Router)
- **UI:** shadcn/ui + Tailwind CSS
- **Design System:** Blackstar (fundo preto puro, tipografia branca)
- **API:** AtusBot (chatbot.atusbr.com.br)

### Rotas Principais
- `/` - Home com overview
- `/dashboard` - Métricas e KPIs
- `/leads` - Lista de leads com painel lateral
- `/board` - Pipeline Kanban
- `/pipeline` - Fila operacional
- `/conversations` - Caixa de mensagens
- `/tracking` - Links rastreáveis
- `/analytics` - Relatórios

### Componentes Novos
- `GlobalSearch` - Busca global com Ctrl+K
- `LeadDetailPanel` - Painel lateral de detalhes

---

## 📐 Decisões de Arquitetura

1. Design System Blackstar: fundo #000000, bordas 12% opacidade, sem sombras
2. Leads usam LeadDetailPanel em vez de modal
3. Pipeline Kanban em /board com colunas por status
4. Busca global disponível em todas as páginas

---

## 🔄 Changelog

### 2026-04-24 — Implementação de Gestão de Leads
- Adicionado painel lateral para detalhes do lead (/leads)
- Criado pipeline Kanban em /board
- Implementada busca global com Ctrl+K
- Adicionadas animações CSS para painéis
- Criado roadmap de melhorias em docs/roadmap.md
