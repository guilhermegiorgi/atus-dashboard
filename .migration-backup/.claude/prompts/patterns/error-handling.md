---
id: error-handling
loadWhen: sempre — baseline obrigatório
tokensEstimate: 700
verifiedAt: null
---

# Pattern: Error Handling — Atus Dashboard

## Padrão Global

```typescript
// lib/errors.ts
export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public status: number = 400,
    public details?: unknown
  ) {
    super(message);
  }
}

// Em qualquer API route:
try {
  // lógica
} catch (error) {
  if (error instanceof AppError) {
    return Response.json(
      { success: false, error: { code: error.code, message: error.message } },
      { status: error.status }
    );
  }
  console.error("[API Error]", error);
  return Response.json(
    { success: false, error: { code: "INTERNAL_ERROR", message: "Erro interno" } },
    { status: 500 }
  );
}
```

---

## Erros Conhecidos do Projeto (Preencher conforme encontrar)

| Erro | Contexto | Causa | Solução Aplicada |
|---|---|---|---|
| [Descrever] | [Onde ocorre] | [Por que] | [Como foi resolvido] |

---

## Erros Prisma Comuns

```typescript
import { Prisma } from "@prisma/client";

if (error instanceof Prisma.PrismaClientKnownRequestError) {
  if (error.code === "P2002")
    throw new AppError("CONFLICT", "Registro já existe", 409);
  if (error.code === "P2025")
    throw new AppError("NOT_FOUND", "Registro não encontrado", 404);
}
```

---

## Regras de Log

- SEMPRE logar com contexto: `[Módulo] [Ação] [Dados relevantes]`
- NUNCA logar dados sensíveis (tokens, CPF, senhas)
- Erros de integração externa: sempre logar o response body

---

## Armadilhas
- NUNCA deixar `catch(e) {}` vazio
- NUNCA expor stack trace para o cliente em produção
