# Kanban Board — Feature

## Visão Geral
Visualização de pipeline estilo Kanban com colunas por status de lead.

## Rota
`/board`

## Estrutura

### Colunas
| Status | Label | Cor |
|---|---|---|
| NOVO | Novos | Amarelo |
| EM_ATENDIMENTO | Em Atendimento | Azul |
| AGUARDANDO_RETORNO | Aguardando Retorno | Laranja |
| CONVERTIDO | Convertidos | Verde |
| PERDIDO | Perdidos | Vermelho |

### Card de Lead
- Nome (ou "Sem nome")
- Telefone
- Tipo de interesse (badge)
- Canal de origem
- Data de criação
- Flag de follow-up ativo (FU)

## Componentes
- **Página:** `src/app/board/page.tsx`
- **Layout:** Horizontal scroll com colunas

## Funcionalidades
1. **Carregamento:** Busca leads por status (100 por coluna)
2. **Busca:** Filtro global por nome/telefone/email
3. **Seleção:** Click no card abre painel de detalhes
4. **Status:** Botões para mudar status diretamente

## API
```typescript
api.getPaginatedLeads({ status: "NOVO", limit: 100, offset: 0 })
api.updateLead(id, { status: "CONVERTIDO" })
```

## Design (Blackstar)
- Fundo preto (#000000)
- Border-top colored por coluna
- Cards com borda sutil (8%)
- Hover: borda mais clara
- Selected: fundo mais claro
