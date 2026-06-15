# 🚀 Deploy Notes — Cocal Campo

> Deploy, variáveis de ambiente, migrações e troubleshooting.

## Arquitetura de deploy

| Componente | Plataforma | URL |
|------------|------------|-----|
| Backend | [ex.: Render] | [URL] |
| Frontend | [ex.: Vercel] | [URL] |
| Banco | [ex.: PostgreSQL gerenciado] | — |

## Variáveis de ambiente obrigatórias

| Variável | Onde | Descrição |
|----------|------|-----------|
| `DATABASE_URL` | Backend | Connection string PostgreSQL |
| [Outras] | | |

## Comandos úteis

```bash
# Migrações (adapte)
# migrate -path backend/migrations -database "$DATABASE_URL" up
```

## Gate de deploy

- CI verde (inclui `node scripts/validate-br-refs.mjs`)
- [Outros gates do projeto]

## Troubleshooting

### Migração dirty

[Procedimento de recovery]

### Rollback

[Procedimento — ver `docs/ops/README.md`]

**Última atualização**: 2026-06-14
