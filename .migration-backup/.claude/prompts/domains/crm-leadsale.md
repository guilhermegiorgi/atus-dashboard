---
id: crm-leadsale
loadWhen: task.domain === "crm" || task.domain === "leadsale"
tokensEstimate: 800
verifiedAt: null
---

# Domínio: CRM Leadsale — Atus Imobiliária

## Integração
- Provider: Leadsale
- Direção: bidirecional
- NUNCA chamar API Leadsale diretamente do frontend

---

## Mapeamento de Campos (Preencher com o real)

| Campo Atus | Campo Leadsale | Notas |
|---|---|---|
| `lead.nome` | `contact.name` | |
| `lead.telefone` | `contact.phone` | Normalizar antes de enviar |
| `lead.estado` | `deal.stage` | Ver mapeamento abaixo |

## Mapeamento de Estágios

| Estado Atus | Stage Leadsale |
|---|---|
| `novo` | `new` |
| `qualificando` | `qualifying` |
| `qualificado` | `qualified` |
| `visitando` | `visiting` |
| `proposta` | `proposal` |
| `fechado` | `closed_won` |
| `perdido` | `closed_lost` |

---

## Regras de Sync

- Atus → Leadsale: ao mudar estado do lead
- Leadsale → Atus: via webhook (`/api/webhooks/leadsale`)
- Conflito de qualificação: Atus é source of truth
- Conflito de estágio negocial: Leadsale é source of truth
- Sync sempre assíncrono (queue/background job)

---

## Variáveis de Ambiente

```env
LEADSALE_API_KEY=
LEADSALE_API_BASE=https://api.leadsale.com.br/v1
LEADSALE_WEBHOOK_SECRET=
```

---

## Armadilhas
- NUNCA chamar Leadsale sem rate-limit handling (429 é frequente)
- NUNCA fazer sync síncrono no fluxo do usuário
- NUNCA deletar lead no Leadsale — marcar como perdido
