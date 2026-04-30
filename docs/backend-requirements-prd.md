# PRD - Requisitos de Backend para o Dashboard Átus

## 1. Visão Geral

Este documento detalha os requisitos técnicos necessários para que o backend (AtusBot API) forneça as funcionalidades requeridas pelo frontend do Dashboard Átus.

**Última atualização:** 30/04/2026  
**Versão:** 1.0

---

## 2. Estado Atual

### 2.1 O que já funciona (consumido pelo frontend)
- CRUD completo de Leads (`/api/v1/leads`)
- Lista e detalhe de Conversas (`/api/v1/leads/[id]/conversas`)
- Pipeline operacional com follow-up queue
- Analytics (overview, timeseries, sources, campaigns, rankings)
- Envio de mensagens WhatsApp (texto + mídia)
- Sistema de notas em leads
- Atribuição de corretores
- Links rastreáveis (leitura + criação)

### 2.2 O que falta/no que precisa mejorar
- Sistema de Tags/Labels
- Feature Flags por Lead
- Flags Globais
- Estatísticas detalhadas de Tracking
- CRUD completo de Tracked Links
- Gerenciamento de Usuários
- Sistema de Notificações

---

## 3. Requisitos Funcionais

### 3.1 Sistema de Tags/Labels

**Necessidade:** O frontend precisa criar, editar, excluir e atribuir tags aos leads.

**Endpoints necessários:**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/tags` | Lista todas as tags disponíveis |
| POST | `/api/v1/tags` | Cria uma nova tag |
| PUT | `/api/v1/tags/{id}` | Atualiza uma tag existente |
| DELETE | `/api/v1/tags/{id}` | Remove uma tag |
| POST | `/api/v1/leads/{id}/tags` | Adiciona tags a um lead |
| DELETE | `/api/v1/leads/{id}/tags/{tagId}` | Remove tag de um lead |
| GET | `/api/v1/leads/{id}/tags` | Lista tags de um lead |

**Modelo de dados - Tag:**
```json
{
  "id": "string",
  "name": "string",
  "color": "string (hex)",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

**Modelo de dados - Lead com Tags:**
```json
{
  "id": "string",
  "tags": [
    { "id": "string", "name": "string", "color": "#HEX" }
  ]
}
```

---

### 3.2 Feature Flags por Lead

**Necessidade:** Habilitar/desabilitar funcionalidades específicas para determinados leads.

**Endpoints necessários:**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/leads/{id}/flags` | Lista todas as flags de um lead |
| PUT | `/api/v1/leads/{id}/flags/{flagName}` | Atualiza valor de uma flag |
| DELETE | `/api/v1/leads/{id}/flags/{flagName}` | Remove flag do lead |

**Modelo de dados - Flag:**
```json
{
  "flag_name": "string",
  "enabled": "boolean",
  "metadata": "object (opcional)"
}
```

**Flags sugeridas:**
- `whatsapp_enabled` - Enable/disable WhatsApp para o lead
- `auto_followup` - Enable/disable follow-up automático
- `ai_responses` - Enable/disable respostas de IA
- `priority_support` - Prioridade no atendimento

---

### 3.3 Flags Globais do Sistema

**Necessidade:** Configurações globais que afetam todos os leads/usuários.

**Endpoints necessários:**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/flags` | Lista todas as flags globais |
| PUT | `/api/v1/flags/{flagName}` | Atualiza flag global |

**Modelo de dados:**
```json
{
  "flag_name": "string",
  "value": "string | number | boolean",
  "description": "string",
  "updated_at": "datetime"
}
```

---

### 3.4 Estatísticas de Tracking (Links Rastreáveis)

**Necessidade:** O frontend precisa de métricas detalhadas de conversão por link rastreável.

**Endpoints necessários:**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/stats/tracking` | Estatísticas gerais de tracking |
| GET | `/api/v1/tracked-links/{id}/stats` | Estatísticas de um link específico |

**Modelo de dados - Estatísticas de Tracking:**
```json
{
  "total_clicks": "number",
  "unique_visitors": "number",
  "leads_generated": "number",
  "conversion_rate": "number",
  "clicks_by_date": [
    { "date": "2026-04-01", "clicks": 150, "leads": 12 }
  ],
  "top_sources": [
    { "source": "Instagram", "clicks": 500, "leads": 45 }
  ],
  "devices": {
    "mobile": "65%",
    "desktop": "30%",
    "tablet": "5%"
  }
}
```

---

### 3.5 CRUD Completo de Tracked Links

**Necessidade:** O frontend currently só faz leitura e criação. Precisa de update e delete.

**Endpoints necessários:**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| PUT | `/api/v1/tracked-links/{id}` | Atualiza um link rastreável |
| DELETE | `/api/v1/tracked-links/{id}` | Remove um link rastreável |

**Modelo de dados - Tracked Link:**
```json
{
  "id": "string",
  "original_url": "string",
  "short_code": "string",
  "name": "string (opcional)",
  "utm_source": "string (opcional)",
  "utm_medium": "string (opcional)",
  "utm_campaign": "string (opcional)",
  "utm_content": "string (opcional)",
  "utm_term": "string (opcional)",
  "is_active": "boolean",
  "clicks": "number",
  "created_at": "datetime",
  "expires_at": "datetime (opcional)"
}
```

---

### 3.6 Gerenciamento de Usuários

**Necessidade:** O frontend precisa gerenciar usuários do sistema (corretores, admins).

**Endpoints necessários:**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/users` | Lista todos os usuários |
| POST | `/api/v1/users` | Cria um novo usuário |
| GET | `/api/v1/users/{id}` | Detalhes de um usuário |
| PUT | `/api/v1/users/{id}` | Atualiza um usuário |
| DELETE | `/api/v1/users/{id}` | Remove um usuário |
| PUT | `/api/v1/users/{id}/status` | Ativa/desativa usuário |

**Modelo de dados - Usuário:**
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "role": "admin | corretor | viewer",
  "status": "active | inactive",
  "phone": "string (opcional)",
  "avatar_url": "string (opcional)",
  "created_at": "datetime",
  "last_login": "datetime (opcional)"
}
```

---

### 3.7 Sistema de Notificações

**Necessidade:** O frontend precisa configurar preferências de notificação por usuário.

**Endpoints necessários:**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/users/{id}/notifications` | Lista preferências de notificação |
| PUT | `/api/v1/users/{id}/notifications` | Atualiza preferências |
| POST | `/api/v1/notifications/test` | Envia notificação de teste |

**Modelo de dados - Preferências de Notificação:**
```json
{
  "user_id": "string",
  "notifications": [
    {
      "type": "new_lead | hot_lead | followup_pending | unread_message | conversion",
      "enabled": "boolean",
      "channels": ["email", "push", "sms"],
      "schedule": "immediate | digest_hourly | digest_daily"
    }
  ],
  "email": "string (para envio)",
  "phone": "string (para SMS)"
}
```

---

### 3.8 Reset de Lead

**Necessidade:** Permitir reiniciar o lifecycle de um lead do zero.

**Endpoints necessários:**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/v1/leads/{id}/reset` | Reseta o lead para o estado inicial |

**Requisição:**
```json
{
  "reason": "string (opcional)",
  "reset_conversation": "boolean (default: true)",
  "reset_score": "boolean (default: true)"
}
```

**Resposta:**
```json
{
  "success": true,
  "lead_id": "string",
  "previous_status": "string",
  "new_status": "string"
}
```

---

### 3.9 Intervenção Humana e Follow-up

**Necessidade:** Funcionalidades já existem mas precisam ser verificadas.

**Endpoints existentes (verificar se funcionam):**
- `POST /api/v1/leads/{id}/intervene` - Coloca em intervenção humana
- `POST /api/v1/leads/{id}/release-followup` - Libera do follow-up
- `GET /api/v1/leads/{id}/follow-up-status` - Ver status de follow-up

---

## 4. Requisitos Não-Funcionais

### 4.1 Autenticação
- Todos os endpoints devem aceitar Bearer Token no header
- Token pode ser passado via `Authorization: Bearer {token}`

### 4.2 Paginação
- Endpoints de lista devem 支持 paginação com `limit` e `offset`
- Resposta deve incluir metadados de paginação

### 4.3 Rate Limiting
- Implementar rate limiting para evitar abuse
- Retornar headers `X-RateLimit-Remaining` e `X-RateLimit-Reset`

### 4.4 Versionamento
- Usar versionamento na URL: `/api/v1/`
- Manter retrocompatibilidade durante transições

---

## 5. Priorização

| Prioridade | Feature | Justificativa |
|------------|---------|----------------|
| **Alta** | Tags/Labels | Usuários não conseguem classificar leads |
| **Alta** | CRUD Tracked Links | Funcionalidade incompleta |
| **Média** | Estatísticas de Tracking | Métricas importantes para marketing |
| **Média** | Gerenciamento de Usuários | Admin precisa gerenciar equipe |
| **Média** | Feature Flags | Funcionalidade avançada |
| **Baixa** | Sistema de Notificações | Pode ser implementado depois |

---

## 6. Questões Abertas

1. **Tags são globais ou por usuário?** - Definir se tags são compartilhadas ou individuais
2. **Quantas flags por lead?** - Definir limite e validação
3. **Notificações via qual provider?** - SMS, Push (FCM), Email (qual provider?)
4. **Reset de lead pode perder dados?** - Definir política de retention

---

## 7. Próximos Passos

1. **[ ]** Implementar endpoints de Tags
2. **[ ]** Implementar CRUD de Tracked Links (PUT/DELETE)
3. **[ ]** Expor estatísticas de Tracking
4. **[ ]** Implementar gerenciamento de Usuários
5. **[ ]** Implementar Feature Flags
6. **[ ]** Implementar Sistema de Notificações

---

*Documento gerado para alinhamento entre Frontend e Backend do Dashboard Átus*
