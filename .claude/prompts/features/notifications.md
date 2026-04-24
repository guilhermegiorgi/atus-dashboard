---
id: notifications
loadWhen: task.feature === "notifications"
tokensEstimate: 600
verifiedAt: null
---

# Feature: Notificações e Alertas

## Gatilhos

| Evento | Destinatário | Canal |
|---|---|---|
| Novo lead atribuído | Corretor | WhatsApp |
| Lead sem atividade > 24h | Corretor + Gestor | In-app |
| Lead qualificado sem corretor | Gestor | In-app + WhatsApp |
| Visita agendada | Corretor | WhatsApp |
| Proposta aberta | Gestor | In-app |

---

## Regras Anti-Spam
- Máximo 1 notificação do mesmo tipo por lead por hora
- WhatsApp apenas em horário comercial (8h-19h)
- In-app sem restrição de horário
