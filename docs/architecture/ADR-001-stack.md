# ADR-001 — Stack e arquitetura base

| Campo | Valor |
|-------|-------|
| Status | **aceito** |
| Data | 2026-06-14 |
| Ratificado | Workshop PO/operação/TI (2026-06-14) |
| Briefing | `BRF-001` (G2 após aceite) |

## Contexto

Cocal Campo exige PWA offline-first, sync automática, RBAC multi-área e evolução por briefings com rastreabilidade `BR-*`. Requisitos de negócio estão no catálogo; escolha de tecnologia ratificada após plano de arquitetura.

## Decisão

| Camada | Tecnologia | Versão |
|--------|------------|--------|
| Frontend PWA | React + TypeScript + Vite | React 18, Vite 5 |
| Store local | IndexedDB (Dexie.js) | 4.x |
| Offline / PWA | Service Worker (vite-plugin-pwa / Workbox) | — |
| Estado UI | TanStack Query + Zustand | — |
| Backend API | Go (chi router) | Go 1.22+ |
| Banco | PostgreSQL | 16 |
| Auth MVP | JWT access + refresh 7 dias (`BR-ACESSO-004`) | auth próprio, sem SSO |
| Dev local | Docker Compose (PostgreSQL + API) | — |
| CI | GitHub Actions (docs + test + build) | — |

### Sync (`BR-SYNC-*`, `BR-SYNC-005`)

Detalhe em [ADR-002-sync-outbox.md](./ADR-002-sync-outbox.md).

- Cliente: `idempotency_key` (turno + tipo + identificador)
- Servidor: first-sync-wins; conflito → HTTP 409 + `ERR-SYNC-CONFLICT`
- Estados locais: `pendente`, `sincronizado`, `erro`

### Erros de domínio

| Código | Regra |
|--------|-------|
| `ERR-TURNO-002` | `BR-TURNO-002` |
| `ERR-TURNO-003` | `BR-TURNO-003` |
| `ERR-TMP-002` | `TMP-002` |
| `ERR-TMP-001` | `TMP-001` |
| `ERR-SYNC-CONFLICT` | `BR-SYNC-005` |
| `ERR-ACESSO-001` | `BR-ACESSO-001` |

## Alternativas consideradas

| Opção | Prós | Contras |
|-------|------|---------|
| Go + React PWA (**aceita**) | Controle de sync no domínio; alinhado ao template | Duas stacks |
| Next.js | Ecossistema React | SSR irrelevante para offline-first; PWA mais complexo |
| ElectricSQL / PowerSync | Sync integrado | Política de conflito deve espelhar `BR-*` |
| Supabase / Firebase offline | Velocidade MVP | Conflito e RBAC fora do catálogo |

## Consequências

- `techContext.md` e `systemPatterns.md` preenchidos
- Scaffold `backend/` e `frontend/` conforme `project.config.json`
- CI unificado (docs + backend + frontend)

## Histórico

| Data | Evento |
|------|--------|
| 2026-06-14 | ADR criado como proposta |
| 2026-06-14 | Scaffold prematuro removido |
| 2026-06-14 | Status → **aceito**; auth MVP próprio (sem SSO) |

**Última atualização**: 2026-06-14
