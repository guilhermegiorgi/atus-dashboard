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

---

## Endpoints API v1 (Requer Autenticação)

### Leads

#### Listar Leads
```
GET /api/v1/leads
```
Query params opcionais: `status`

**Response:**
```json
{
  "data": [...]
}
```

#### Buscar Lead por ID
```
GET /api/v1/leads/:id
```

#### Atualizar Lead
```
PUT /api/v1/leads/:id
```
Body:
```json
{
  "nome_completo": "João Silva",
  "email": "joao@email.com",
  "telefone": "5565999999999",
  "status": "EM_ATENDIMENTO"
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
Body:
```json
{
  "nome": "João Silva",
  "telefone": "5565999999999",
  "email": "joao@email.com",
  "especialidade": "Imóveis"
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
    "total": 10,
    "novos": 5,
    "em_atendimento": 3,
    "convertidos": 1,
    "perdidos": 1
  }
}
```

---

### Links de Tracking (UTM)

#### Criar Link Rastreável
```
POST /api/v1/tracked-links
```
Body:
```json
{
  "nome": "Campanha Facebook",
  "nome_campanha": "lancamento2026",
  "source": "facebook",
  "medium": "cpc",
  "content": "banner_lateral",
  "whatsapp_num": "5565999999999",
  "whatsapp_msg": "Olá! Gostaria de saber mais sobre os imóveis"
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
Query params opcionais: `ativo`, `limit`, `offset`

#### Buscar Link por ID
```
GET /api/v1/tracked-links/:id
```

---

## Endpoints de Tracking

### Click em Link
```
GET /track/:codigoRef
```
Parametros UTM opcionais:
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `utm_term`
- `url` (URL de destino após o WhatsApp)

**Redirect** para WhatsApp com mensagem:
```
https://wa.me/5565999999999?text=Olá!+Código+ABC12345
```

---

## Endpoints MCP (Requer Autenticação)

### Processar Mensagem do Chatbot
```
POST /mcp/chat
```
Body:
```json
{
  "telefone": "5565999999999",
  "mensagem": "Olá, preciso de informações sobre imóveis"
}
```

**Response:**
```json
{
  "telefone": "5565999999999",
  "resposta": "Olá! Ficamos felizes com seu contato..."
}
```

---

### MCP - Leads

#### Buscar Lead por Telefone
```
GET /mcp/lead/:telefone
```

#### Criar Lead
```
POST /mcp/lead
```
Body:
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
Body:
```json
{
  "nome_completo": "João Silva",
  "email": "joao@email.com",
  "status": "EM_ATENDIMENTO"
}
```

#### Listar Leads (MCP)
```
GET /mcp/leads
```
Query params opcionais: `status`

#### Estatísticas (MCP)
```
GET /mcp/stats
```

---

## Tabelas de Tracking

### tracked_links
Armazena os links rastreáveis criados.

### link_clicks
Registra cada clique nos links, incluindo:
- IP do usuário
- UserAgent
- Dados UTM (source, medium, campaign, content, term)
- Código único por clique
- Status de conversão
- Telefone do lead (após conversão)

### leads
Campos adicionados para tracking:
- `codigo_ref`: Código de referência do link
- `link_click_id`: ID do click que originou o lead

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

3. **Usuário clica → redirect para WhatsApp com código único na mensagem**

4. **Se o lead enviar mensagem incluindo o código:**
   - O bot captura o código da mensagem
   - Vincula o lead ao click original
   - Marca o click como "convertido"

5. **Relatórios:**
   - `/api/v1/tracked-links` - mostra cliques e conversões por link
   - `link_clicks` no banco - detalhes de cada clique
