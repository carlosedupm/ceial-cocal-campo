# ⚙️ Tech Context — Cocal Campo

> Stack ratificada em ADR-001. **Ambiente via Dev Container + Docker Compose** — sem dependências no host.

## Status

| Camada | Tecnologia | Versão |
|--------|------------|--------|
| Frontend PWA | React + TypeScript + Vite | React 18, Vite 5 |
| Store local | IndexedDB (Dexie.js) | 4.x |
| PWA / SW | vite-plugin-pwa (Workbox) | — |
| Backend / API | Go (chi) | 1.22+ |
| Banco de dados | PostgreSQL | 16 |
| Sync offline | Outbox + idempotency (ADR-002) | — |
| Auth | JWT access (30 min) + refresh (7 dias) | `BR-ACESSO-004` |
| Dev | Dev Container + Docker Compose | `.devcontainer/` |
| CI | GitHub Actions | docs + Go + frontend |

## Desenvolvimento local (containerizado)

```bash
# Opção A — Dev Container (recomendado)
# Cursor → Reopen in Container (sobe Postgres)
# Run and Debug → "Cocal Campo (API + PWA)" → F5

# Opção B — Docker Compose no host (stack completa em containers)
docker compose --profile stack up -d

# Validação docs (Node no Dev Container ou host com Node)
npm run validate

# Testes (containers)
npm run test

# Lockfiles (primeira vez ou após mudar deps)
bash scripts/bootstrap-lockfiles.sh
```

### Serviços Docker Compose

| Serviço | Porta | Imagem / build |
|---------|-------|----------------|
| `postgres` | 5432 | postgres:16-alpine |
| `api` | 8080 | `backend/Dockerfile.dev` |
| `frontend` | 5173 | `frontend/Dockerfile.dev` |
| `devcontainer` | — | `.devcontainer/Dockerfile` |

### Variáveis de ambiente (serviço `api`)

| Variável | Valor dev | Descrição |
|----------|-----------|-----------|
| `DATABASE_URL` | `postgres://cocal:cocal@postgres:5432/cocal_campo?sslmode=disable` | PostgreSQL |
| `JWT_SECRET` | `dev-secret-change-in-prod` | Assinatura JWT |
| `CORS_ORIGIN` | `http://localhost:5173` | Origem PWA |

### Credenciais de teste

| E-mail | Senha | Perfil |
|--------|-------|--------|
| `colheita@cocal.dev` | `campo123` | Operador colheita |
| `transporte@cocal.dev` | `campo123` | Operador transporte |
| `supervisor@cocal.dev` | `campo123` | Supervisor |

**Última atualização**: 2026-06-15
