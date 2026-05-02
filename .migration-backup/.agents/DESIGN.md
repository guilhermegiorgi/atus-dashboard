---
version: alpha
name: DarkDesk
description: Dark theme design system for WhatsApp CRM and AI chatbot management interface.
colors:
  primary: "#0F0F0F"
  surface: "#1A1A1A"
  surface-raised: "#242424"
  surface-overlay: "#2E2E2E"
  border: "#3A3A3A"
  border-subtle: "#2A2A2A"
  secondary: "#6B6B6B"
  muted: "#4A4A4A"
  on-primary: "#F0F0F0"
  on-surface: "#D4D4D4"
  on-muted: "#9A9A9A"
  accent-green: "#1DB954"
  accent-green-muted: "#1A3A28"
  accent-pink: "#E91E8C"
  accent-pink-muted: "#3A1228"
  accent-purple: "#8B5CF6"
  accent-purple-muted: "#2A1A4A"
  accent-orange: "#F97316"
  accent-orange-muted: "#3A2010"
  accent-blue: "#3B82F6"
  accent-blue-muted: "#0F1E3A"
  badge-new: "#1DB954"
  badge-waiting: "#F97316"
  badge-urgent: "#EF4444"
  badge-indicated: "#8B5CF6"
  conversation-active: "#1E2A1E"
  conversation-hover: "#1E1E1E"
  scrollbar: "#3A3A3A"
  selection: "#1E3A2E"

typography:
  h1:
    fontFamily: Inter
    fontSize: 1.5rem
    fontWeight: 600
    lineHeight: 1.3
  h2:
    fontFamily: Inter
    fontSize: 1.125rem
    fontWeight: 600
    lineHeight: 1.35
  h3:
    fontFamily: Inter
    fontSize: 0.9375rem
    fontWeight: 500
    lineHeight: 1.4
  body-md:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: Inter
    fontSize: 0.8125rem
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: 500
    lineHeight: 1.3
  label-caps:
    fontFamily: Inter
    fontSize: 0.6875rem
    fontWeight: 600
    letterSpacing: 0.06em
  timestamp:
    fontFamily: Inter
    fontSize: 0.6875rem
    fontWeight: 400
    lineHeight: 1.2
  code:
    fontFamily: JetBrains Mono
    fontSize: 0.8125rem
    fontWeight: 400

rounded:
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  full: 9999px

spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  xxl: 32px

components:
  sidebar:
    backgroundColor: "{colors.primary}"
    borderRight: "1px solid {colors.border-subtle}"
    width: 64px

  sidebar-item:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.md}"
    padding: 12px

  sidebar-item-active:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.on-primary}"

  sidebar-item-hover:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"

  conversation-list:
    backgroundColor: "{colors.surface}"
    borderRight: "1px solid {colors.border-subtle}"
    width: 320px

  conversation-item:
    backgroundColor: "transparent"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.sm}"
    padding: 12px

  conversation-item-active:
    backgroundColor: "{colors.conversation-active}"
    textColor: "{colors.on-primary}"

  conversation-item-hover:
    backgroundColor: "{colors.conversation-hover}"

  conversation-item-unread:
    backgroundColor: "{colors.surface-overlay}"

  chat-area:
    backgroundColor: "{colors.primary}"

  chat-header:
    backgroundColor: "{colors.surface}"
    borderBottom: "1px solid {colors.border-subtle}"
    padding: 16px
    textColor: "{colors.on-primary}"

  chat-bubble-inbound:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: 12px

  chat-bubble-outbound:
    backgroundColor: "{colors.accent-green-muted}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: 12px

  chat-input-area:
    backgroundColor: "{colors.surface}"
    borderTop: "1px solid {colors.border-subtle}"
    padding: 12px

  chat-input:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
    padding: 12px

  button-primary:
    backgroundColor: "{colors.accent-green}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: 10px 16px

  button-primary-hover:
    backgroundColor: "#17a348"

  button-secondary:
    backgroundColor: "{colors.surface-overlay}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: 8px 14px

  button-secondary-hover:
    backgroundColor: "{colors.border}"

  button-ai-summarize:
    backgroundColor: "{colors.accent-pink-muted}"
    textColor: "{colors.accent-pink}"
    rounded: "{rounded.full}"
    padding: 6px 14px

  button-ai-followup:
    backgroundColor: "{colors.accent-purple-muted}"
    textColor: "{colors.accent-purple}"
    rounded: "{rounded.full}"
    padding: 6px 14px

  badge:
    rounded: "{rounded.xs}"
    padding: 2px 6px

  badge-new:
    backgroundColor: "{colors.accent-green}"
    textColor: "#FFFFFF"

  badge-waiting:
    backgroundColor: "{colors.accent-orange-muted}"
    textColor: "{colors.accent-orange}"

  badge-urgent:
    backgroundColor: "#3A1010"
    textColor: "#EF4444"

  badge-indicated:
    backgroundColor: "{colors.accent-purple-muted}"
    textColor: "{colors.accent-purple}"

  badge-channel:
    backgroundColor: "{colors.surface-overlay}"
    textColor: "{colors.on-muted}"

  badge-bot:
    backgroundColor: "#1A2A3A"
    textColor: "{colors.accent-blue}"

  badge-human:
    backgroundColor: "#3A1A1A"
    textColor: "#F87171"

  search-bar:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: 8px 12px

  tag-label:
    backgroundColor: "{colors.surface-overlay}"
    textColor: "{colors.on-muted}"
    rounded: "{rounded.xs}"
    padding: 2px 6px

  avatar:
    backgroundColor: "{colors.surface-overlay}"
    textColor: "{colors.on-muted}"
    rounded: "{rounded.full}"
    size: 36px

  avatar-unread:
    backgroundColor: "{colors.accent-green}"
    textColor: "#FFFFFF"

  unread-counter:
    backgroundColor: "{colors.accent-green}"
    textColor: "#FFFFFF"
    rounded: "{rounded.full}"
    size: 20px

  timestamp:
    textColor: "{colors.on-muted}"

  divider:
    backgroundColor: "{colors.border-subtle}"
    height: 1px

  scrollbar-track:
    backgroundColor: "transparent"

  scrollbar-thumb:
    backgroundColor: "{colors.scrollbar}"
    rounded: "{rounded.full}"
---

## Overview

**DarkDesk** — Interface de gestão de conversas WhatsApp e bots de IA com estética profissional escura.

O sistema prioriza legibilidade em sessões longas de trabalho, hierarquia visual clara entre painéis e estados de conversa, e diferenciação semântica de badges/status por cor. O fundo quase-preto (`#0F0F0F`) cria profundidade, com superfícies em cinza escuro criando camadas de elevação naturais.

**Princípio central:** cada nível de elevação ganha ~10 pontos de luminância — primary → surface → surface-raised → surface-overlay — mantendo coerência sem precisar de sombras pesadas.

## Colors

A paleta é baseada em uma escala de neutros escuros com acentos semânticos específicos por função:

- **Primary (`#0F0F0F`):** Fundo base da aplicação. Quase preto, sem ser absoluto — evita halos em telas OLED.
- **Surface (`#1A1A1A`):** Sidebar de conversas, header do chat. Primeiro nível de elevação.
- **Surface Raised (`#242424`):** Cards, inputs, balões de chat recebidos. Segundo nível.
- **Surface Overlay (`#2E2E2E`):** Hover states, elementos flutuantes, badges neutros.
- **Border / Border Subtle:** Separadores entre painéis e seções, usando tons próximos à superfície para não poluir visualmente.
- **On-Primary (`#F0F0F0`) / On-Surface (`#D4D4D4`) / On-Muted (`#9A9A9A`):** Hierarquia de texto — título, corpo, metadados.

**Acentos funcionais:**
- Verde (`#1DB954`): Ações primárias, botão "Nova conversa", badges "Nova", balão outbound. Canal WhatsApp.
- Laranja (`#F97316`): Estado "Aguardando", alertas de tempo.
- Vermelho (`#EF4444`): Urgência, alertas críticos, badge "Atendimento humano".
- Roxo (`#8B5CF6`): IA, automação, follow-up sugerido.
- Rosa (`#E91E8C`): Resumo de IA, ações de síntese.
- Azul (`#3B82F6`): Canal Chatbot/Bot, integrações.

## Typography

Inter em todo o sistema, com JetBrains Mono para snippets de código e IDs técnicos.

Hierarquia de peso e tamanho define escaneabilidade rápida na lista de conversas:
- Nome do contato: `h3` (500, 0.9375rem)
- Preview de mensagem: `body-sm` (400, 0.8125rem, cor muted)
- Timestamp e contadores: `timestamp` (400, 0.6875rem)
- Labels de badges: `label-caps` (600, 0.6875rem, uppercase)

## Layout

Três colunas fixas: sidebar de ícones (64px) + lista de conversas (320px) + área de chat (flex 1).

O painel de detalhes/informações do contato pode ser adicionado à direita como quarta coluna opcional, ou como sheet lateral sobreposta.

Spacing segue escala de 4px — todos os paddings e gaps são múltiplos de 4.

## Elevation & Depth

Profundidade via luminância de superfície, sem box-shadow pesada:

| Layer | Color | Uso |
|---|---|---|
| 0 — Base | `#0F0F0F` | Fundo geral, área de chat |
| 1 — Surface | `#1A1A1A` | Sidebar de conversas, header |
| 2 — Raised | `#242424` | Inputs, balões, cards |
| 3 — Overlay | `#2E2E2E` | Dropdowns, tooltips, hover |

Bordas sutis (`#2A2A2A`) separam painéis sem criar ruído visual.

## Shapes

- Avatares: `border-radius: 9999px` (círculo perfeito)
- Badges de status: `border-radius: 4px` (quadrado com leve arredondamento)
- Balões de chat: `border-radius: 12px`
- Inputs e botões: `border-radius: 6-8px`
- Botões de IA pill: `border-radius: 9999px`

## Components

### Conversation Item
Estado padrão: fundo transparente, texto `on-surface`. Estado ativo (conversa aberta): fundo `conversation-active` com leve tint verde. Hover: `conversation-hover`.

Badges de status (Nova, Aguardando, Urgente, Indicado) ficam abaixo do preview de mensagem como pills pequenas com cor semântica.

### AI Action Buttons
"Resumir com IA" e "Sugerir follow-up com IA" são pills com ícone + texto. Cores invertidas (texto vibrante sobre fundo muted da cor correspondente) para chamar atenção sem competir com ações primárias.

### Unread Counter
Badge circular verde `#1DB954` com número branco, sobreposto ao avatar. Tamanho 20px.

### Badges de Canal
- WhatsApp Oficial: verde sutil `surface-overlay` + ícone
- Chatbot: fundo azul muted + texto azul
- Atendimento Humano: fundo vermelho muted + texto vermelho
- AG Abertura: fundo `surface-overlay` + texto muted

## Do's and Don'ts

**Do:**
- Use acentos vibrantes apenas para estados semânticos específicos (status, ações de IA, urgência)
- Mantenha texto de preview e metadados em `on-muted` (`#9A9A9A`) — não tente aumentar contraste desnecessariamente
- Use `border-radius: full` apenas para avatares e pills de IA
- Aplique `accent-green` exclusivamente para ações de sucesso/confirmação e canal WhatsApp

**Don't:**
- Não use fundos puros `#000000` — causa halos visuais em OLED e perda de profundidade
- Não misture múltiplos acentos vibrantes no mesmo componente
- Não aplique sombras pesadas — a hierarquia vem da luminância, não de shadows
- Não use texto `#FFFFFF` puro — prefira `#F0F0F0` para evitar fadiga visual em sessões longas
- Não use `border-radius > 12px` em componentes de lista — passa sensação de app consumer, não dashboard profissional
