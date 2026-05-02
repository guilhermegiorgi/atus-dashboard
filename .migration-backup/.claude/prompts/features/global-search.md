# Global Search — Feature

## Visão Geral
Busca global disponível em todas as páginas do dashboard, acessível via atalho de teclado.

## Atalho
- **Ctrl+K** (Windows/Linux)
- **Cmd+K** (Mac)

## Comportamento
1. Usuário pressiona Ctrl+K → modal de busca abre
2. Busca em tempo real (debounce 300ms)
3. Campos pesquisados: nome, telefone, email
4. Se vazio → mostra leads recentes (5 últimos)
5. Enter seleciona → navega para o lead
6. Esc fecha

## Componente
- **Arquivo:** `src/components/layout/GlobalSearch.tsx`
- **Rota:** Integrado no layout principal (`src/app/layout.tsx`)

## API
Usa `api.getPaginatedLeads()` com filtro local.

## Integração
- Disponivel em todas as páginas
- Posição: topo direito do layout
- Design: fundo preto, bordas sutis (Blackstar)

## Estados
| Estado | Comportamento |
|---|---|
| Fechado | Botão "Buscar..." visivel |
| Aberto | Input com focus, resultados em tempo real |
| Buscando | Loading spinner |
| Resultados | Lista de leads com nome, telefone, status |
| Sem resultados | Mensagem "Nenhum resultado para X" |
