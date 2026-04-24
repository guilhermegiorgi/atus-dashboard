---
id: chatbot
loadWhen: task.domain === "chatbot" || task.domain === "qualificacao"
tokensEstimate: 1000
verifiedAt: null
---

# Domínio: Chatbot de Qualificação — Atus Imobiliária

## Fluxo de Qualificação

```
Entrada (WhatsApp/Instagram)
  → Saudação + coleta de nome
  → Objetivo? (compra / locação)
  → Tipo de imóvel?
  → Bairros de interesse
  → Orçamento total
  → Tem FGTS? → Valor do FGTS
  → Renda mensal comprovada?
  → Cônjuge? → Renda + FGTS do cônjuge
  → Handoff para corretor
```

---

## Regras de Correção de Campo

Ver `patterns/lead-corrections.md` para o protocolo completo.

Resumo:
1. Identificar TODOS os campos implícitos na correção
2. Atualizar campo novo E limpar campos relacionados
3. Confirmar: "Perfeito, corrigi [CAMPO] para [VALOR]. Continuando..."
4. NUNCA reiniciar o fluxo — continuar do ponto atual

---

## Handoff para Corretor

Gatilhos automáticos:
- Lead diz "quero falar com corretor", "humano", "atendente"
- Lead completou todos os campos obrigatórios
- Inatividade > 30 minutos

Ação:
1. `estado = qualificado`
2. Atribuir corretor (tracking link → round-robin)
3. Notificar corretor via WhatsApp
4. Avisar lead: "Conectando com nosso corretor [NOME]..."

---

## Failures Conhecidos

| Sintoma | Causa | Prevenção |
|---|---|---|
| Bot reinicia fluxo ao corrigir campo | Correção tratada como nova sessão | Checar se é correção antes de resetar |
| Handoff sem corretor disponível | Todos inativos | Fallback + notificação ao gestor |
| FGTS de cônjuge permanece após "sozinho" | Ghost value | Zerar campos de cônjuge ao confirmar estado civil |
