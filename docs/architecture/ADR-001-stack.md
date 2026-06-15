# ADR-001 — Stack e arquitetura base

| Campo | Valor |
|-------|-------|
| Status | **proposta** |
| Data | 2026-06-14 |
| Briefing | `BRF-001` (após aceite deste ADR → G2) |

> **Não vinculante.** Proposta para discussão com PO, operação e TI. **Não implementar** código até `Status: aceito` e atualização de `techContext.md` / `systemPatterns.md`.

## Contexto

Cocal Campo exige PWA offline-first, sync automática, RBAC multi-área e evolução por briefings com rastreabilidade `BR-*`. Requisitos de negócio estão no catálogo; escolha de tecnologia depende de decisão humana (`AGENTS.md`).

## Proposta (a ratificar)

| Camada | Tecnologia sugerida | Versão |
|--------|---------------------|--------|
| Frontend PWA | React + TypeScript + Vite | React 18, Vite 5 |
| Store local | IndexedDB | — |
| Offline / PWA | Service Worker (ex.: Vite PWA) | — |
| Backend API | Go | Go 1.22+ |
| Banco | PostgreSQL | 16 |
| Auth | JWT + sessão offline 7 dias (`BR-ACESSO-004`) | — |
| Dev local | Docker Compose (PostgreSQL) | — |
| CI | GitHub Actions (docs + test + build) | — |

### Sync proposta (`BR-SYNC-*`, `BR-SYNC-005`)

- Cliente: `idempotency_key` (turno + tipo + identificador)
- Servidor: first-sync-wins; conflito → HTTP 409 + `ERR-SYNC-CONFLICT`
- Estados locais: `pendente`, `sincronizado`, `erro`

### Erros de domínio propostos

| Código | Regra |
|--------|-------|
| `ERR-TURNO-002` | `BR-TURNO-002` |
| `ERR-TURNO-003` | `BR-TURNO-003` |
| `ERR-TMP-002` | `TMP-002` |
| `ERR-TMP-001` | `TMP-001` |
| `ERR-SYNC-CONFLICT` | `BR-SYNC-005` |
| `ERR-ACESSO-001` | `BR-ACESSO-001` |

## Alternativas a considerar

| Opção | Prós | Contras |
|-------|------|---------|
| Go + React PWA (esta proposta) | Alinhado ao template; controle de sync no domínio | Duas stacks |
| ElectricSQL / PowerSync | Sync integrado | Complexidade; política de conflito deve espelhar `BR-*` |
| Supabase / Firebase offline | Velocidade MVP | Conflito e RBAC podem ficar fora do catálogo |

## Consequências (após aceite)

- Preencher `techContext.md` e `systemPatterns.md`
- Scaffold `backend/` e `frontend/` conforme `project.config.json`
- CI unificado (docs + backend + frontend)

## Histórico

| Data | Evento |
|------|--------|
| 2026-06-14 | ADR criado como proposta |
| 2026-06-14 | Scaffold de código removido — arquitetura não ratificada |

**Última atualização**: 2026-06-14
