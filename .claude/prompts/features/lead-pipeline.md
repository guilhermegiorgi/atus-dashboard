---
id: lead-pipeline
loadWhen: task.feature === "lead-pipeline" || task.domain === "pipeline"
tokensEstimate: 900
verifiedAt: null
---

# Feature: Pipeline de Leads (Kanban)

## Estrutura do Kanban

Colunas = estados do lead (ver `domains/leads.md`).
Leads `fechados` e `perdidos` ficam em aba separada — NUNCA no Kanban principal.

### Dados por Card
- **Novo:** nome, telefone, canal, tempo desde entrada
- **Qualificando:** progresso de campos preenchidos (%)
- **Qualificado:** orçamento, tipo de imóvel, corretor
- **Visitando:** imóvel de interesse, data da visita
- **Proposta:** valor da proposta

### Ações por Card
- Arrastar entre colunas → `POST /leads/:id/transition`
- Clicar → drawer com detalhes completos
- "Atribuir corretor" → select de corretores ativos
- "Registrar visita" → modal com campos de visita

---

## Filtros do Pipeline

- Por corretor (multi-select)
- Por canal de origem
- Por data de entrada (range picker)
- Por tipo de imóvel
- Busca por nome/telefone

---

## Badges de Atenção

- 🟠 "Incompleto" — campo obrigatório faltando para o estado atual
- 🔴 "Sem corretor" — lead qualificado sem atribuição

---

## Armadilhas
- NUNCA mover estado via update direto — sempre via `/transition`
- NUNCA exibir leads perdidos no Kanban principal
