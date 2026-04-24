---
id: auth
loadWhen: task.involves?.includes("auth") || task.involves?.includes("roles")
tokensEstimate: 700
verifiedAt: null
---

# Infra: Autenticação e Permissões

## Roles

| Role | Descrição | Acesso |
|---|---|---|
| `admin` | Proprietário/Gestor | Tudo |
| `gestor` | Coordenador | Todos leads e corretores |
| `corretor` | Corretor individual | Apenas seus leads |

---

## Acesso por Rota

- `/dashboard` → admin, gestor
- `/pipeline` → todos (corretor vê apenas seus leads)
- `/corretores` → admin, gestor
- `/configuracoes` → admin

---

## Implementação (Preencher)

```typescript
// Preencher com o provider de auth do projeto
// (NextAuth / Clerk / custom)
// e como o role é verificado nas API routes
```

---

## Armadilhas
- NUNCA confiar no role vindo do frontend — verificar no servidor
- NUNCA expor dados de outros corretores para um corretor logado
