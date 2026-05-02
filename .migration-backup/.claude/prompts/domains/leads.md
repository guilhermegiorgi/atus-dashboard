---
id: leads
loadWhen: task.domain === "leads" || task.domain === "pipeline"
tokensEstimate: 1200
verifiedAt: null
---

# Domínio: Leads — Atus Imobiliária

## O que este arquivo garante
- Claude conhecerá todos os estados possíveis de um lead
- Claude saberá as regras de transição entre estados
- Claude saberá quais campos são obrigatórios vs. opcionais
- Claude não vai propor mudança de campo sem considerar ghost values

---

## Estados do Lead (Máquina de Estados)

```
novo → qualificando → qualificado → visitando → proposta → fechado
                                                          ↘ perdido
```

| Estado | Descrição | Campos Obrigatórios |
|---|---|---|
| `novo` | Lead acabou de entrar | nome, telefone, canal_origem |
| `qualificando` | Coletando informações | + tipo_imovel, orcamento |
| `qualificado` | Perfil completo | + renda, fgts, objetivo |
| `visitando` | Agendou/realizou visita | + imovel_interesse, data_visita |
| `proposta` | Em negociação | + valor_proposta |
| `fechado` | Venda/locação concluída | + data_fechamento, valor_final |
| `perdido` | Não converteu | + motivo_perda |

---

## Schema do Lead (Preencher com o real)

```prisma
model Lead {
  id              String    @id @default(cuid())
  nome            String
  telefone        String    @unique
  email           String?
  estado          LeadState @default(novo)
  canal_origem    String

  corretor_id     String?

  // Qualificação financeira
  orcamento       Float?
  renda           Float?
  renda_comprovada Boolean?
  fgts            Float?
  fgts_conjuge    Float?    // ATENÇÃO: limpar quando fgts muda
  renda_conjuge   Float?    // ATENÇÃO: limpar quando renda muda

  // Interesse
  tipo_imovel     String?
  objetivo        String?   // compra | locacao
  bairros         String[]

  // Controle
  criado_em       DateTime  @default(now())
  atualizado_em   DateTime  @updatedAt
  perdido_em      DateTime?
  motivo_perda    String?

  corretor        Corretor? @relation(fields: [corretor_id], references: [id])
}
```

---

## Regras de Negócio Críticas

- Lead só avança de estado — nunca retrocede automaticamente
- Retrocesso exige ação manual do corretor/gestor
- Ao mover para `perdido`, `perdido_em` é preenchido automaticamente
- Ao atualizar `fgts` → sempre zerar `fgts_conjuge` se não informado
- Ao atualizar `renda` → sempre zerar `renda_conjuge` se não informado

---

## Endpoints da API MCP

Base: `chatbot.atusbr.com.br/mcp/leads`

| Ação | Método | Endpoint |
|---|---|---|
| Listar leads | GET | `/leads` |
| Buscar lead | GET | `/leads/:id` |
| Atualizar lead | PATCH | `/leads/:id` |
| Mover estado | POST | `/leads/:id/transition` |

---

## Failures Conhecidos

| Sintoma | Causa | Prevenção |
|---|---|---|
| Ghost values em campos de cônjuge | Update parcial sem limpar relacionados | Usar `updateLeadWithCleanup()` sempre |
| Lead duplicado por telefone | Número com formatação diferente | Normalizar telefone antes de criar |
| Estado avançou sem campos obrigatórios | Transição sem validação | Validar schema por estado antes de transicionar |

---

## Armadilhas
- NUNCA fazer `lead.update({ fgts: valor })` diretamente
- NUNCA confiar no telefone sem normalização
- NUNCA exibir leads `perdidos` no pipeline principal sem filtro explícito
