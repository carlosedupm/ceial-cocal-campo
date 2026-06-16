# Catálogo de negócio — Cocal Campo

Documentação **viva** das regras de domínio: decisões de produto que aparecem na API, nas validações e na experiência do usuário.

## Relação com outros documentos

| Documento | Papel |
|-----------|--------|
| [memory-bank/projectbrief.md](../../memory-bank/projectbrief.md) | Objetivos, fases e definição de pronto |
| [memory-bank/productContext.md](../../memory-bank/productContext.md) | Visão de mercado, jornada, métricas — **sem** repetir o detalhe operacional das regras |
| [memory-bank/systemPatterns.md](../../memory-bank/systemPatterns.md) | Padrões técnicos (pendente de definição de stack) |
| **[\_transversal.md](./_transversal.md)** | **Fluxo transversal**, lacunas, backlog e regras mestre |
| **`docs/business/*.md`** | Regras por módulo com ID estável (`BR-<DOMINIO>-NNN`) |

## Quando atualizar

Qualquer **mudança de comportamento de produto** ou **política de domínio** deve atualizar este catálogo **no mesmo ciclo** que o código:

1. Módulo afetado → ficheiro correspondente abaixo.
2. Impacto em mais de um módulo → **[_transversal.md](./_transversal.md)**.
3. Novo marco ou foco → `memory-bank/projectbrief.md`, `activeContext.md`, `progress.md`.

Ver também [AGENTS.md](../../AGENTS.md) e `.cursor/rules/documentation-maintenance.mdc`.

## Convenções

- **ID de regra**: `BR-<DOMINIO>-NNN` (ex.: `BR-TURNO-001`). Não renumerar IDs; criar novo ID para regra nova.
- **Campos por regra**: enunciado; escopo; perfis; bloqueio no servidor vs informativo na UI; ponteiros ao código; migration/constraint quando aplicável.
- **Estado**: `implementado` | `parcial` | `planejado`.
- **Regra nova nasce na análise funcional**: estado `planejado` **antes** da implementação, com briefing — ver [`docs/briefings/README.md`](../briefings/README.md).
- **Verificação automatizada**: `node scripts/validate-br-refs.mjs` (CI) garante que todo `BR-*`/`TMP-*`/`INT-*` citado em código ou briefing existe neste catálogo.

## Índice de módulos

| Módulo | Arquivo | Regras | Estado |
|--------|---------|--------|--------|
| **Transversal (mestre)** | [_transversal.md](./_transversal.md) | `BR-TRANS-001`–`005`, `TMP-001`–`002`, `INT-001`–`002` | implementado |
| **Turnos** | [turnos.md](./turnos.md) | `BR-TURNO-001`–`004` | implementado |
| **Offline e sync** | [offline-sync.md](./offline-sync.md) | `BR-SYNC-001`–`005`, `BR-SYNC-PULL-001` | implementado |
| **Integração central** | [integracao-central.md](./integracao-central.md) | `BR-INTEG-001`–`005` | implementado (MVP simulador) |
| **Acesso e perfis** | [acesso-perfis.md](./acesso-perfis.md) | `BR-ACESSO-001`–`005` | implementado |
| **Colheita** | [colheita.md](./colheita.md) | `BR-COLHEITA-001`–`003` | implementado (consulta) |
| **Qualidade** | [qualidade.md](./qualidade.md) | `BR-QUALIDADE-001`–`003` | implementado (consulta) |
| **Performance** | [performance.md](./performance.md) | `BR-PERFORMANCE-001`–`003` | parcial |
| **Supervisão** | [supervisao.md](./supervisao.md) | `BR-SUPERVISAO-001`–`002` | implementado |

---

**Última atualização**: 2026-06-16
