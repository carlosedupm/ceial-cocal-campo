# 🚀 Deploy Notes — Cocal Campo

> Deploy, variáveis de ambiente, migrações e troubleshooting.

## Arquitetura de deploy

| Componente | Plataforma sugerida | URL |
|------------|---------------------|-----|
| Backend | Container (Fly.io / Render / VPS) | `backend/Dockerfile` |
| Frontend PWA | CDN estático (Cloudflare Pages / Vercel) | build `frontend/` |
| Banco | PostgreSQL gerenciado (Neon / RDS) | — |

## Build (via Docker — sem toolchain no host)

```bash
docker compose -f docker-compose.yml build api
docker compose run --rm frontend npm run build
# Artefato: frontend/dist/
```

## Variáveis de ambiente obrigatórias (produção)

| Variável | Onde | Descrição |
|----------|------|-----------|
| `DATABASE_URL` | Backend | Connection string PostgreSQL |
| `JWT_SECRET` | Backend | Segredo forte (≠ dev) |
| `CORS_ORIGIN` | Backend | URL do PWA em produção |
| `PORT` | Backend | Default `8080` |

## Desenvolvimento

Ver [`techContext.md`](techContext.md) — Dev Container + F5 (`launch.json`) ou `docker compose --profile stack up -d`.

## Gate de deploy

- CI verde (`.github/workflows/ci.yml`)
- `npm run validate` OK
- Checklist [`docs/tests/validacao-offline-campo.md`](../docs/tests/validacao-offline-campo.md) em piloto

**Última atualização**: 2026-06-15
