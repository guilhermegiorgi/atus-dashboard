---
id: dashboard-kpis
loadWhen: task.feature === "kpis" || task.feature === "dashboard-kpis"
tokensEstimate: 800
verifiedAt: null
---

# Feature: Dashboard de KPIs

## KPIs Principais

| KPI | Cálculo | Período Padrão |
|---|---|---|
| Total de Leads | COUNT(leads) | Mês atual |
| Taxa de Qualificação | qualificados / total | Mês atual |
| Taxa de Conversão | fechados / qualificados | Mês atual |
| Tempo Médio até Fechamento | AVG(fechado_em - criado_em) | Últimos 90 dias |
| Leads por Canal | COUNT GROUP BY canal_origem | Mês atual |
| Performance por Corretor | fechados GROUP BY corretor | Mês atual |

---

## Filtros Globais

- Período: hoje / 7d / 30d / 90d / personalizado
- Corretor: todos / específico
- Canal: todos / WhatsApp / Instagram / Site / Indicação

---

## Regras de Acesso
- **Admin/Gestor:** todos os corretores
- **Corretor:** apenas seus próprios leads e KPIs
