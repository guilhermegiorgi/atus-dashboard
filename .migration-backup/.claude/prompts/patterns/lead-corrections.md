---
id: lead-corrections
loadWhen: task.domain === "chatbot" || task.involves?.includes("update-lead")
tokensEstimate: 600
verifiedAt: 2026-04-24
---

# Pattern: Correção de Campos de Lead

## Regra Fundamental
Ao corrigir qualquer campo de um lead, identificar TODOS os campos
implícitos e relacionados — e limpar os que ficaram obsoletos.
NUNCA fazer update parcial de campos com dependências.

---

## Função Obrigatória

```typescript
// lib/leads/update-with-cleanup.ts
async function updateLeadWithCleanup(leadId: string, updates: Partial<Lead>) {
  const cleanedUpdates = { ...updates };

  // Se atualizou fgts sem cônjuge → limpar fgts_conjuge
  if ("fgts" in updates && !("fgts_conjuge" in updates)) {
    cleanedUpdates.fgts_conjuge = null;
  }

  // Se atualizou renda sem cônjuge → limpar campos de cônjuge
  if ("renda" in updates && !("renda_conjuge" in updates)) {
    cleanedUpdates.renda_conjuge = null;
    cleanedUpdates.renda_comprovada_conjuge = null;
  }

  cleanedUpdates.atualizado_em = new Date();

  return prisma.lead.update({
    where: { id: leadId },
    data: cleanedUpdates,
  });
}

// ❌ NUNCA fazer isso:
await prisma.lead.update({ where: { id }, data: { fgts: 50000 } });
```

---

## Confirmação para o Usuário (Bot)

Após qualquer correção:
> "Perfeito, corrigi **[CAMPO]** para **[VALOR]**. Continuando..."

Continuar do ponto atual — NUNCA reiniciar o fluxo.

---

## Mapa de Campos Relacionados

| Campo atualizado | Campos para limpar |
|---|---|
| `fgts` | `fgts_conjuge` |
| `renda` | `renda_conjuge`, `renda_comprovada_conjuge` |
| `estado_civil = solteiro` | `fgts_conjuge`, `renda_conjuge` |
