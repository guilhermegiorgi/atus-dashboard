---
id: tracking-links
loadWhen: task.feature === "tracking-links" || task.domain === "tracking"
tokensEstimate: 700
verifiedAt: null
---

# Feature: Tracking Links para Corretores

## Fluxo

```
Corretor gera link no painel
  → Slug único criado: {nome}-{4chars}
  → Corretor posta nas redes sociais
  → Visitante clica → /c/:slug
  → Middleware registra evento ANTES do redirect
  → Redirect para destino
  → Se virar lead → associado automaticamente ao corretor
```

---

## Analytics por Link
- Total de cliques / Cliques únicos (por IP)
- Leads gerados / Taxa de conversão click→lead
- Histórico diário (gráfico de linha)

---

## Armadilhas
- NUNCA gerar slug só com nome (colisão)
- NUNCA alterar slug após criação
- NUNCA deletar link — soft delete para manter histórico
