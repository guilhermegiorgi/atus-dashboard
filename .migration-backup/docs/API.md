# API Documentation - AtusBot

Base URL: `https://chatbot.atusbr.com.br`

## Autenticação

A maioria dos endpoints requer autenticação via API Key.

**Headers:**
```
x-api-key: atus-mcp-api-key-2026
```

**Ou via query parameter:**
```
?token=atus-mcp-api-key-2026
```

---

## Endpoints Públicos

### Health Check
```
GET /health
```
Retorna o status do servidor.

**Response:**
```json
{"status": "ok"}
```

### Click em Link (Tracking)
```
GET /track/:codigoRef
```
**Query params opcionais:**
- `utm_source` (ex: facebook, instagram, corretor)
- `utm_medium` (ex: cpc, social, perfil)
- `utm_campaign` (ex: lancamento2026)
- `utm_content` (variante do anúncio)
- `utm_term` (palavra-chave)
- `url` (URL de destino após o WhatsApp)

**Comportamento:**
1. Registra o clique na tabela `link_click`
2. Redireciona para WhatsApp com mensagem contendo o código do link
3. Se for bot, apenas redireciona sem registrar clique

### Webhook WUZAPI
```
POST /webhook/wuzapi
```
Recebe webhooks do WUZAPI (WhatsApp).

**Body (form-urlencoded):**
```
jsonData={"Event":{"Info":{"SenderAlt":"5511999999999:48@s.whatsapp.net","IsFromMe":false,"IsGroup":false},"Message":{"conversation":"olá"}}}
```

---

## Endpoints API v1 (Requer Autenticação)

### Leads

#### Listar Leads
```
GET /api/v1/leads
```
**Query params opcionais:**
- `status` (NOVO, EM_ATENDIMENTO, CONVERTIDO, PERDIDO, AGUARDANDO_RETORNO)
- `limit` (padrão: 20)
- `page` (padrão: 1)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "telefone": "5565999999999",
      "nome_completo": "João Silva",
      "email": "joao@email.com",
      "estado_civil": "SOLTEIRO",
      "tipo_interesse": "COMPRA",
      "status": "NOVO",
      "created_at": "2026-03-31T10:00:00Z"
    }
  ],
  "total": 10,
  "page": 1
}
```

#### Buscar Lead por ID
```
GET /api/v1/leads/:id
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "telefone": "5565999999999",
    "nome_completo": "João Silva",
    "estado_civil": "SOLTEIRO",
    "email": "joao@email.com",
    "aniversario": "1990-05-15T00:00:00Z",
    "tipo_interesse": "COMPRA",
    "renda_comprovada": 8000,
    "fgts": 15000,
    "tem_entrada": true,
    "entrada": 30000,
    "tem_carteira_assinada": true,
    "renda_comprovada_conjuge": 0,
    "fgts_conjuge": 0,
    "status": "NOVO",
    "em_follow_up": false,
    "resetado_em": null,
    "created_at": "2026-03-31T10:00:00Z"
  }
}
```

#### Atualizar Lead
```
PUT /api/v1/leads/:id
```
**Body (todos opcionais):**
```json
{
  "nome_completo": "João Silva",
  "email": "joao@email.com",
  "estado_civil": "SOLTEIRO",
  "aniversario": "1990-05-15",
  "tipo_interesse": "COMPRA",
  "renda_comprovada": 8000,
  "fgts": 15000,
  "tem_entrada": true,
  "entrada": 30000,
  "tem_carteira_assinada": true,
  "renda_comprovada_conjuge": 0,
  "fgts_conjuge": 0,
  "status": "EM_ATENDIMENTO",
  "observacoes": "Lead muito interessado"
}
```

#### Deletar Lead
```
DELETE /api/v1/leads/:id
```

#### Listar Conversas de um Lead
```
GET /api/v1/leads/:id/conversas
```

#### Listar Mensagens de uma Conversa
```
GET /api/v1/conversas/:id/mensagens
```
**Query params opcionais:**
- `limit` (padrão: 50)

---

### Corretores

#### Listar Corretores
```
GET /api/v1/corretores
```

#### Criar Corretor
```
POST /api/v1/corretores
```
**Body:**
```json
{
  "nome": "João Silva",
  "telefone": "5565999999999",
  "email": "joao@email.com",
  "especialidade": "Imóveis de luxo"
}
```

#### Atualizar Corretor
```
PUT /api/v1/corretores/:id
```

---

### Estatísticas

#### Estatísticas de Leads
```
GET /api/v1/stats/leads
```
**Response:**
```json
{
  "data": {
    "total": 50,
    "novos": 15,
    "em_atendimento": 20,
    "convertidos": 10,
    "perdidos": 5,
    "completos": 35,
    "incompletos": 15
  }
}
```

---

### Links de Tracking

#### Criar Link Rastreável
```
POST /api/v1/tracked-links
```
**Body:**
```json
{
  "nome": "Campanha Facebook",
  "nome_campanha": "lancamento2026",
  "source": "facebook",
  "medium": "cpc",
  "content": "banner_lateral",
  "whatsapp_num": "5565999999999",
  "whatsapp_msg": "Olá! Gostaria de saber mais sobre os imóveis",
  "ativo": true
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "nome": "Campanha Facebook",
    "codigo_ref": "ABCD1234",
    "whatsapp_num": "5565999999999",
    "clicks": 0,
    "leads_convertidos": 0,
    "ativo": true
  },
  "link": "https://chatbot.atusbr.com.br/track/ABCD1234"
}
```

#### Listar Links
```
GET /api/v1/tracked-links
```
**Query params opcionais:**
- `ativo` (true/false)
- `source` (facebook, instagram, corretor, whatsapp)
- `limit` (padrão: 20)

#### Buscar Link por ID
```
GET /api/v1/tracked-links/:id
```

---

## Endpoints MCP (Requer Autenticação)

### MCP - Chat
```
POST /mcp/chat
```
**Body:**
```json
{
  "telefone": "5565999999999",
  "mensagem": "Olá, preciso de informações"
}
```

**Response:**
```json
{
  "telefone": "5565999999999",
  "resposta": "Oi! Sou a Gilda..."
}
```

### MCP - Leads

#### Buscar Lead por Telefone
```
GET /mcp/lead/:telefone
```

#### Criar Lead
```
POST /mcp/lead
```
**Body:**
```json
{
  "telefone": "5565999999999",
  "nome_completo": "João Silva",
  "email": "joao@email.com"
}
```

#### Atualizar Lead
```
PUT /mcp/lead/:id
```
**Body (todos os campos são opcionais):**
```json
{
  "nome_completo": "João Silva",
  "email": "joao@email.com",
  "estado_civil": "CASADO",
  "aniversario": "1990-05-15",
  "tipo_interesse": "COMPRA",
  "renda_comprovada": 8000,
  "fgts": 15000,
  "tem_entrada": true,
  "entrada": 30000,
  "tem_carteira_assinada": true,
  "renda_comprovada_conjuge": 5000,
  "fgts_conjuge": 10000,
  "status": "EM_ATENDIMENTO"
}
```

#### Listar Leads (MCP)
```
GET /mcp/leads
```
**Query params:**
- `status` (NOVO, EM_ATENDIMENTO, CONVERTIDO, PERDIDO)
- `limit` (padrão: 20)

#### Estatísticas (MCP)
```
GET /mcp/stats
```

---

## Dashboard - Gestão de Leads via WhatsApp

### Histórico de Conversas

#### Listar Conversas de um Lead
```
GET /api/v1/leads/:id/conversas
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "lead_id": "uuid",
      "status": "ATIVA",
      "started_at": "2026-03-31T10:00:00Z",
      "ended_at": null,
      "message_count": 15
    }
  ]
}
```

#### Listar Mensagens de uma Conversa
```
GET /api/v1/conversas/:id/mensagens
```

**Query params opcionais:**
- `limit` (padrão: 50, máximo: 200)
- `before` (timestamp ISO para paginação)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "conversa_id": "uuid",
      "tipo": "TEXTO",
      "conteudo": "Olá, preciso de informações",
      "direcao": "ENTRADA",
      "midia_url": "",
      "timestamp": "2026-03-31T10:00:00Z"
    },
    {
      "id": "uuid",
      "conversa_id": "uuid",
      "tipo": "TEXTO",
      "conteudo": "Oi! Sou a Gilda da Átus...",
      "direcao": "SAIDA",
      "midia_url": "",
      "timestamp": "2026-03-31T10:00:01Z"
    }
  ],
  "total": 15,
  "has_more": false
}
```

**Tipos de mensagem:**
- `TEXTO` - Texto simples
- `IMAGEM` - Imagem (midia_url contém a URL)
- `AUDIO` - Áudio gravado
- `VIDEO` - Vídeo
- `DOCUMENTO` - Documento/PDF

**Direção:**
- `ENTRADA` - Mensagem do lead
- `SAIDA` - Mensagem do bot/corretor

---

### Envio de Mensagens (Dashboard)

#### Enviar Mensagem via WhatsApp
```
POST /api/v1/leads/:id/send-message
```

**Body:**
```json
{
  "mensagem": "Olá Guilherme! Sou o corretor João..."
}
```

**Response:**
```json
{
  "success": true,
  "message_id": "uuid",
  "status": "sent"
}
```

**Comportamento:**
1. Envia mensagem via WUZAPI
2. Registra na tabela `mensagem` com `direcao=SAIDA`
3. Atualiza `ultimo_contato` do lead

#### Enviar Mensagem com Modo Follow-up
```
POST /api/v1/leads/:id/send-message
```

**Body:**
```json
{
  "mensagem": "Olá Guilherme! Posso te ajudar?",
  "follow_up": true
}
```

Quando `follow_up=true`:
1. Lead entra em modo follow-up (`em_follow_up=true`)
2. Bot não processa mensagens automáticas
3. Corretor pode conversar manualmente
4. Use `/api/v1/leads/:id/release-followup` para sair do modo

---

### Gerenciamento de Follow-up

#### Colocar Lead em Follow-up (Intervenção Humana)
```
POST /api/v1/leads/:id/intervene
```

**Body:**
```json
{
  "type": "HUMAN_TAKEOVER",
  "reason": "Lead quer falar com corretor"
}
```

**Response:**
```json
{
  "success": true,
  "lead_id": "uuid",
  "status": "AGUARDANDO_RETORNO"
}
```

**Tipos de intervenção:**
- `HUMAN_TAKEOVER` - Corretor assume a conversa
- `PAUSED` - Conversa pausada
- `URGENT` - Lead urgente

#### Remover Lead do Follow-up
```
POST /api/v1/leads/:id/release-followup
```

**Response:**
```json
{
  "success": true,
  "lead_id": "uuid",
  "status": "NOVO"
}
```

**Comportamento:**
1. `em_follow_up = false`
2. `followup_rodadas = 0`
3. Bot volta a processar mensagens automaticamente

#### Verificar Status de Follow-up
```
GET /api/v1/leads/:id/follow-up-status
```

**Response:**
```json
{
  "lead_id": "uuid",
  "em_follow_up": true,
  "followup_rodadas": 3,
  "followup_expira_em": "2026-04-01T10:00:00Z",
  "intervention_type": "HUMAN_TAKEOVER"
}
```

---

### Feature Flags do Lead

#### Listar Flags de um Lead
```
GET /api/v1/leads/:id/flags
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "nome": "GO_AI_ENABLED",
      "valor": true,
      "descricao": "Go uses Gemini API directly",
      "is_global": false,
      "updated_at": "2026-03-31T10:00:00Z"
    }
  ]
}
```

#### Atualizar Flag do Lead
```
PUT /api/v1/leads/:id/flags/:flagName
```

**Body:**
```json
{
  "valor": true
}
```

**Flags disponíveis por lead:**
- `GO_RESPONSE_ENABLED` - Go responde WhatsApp
- `GO_AI_ENABLED` - Go usa IA (Gemini)
- `HUMAN_INTERVENTION_MODE` - Modo intervenção humana

#### Listar Todas as Flags Globais
```
GET /api/v1/flags
```

#### Atualizar Flag Global
```
PUT /api/v1/flags/:flagName
```

**Body:**
```json
{
  "valor": true
}
```

---

### Notas do Lead

#### Listar Notas
```
GET /api/v1/leads/:id/notes
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "lead_id": "uuid",
      "content": "Lead interessado em apartamento no centro",
      "author_id": "uuid",
      "author_name": "Corretor João",
      "created_at": "2026-03-31T10:00:00Z",
      "type": "observation"
    }
  ]
}
```

#### Criar Nota
```
POST /api/v1/leads/:id/notes
```

**Body:**
```json
{
  "content": "Lead quer agendar visita para sábado",
  "type": "observation"
}
```

**Tipos de nota:**
- `observation` - Observação geral
- `visit` - Agendamento de visita
- `follow_up` - Nota de follow-up
- `urgent` - Nota urgente

#### Atualizar Nota
```
PUT /api/v1/notes/:noteId
```

**Body:**
```json
{
  "content": "Visita agendada para 05/04/2026 às 14h"
}
```

#### Deletar Nota
```
DELETE /api/v1/notes/:noteId
```

---

### Reset de Lead

#### Resetar Dados do Lead
```
POST /api/v1/leads/:id/reset
```

**Response:**
```json
{
  "success": true,
  "lead_id": "uuid",
  "status": "NOVO",
  "reseted_fields": ["nome_completo", "email", "estado_civil", ...],
  "resetado_em": "2026-03-31T10:00:00Z"
}
```

**Comportamento:**
1. Limpa todos os campos de qualificação
2. Define `resetado_em` com timestamp atual
3. Remove do modo follow-up
4. Bot reinicia coleta do zero na próxima mensagem

---

### Estatísticas Detalhadas

#### Estatísticas Gerais
```
GET /api/v1/stats/leads
```

**Response:**
```json
{
  "data": {
    "total": 50,
    "novos": 15,
    "em_atendimento": 20,
    "convertidos": 10,
    "perdidos": 5,
    "completos": 35,
    "incompletos": 15,
    "em_follow_up": 8,
    "taxa_conversao": 20.0,
    "tempo_medio_resposta": "5min",
    "por_status": {
      "NOVO": 15,
      "EM_ATENDIMENTO": 20,
      "CONVERTIDO": 10,
      "PERDIDO": 5
    },
    "por_fonte": {
      "facebook": 25,
      "corretor": 15,
      "instagram": 10
    },
    "por_estado_civil": {
      "SOLTEIRO": 30,
      "CASADO": 15,
      "DIVORCIADO": 5
    }
  }
}
```

#### Estatísticas de Tracking
```
GET /api/v1/stats/tracking
```

**Response:**
```json
{
  "data": {
    "total_clicks": 1500,
    "total_conversoes": 45,
    "taxa_conversao_geral": 3.0,
    "por_source": {
      "facebook": {
        "clicks": 1200,
        "conversoes": 35,
        "taxa": 2.9
      },
      "corretor": {
        "clicks": 200,
        "conversoes": 8,
        "taxa": 4.0
      },
      "instagram": {
        "clicks": 100,
        "conversoes": 2,
        "taxa": 2.0
      }
    },
    "por_medium": {
      "cpc": {"clicks": 1200, "conversoes": 35},
      "perfil": {"clicks": 200, "conversoes": 8},
      "organic": {"clicks": 100, "conversoes": 2}
    }
  }
}
```

---

## Tabelas do Banco de Dados

### lead
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | ID único do lead |
| telefone | VARCHAR(20) | Número de telefone |
| nome_completo | VARCHAR(200) | Nome completo |
| estado_civil | VARCHAR(20) | SOLTEIRO, CASADO, DIVORCIADO, VIUVO, UNIAO_ESTAVEL |
| email | VARCHAR(100) | Email |
| aniversario | TIMESTAMP | Data de nascimento |
| tipo_interesse | VARCHAR(20) | COMPRA, VENDA, LOCACAO, LANCAMENTOS, OUTRO |
| renda_comprovada | DECIMAL(15,2) | Renda mensal comprovada |
| fgts | DECIMAL(15,2) | Saldo FGTS |
| tem_entrada | BOOLEAN | Tem entrada |
| entrada | DECIMAL(15,2) | Valor da entrada |
| tem_carteira_assinada | BOOLEAN | Tem carteira assinada 3+ anos |
| renda_comprovada_conjuge | DECIMAL(15,2) | Renda do cônjuge |
| fgts_conjuge | DECIMAL(15,2) | FGTS do cônjuge |
| status | VARCHAR(30) | NOVO, EM_ATENDIMENTO, CONVERTIDO, PERDIDO, AGUARDANDO_RETORNO |
| em_follow_up | BOOLEAN | Está em modo follow-up |
| followup_rodadas | INT | Número de rodadas no follow-up |
| followup_expira_em | TIMESTAMP | Quando o follow-up expira |
| resetado_em | TIMESTAMP | Quando foi resetado (NULL se nunca) |
| intervention_type | VARCHAR(30) | Tipo de intervenção (HUMAN_TAKEOVER, PAUSED) |
| intervention_at | TIMESTAMP | Quando foi intervenção |
| link_click_id | UUID | ID do clique que originou o lead |
| codigo_ref | VARCHAR(20) | Código de referência do link |
| corretor_id | UUID | ID do corretor atribuído |
| observacoes | TEXT | Observações gerais |
| localizacao | VARCHAR(255) | Localização desejada |
| created_at | TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | Última atualização |

### conversa
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | ID da conversa |
| lead_id | UUID | ID do lead |
| status | VARCHAR(30) | ATIVA, ENCERRADA |
| started_at | TIMESTAMP | Início da conversa |
| ended_at | TIMESTAMP | Fim da conversa |

### mensagem
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | ID da mensagem |
| conversa_id | UUID | ID da conversa |
| tipo | VARCHAR(30) | TEXTO, IMAGEM, AUDIO, VIDEO |
| conteudo | TEXT | Conteúdo da mensagem |
| direcao | VARCHAR(10) | ENTRADA, SAIDA |
| midia_url | VARCHAR(500) | URL da mídia (se houver) |
| timestamp | TIMESTAMP | Data/hora da mensagem |

### tracked_link
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | ID do link |
| nome | VARCHAR(100) | Nome do link |
| codigo_ref | VARCHAR(20) | Código de referência (8 chars) |
| source | VARCHAR(50) | facebook, instagram, corretor, whatsapp |
| medium | VARCHAR(50) | cpc, social, perfil, organic |
| whatsapp_num | VARCHAR(20) | Número WhatsApp destino |
| whatsapp_msg | TEXT | Mensagem pré-preenchida |
| clicks | INT | Total de cliques |
| leads_convertidos | INT | Leads convertidos |
| ativo | BOOLEAN | Link ativo |

### link_click
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | ID do clique |
| tracked_link_id | UUID | ID do link rastreado |
| ip | VARCHAR(45) | IP do usuário |
| user_agent | TEXT | User-Agent |
| utm_source | VARCHAR(100) | UTM Source |
| utm_medium | VARCHAR(100) | UTM Medium |
| utm_campaign | VARCHAR(100) | UTM Campaign |
| utm_content | VARCHAR(100) | UTM Content |
| utm_term | VARCHAR(100) | UTM Term |
| convertido | BOOLEAN | Se foi convertido |
| lead_id | UUID | ID do lead (após conversão) |
| clicked_at | TIMESTAMP | Data/hora do clique |

### corretor
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | ID do corretor |
| nome | VARCHAR(100) | Nome |
| telefone | VARCHAR(20) | Telefone |
| email | VARCHAR(100) | Email |
| especialidade | VARCHAR(100) | Especialidade |
| ativo | BOOLEAN | Corretor ativo |

### feature_flag
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | ID da flag |
| nome | VARCHAR(100) | Nome da flag |
| valor | BOOLEAN | Valor (true/false) |
| descricao | TEXT | Descrição |
| lead_id | UUID | ID do lead (NULL = global) |

### notificacao (Notas do Lead)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | ID da nota |
| lead_id | UUID | ID do lead |
| tipo | VARCHAR(30) | observation, visit, follow_up, urgent |
| conteudo | TEXT | Conteúdo da nota |
| usuario_id | UUID | ID do usuário que criou |
| created_at | TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | Última atualização |

**Flags disponíveis:**
- `GO_RESPONSE_ENABLED` - Go responde WhatsApp (em vez de n8n)
- `GO_AI_ENABLED` - Go usa IA (Gemini) para processar
- `DEBUG_COMPARE_MODE` - Compara n8n vs Go nos logs
- `HUMAN_INTERVENTION_MODE` - Modo intervenção humana

---

## Fluxo de Tracking

1. **Criar link rastreável:**
   ```
   POST /api/v1/tracked-links
   ```

2. **Usar o link em campanhas:**
   ```
   https://chatbot.atusbr.com.br/track/ABCD1234?utm_source=facebook&utm_medium=cpc
   ```

3. **Usuário clica → redirect para WhatsApp com código na mensagem**

4. **Bot processa a mensagem e salva o lead**

5. **Relatórios:**
   - `/api/v1/tracked-links` - cliques e conversões por link
   - `/api/v1/stats/leads` - estatísticas de leads

---

## Variáveis de Ambiente

```
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=***
DB_NAME=atus_bot

# Server
SERVER_PORT=8080
SERVER_HOST=0.0.0.0

# WUZAPI
WUZAPI_URL=https://zap.espaco17.cloud
WUZAPI_TOKEN=atus-***
WUZAPI_WEBHOOK=https://chatbot.atusbr.com.br/webhook/wuzapi

# API
API_KEY=atus-mcp-api-key-2026

# AI (Gemini)
AI_PROVIDER=gemini
GEMINI_API_KEY=AIzaSy***
AI_MODEL=models/gemini-3.1-flash-lite-preview

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=***

# Debug
DEBUG_LEAK_AI_JSON=false
```

---

*AtusBot API v1.0 - Átus Negócios Imobiliários*
