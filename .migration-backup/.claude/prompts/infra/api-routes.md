---
id: api-routes
loadWhen: task.involves?.includes("api") || task.type === "new-route"
tokensEstimate: 900
verifiedAt: "2026-04-24"
---

# Infra: Rotas da API

## Base URL
`chatbot.atusbr.com.br`

## Autenticação
- Header: `x-api-key: atus-mcp-api-key-2026`
- Query: `?token=atus-mcp-api-key-2026`

---

## Rotas do Backend (AtusBot)

### Leads
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/v1/leads` | Listar leads (paginado) |
| GET | `/api/v1/leads/:id` | Buscar lead por ID |
| PUT | `/api/v1/leads/:id` | Atualizar lead |
| DELETE | `/api/v1/leads/:id` | Deletar lead |
| GET | `/api/v1/leads/:id/conversas` | Listar conversas |
| POST | `/api/v1/leads/:id/send-message` | Enviar mensagem |
| POST | `/api/v1/leads/:id/intervene` | Intervenção humana |
| POST | `/api/v1/leads/:id/release-followup` | Liberar do follow-up |
| POST | `/api/v1/leads/:id/reset` | Resetar dados |

### MCP
| Método | Rota | Descrição |
|---|---|---|
| GET | `/mcp/leads` | Listar leads (MCP) |
| GET | `/mcp/lead/:telefone` | Buscar por telefone |
| POST | `/mcp/lead` | Criar lead |
| PUT | `/mcp/lead/:id` | Atualizar lead |
| GET | `/mcp/stats` | Estatísticas |

### Estatísticas
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/v1/stats/leads` | Estatísticas de leads |
| GET | `/api/v1/stats/tracking` | Estatísticas de tracking |

### Tracking Links
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/v1/tracked-links` | Listar links |
| POST | `/api/v1/tracked-links` | Criar link |
| GET | `/api/v1/tracked-links/:id` | Buscar link |

### Conversas
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/v1/conversas/:id/mensagens` | Listar mensagens |

---

## Rotas Internas do Dashboard (Next.js)

### `/api/internal/`
- `/leads` - Proxy para API AtusBot
- `/leads/:id` - Detalhes do lead
- `/leads/:id/operational-status` - Status operacional
- `/leads/:id/actions` - Auditoria de ações
- `/leads/:id/human-intervention` - Estado humano
- `/leads/:id/conversas` - Conversas do lead
- `/inbox/conversations/:leadId` - Caixa de entrada
- `/stats/leads` - Estatísticas
- `/metrics/followup` - Métricas de follow-up
- `/metrics/sla` - Métricas SLA
- `/analytics/*` - Diversos relatórios
- `/tracked-links` - Gestão de links

---

## Padrão de Resposta

```typescript
// Sucesso com dados
{ data: <payload>, meta?: { total, limit, offset } }

// Sucesso simples
{ success: true }

// Erro
{ error: "mensagem de erro" }
```

---

## Armadilhas
- NUNCA retornar dados sensíveis em nenhuma rota
- NUNCA fazer query sem paginação
- SEMPRE validar body com Zod antes de processar
- Usar API Key correta: `atus-mcp-api-key-2026`
