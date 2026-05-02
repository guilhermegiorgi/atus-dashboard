---
id: corretores
loadWhen: task.domain === "corretores" || task.domain === "tracking"
tokensEstimate: 900
verifiedAt: null
---

# Domínio: Corretores — Atus Imobiliária

## Schema (Preencher com o real)

```prisma
model Corretor {
  id           String   @id @default(cuid())
  nome         String
  telefone     String   @unique
  email        String   @unique
  creci        String?
  ativo        Boolean  @default(true)
  slug         String   @unique  // usado nos tracking links — IMUTÁVEL

  leads        Lead[]
  trackingLinks TrackingLink[]
}

model TrackingLink {
  id            String   @id @default(cuid())
  corretor_id   String
  slug          String   @unique  // ex: guilherme-a3f9 — IMUTÁVEL após criação
  destino       String
  campanha      String?
  cliques       Int      @default(0)
  leads_gerados Int      @default(0)
  criado_em     DateTime @default(now())

  corretor      Corretor @relation(fields: [corretor_id], references: [id])
}
```

---

## Regras de Negócio

- Slug é imutável após criação (links já distribuídos nas redes)
- Corretor inativo → lead vai para fila geral (não bloqueia o fluxo)
- Lead com tracking link → atribuído automaticamente ao corretor do link
- Lead sem tracking link → round-robin entre corretores ativos
- Evento de clique registrado ANTES do redirect (nunca depois)

---

## Failures Conhecidos

| Sintoma | Causa | Prevenção |
|---|---|---|
| Link quebrado após renomear corretor | Slug baseado no nome | Slug gerado uma vez, nunca muda |
| Dupla atribuição de lead | Race condition no round-robin | Transação no DB ao atribuir |
| Cliques não contabilizados | Redirect antes de registrar | Registrar evento ANTES de redirecionar |

---

## Armadilhas
- NUNCA alterar `slug` de TrackingLink existente
- NUNCA deletar Corretor — usar `ativo: false` (soft delete)
- NUNCA contar cliques no frontend — sempre server-side
