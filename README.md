# Atus Dashboard

Dashboard de leads da Atus, construído com Next.js 14, React 18 e Tailwind CSS.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run test
```

## Stack

- Next.js 14
- React 18
- Tailwind CSS
- shadcn/ui
- Vitest

## Ambiente

Os valores de produção usados pelo app ficam em `.env.production`.

Variáveis principais:

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_API_KEY`
- `ATUS_BOT_BASE_URL`
- `ATUS_BOT_API_KEY`

## Deploy

Fluxo atual:

1. publicar mudanças em `origin/main`
2. rebuildar a imagem Docker
3. atualizar o serviço `sistemas_atus-dashboard` no EasyPanel

Arquivos úteis:

- [DEPLOY.md](DEPLOY.md)
- [EASYPANEL.md](EASYPANEL.md)
- [.github/workflows/docker.yml](.github/workflows/docker.yml)

## Contexto de Projeto

Contexto de trabalho e prompts do projeto ficam em:

- [.claude](.claude)
- [.agents/skills](.agents/skills)
- [docs/design.md](docs/design.md)
