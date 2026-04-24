---
id: db-schema
loadWhen: sempre — baseline obrigatório
tokensEstimate: 1500
verifiedAt: "2026-04-24"
---

# Infra: Schema do Banco de Dados

## ⚠️ FONTE DA VERDADE
Qualquer mudança no Prisma DEVE ser refletida aqui.
NUNCA propor mudança de schema sem verificar este arquivo.

---

## ⚠️ IMPORTANTE — Arquitetura Atual

**Este projeto NÃO usa banco de dados local.**
Os dados ficam no banco do **AtusBot** (`chatbot.atusbr.com.br`).

- API: REST + MCP
- Não há Prisma schema local
- Dados vem via `/api/v1/leads`, `/mcp/leads`, etc.

---

## Tabelas do Banco AtusBot (Referência)

| Tabela | Descrição |
|---|---|
| lead | Leads/cadastros |
| conversa | Conversas WhatsApp |
| mensagem | Mensagens individuais |
| tracked_link | Links rastreáveis |
| link_click | Cliques em links |
| corretor | Corretores |
| feature_flag | Flags por lead |
| notificacao | Notas do lead |

---

## Schema Reference (da API)

Ver `docs/API.md` para detalhes completos das tabelas.
