# Plano de Aprimoramento - Átus Dashboard
claude --resume 2cf203d8-38da-41a5-ad7f-8659ed17e650
## Contexto

O objetivo é transformar o dashboard atual em um verdadeiro **gestor de Leads** mais parecido com a imagem de referência, mantendo a identidade visual **Blackstar** (design system ultra-minimalista com fundo preto puro).

A imagem de referência mostra:
- Layout com sidebar fixa à esquerda
- Lista de leads no centro com colunas principais (Name, Status, Last Contact, Value)
- Painel de detalhes do lead à direita quando selecionado
- Pipeline com colunas visuais (New, In Progress, Won, Lost)
- Cards de métricas no topo

---

## Análise do Código Existente

### Estrutura atual:
- `src/app/leads/page.tsx` - Lista de leads com tabela completa
- `src/app/pipeline/page.tsx` - Fila operacional com detalhes
- `src/app/dashboard/page.tsx` - Dashboard com métricas
- `src/app/conversations/page.tsx` - Caixa de conversas
- `src/components/leads/LeadDetailModal.tsx` - Modal de detalhes
- `src/lib/api/client.ts` - API client completa

### O que já funciona bem:
- CRUD completo de leads
- Filtros avançados
- Estatísticas e métricas
- Integração com API do AtusBot
- Componentes UI base (shadcn-style)

---

## Funcionalidades a Implementar

### 1. Layout Unificado com Painel Lateral (PRIORIDADE ALTA)

**Objetivo:** Criar um layout que mostre lista de leads + painel de detalhes lado a lado (como na imagem).

**Arquivos a criar/modificar:**
- `src/app/leads/page.tsx` - Adaptar para layout com painel
- `src/components/leads/LeadDetailPanel.tsx` - Novo componente de painel lateral

**Comportamento:**
- Quando nenhum lead selecionado: mostra apenas lista
- Quando lead selecionado: painel desliza da direita
- O painel mostra: dados do lead + últimas conversas + ações rápidas

---

### 2. Pipeline Visual Kanban (PRIORIDADE ALTA)

**Objetivo:** Visualização estilo Kanban com colunas por status.

**Arquivos a criar:**
- `src/app/board/page.tsx` - Nova página de pipeline Kanban
- `src/components/leads/PipelineColumn.tsx` - Componente de coluna
- `src/components/leads/LeadCard.tsx` - Card de lead para o Kanban

**Colunas:**
| Status | Cor |
|--------|-----|
| NOVO | Amarelo |
| EM_ATENDIMENTO | Azul |
| CONVERTIDO | Verde |
| PERDIDO | Vermelho |
| AGUARDANDO_RETORNO | Laranja |

**Funcionalidades:**
- Drag & drop entre colunas (opcional - prioritário visual)
- Contador de leads por coluna
- Click no card abre painel de detalhes
- Filtros por origem/tipo de interesse

---

### 3. Dashboard com Métricas Modernas (PRIORIDADE MÉDIA)

**Objetivo:** Cards de métricas mais proeminentes no topo.

**Arquivos a modificar:**
- `src/app/dashboard/page.tsx` - Redesenhar cards

**Métricas a mostrar:**
- **Novos Leads** (hoje/semana)
- **Taxa de Conversão** (%)
- **Receita** (somatório de entradas)
- **Valor Médio por Lead**
- **Leads em Follow-up**
- **Tempo Médio de Resposta**

**Estilo:**
- Números grandes e destaque
- Pequeno gráfico de tendência (opcional)
- Comparação com período anterior

---

### 4. Busca Global e Acessibilidade (PRIORIDADE MÉDIA)

**Objetivo:** Barra de busca mais acessível e filtros rápidos.

**A criar:**
- `src/components/layout/GlobalSearch.tsx` - Componente de busca global

**Funcionalidades:**
- Busca por nome, telefone, email
- Atalho Ctrl+K para abrir busca
- Recent leads/contatos rápido

---

## Design System - Adaptações

Manter o **Blackstar** já implementado, mas com ajustes:

- **Sidebar**: Fundo #000000 com borda sutil 12%
- **Cards**: Fundo #000000 com borda 12%, sem sombras
- **Textos**: Hierarchy com 100%, 60%, 40% de opacidade
- **Botões**: Outline only, pill shape
- **Hover**: Apenas mudança de opacidade/borda

---

## Implementação em Fases

### Fase 1: Layout Unificado
1. Criar componente LeadDetailPanel (semelhante ao modal mas lateral)
2. Modificar page de leads para usar o novo layout

### Fase 2: Pipeline Kanban
1. Criar página /board
2. Criar componentes PipelineColumn e LeadCard
3. Implementar mudança de status via drag ou click

### Fase 3: Dashboard Melhorado
1. Redesenhar cards de métricas
2. Adicionar comparações temporais

### Fase 4: Busca Global
1. Criar componente de busca
2. Integrar com atalhos de teclado

---

## Testes de Verificação

1. **Leads listam corretamente** - Acessar /leads e verificar dados
2. **Painel lateral abre** - Clicar em um lead e ver painel
3. **Pipeline mostra colunas** - Acessar /board e ver Kanban
4. **Métricas aparecem** - Verificar /dashboard
5. **Design Blackstar** - Validar cores e tipografia
6. **Responsividade** - Testar em diferentes tamanhos

---

## API Utilizada

Endpoints relevantes já implementados em `src/lib/api/client.ts`:
- `getPaginatedLeads()` - Lista de leads
- `getLeadById()` - Detalhes do lead
- `updateLead()` - Atualizar lead
- `getFollowupQueue()` - Fila operacional
- `getLeadOperationalStatus()` - Status operacional
- `getLeadActions()` - Ações do lead
