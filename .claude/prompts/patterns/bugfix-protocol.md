---
id: bugfix-protocol
loadWhen: task.type === "bugfix"
tokensEstimate: 800
verifiedAt: null
---

# Pattern: Protocolo de Bugfix — Atus Dashboard

## Regra de Ouro
Uma correção que quebra outra coisa é pior que o bug original.
NUNCA corrigir sem entender o escopo completo.

---

## Protocolo (Seguir em Ordem)

### 1. Diagnóstico
- [ ] Reproduzir o bug antes de qualquer mudança
- [ ] Identificar o módulo exato: domínio? infra? integração?
- [ ] Verificar se ocorre em produção ou só em dev
- [ ] Checar se há teste que deveria pegar esse bug

### 2. Escopo de Impacto
- [ ] Listar todos os arquivos que serão alterados
- [ ] O que pode quebrar com essa mudança?
- [ ] Outros módulos dependem do código alterado?

### 3. Correção
- [ ] Fazer a menor mudança possível que resolve o problema
- [ ] NÃO refatorar durante bugfix — PRs separados
- [ ] Comentar O QUÊ e POR QUÊ (não apenas o quê)

### 4. Validação
- [ ] Testar o cenário do bug
- [ ] Testar cenários adjacentes
- [ ] Verificar dados existentes no DB

### 5. Documentação
- [ ] `SPEC.md`: mover bug de "Ativos" para "Funcionando"
- [ ] Sub-prompt do domínio: adicionar em "Failures Conhecidos"
- [ ] `setup.config.json`: decrementar `bugs.activeBugCount`

---

## Priorização

| Prioridade | Critério |
|---|---|
| 🔴 Crítico | Bloqueia fluxo principal |
| 🟠 Alto | Dado incorreto ou perdido |
| 🟡 Médio | UX ruim, mas funciona |
| 🟢 Baixo | Cosmético, edge case raro |

---

## Armadilhas
- NUNCA fix + refactor no mesmo commit
- NUNCA assumir que o bug está onde parece — verificar o fluxo
- NUNCA corrigir sem reproduzir primeiro
