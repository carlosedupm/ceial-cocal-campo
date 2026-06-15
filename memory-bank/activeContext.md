# 🚀 Active Context — Cocal Campo

> Estado vivo do projeto. Atualize a cada entrega significativa ou mudança de foco.

## 📋 Estado Atual do Projeto

### **Status Geral**

**Fase 1 em andamento — `BRF-002` Colheita implementado (G3).** Próximo: briefing de Transporte ou regressões BRF-001 pendentes.

### ✅ Concluído:

1. ✅ ADR-001 e ADR-002 aceitos
2. ✅ Scaffold `backend/` + `frontend/` + Docker Compose + Dev Container
3. ✅ Fundação: auth JWT, turno, sync Outbox, RBAC básico
4. ✅ Testes unitários (Go + Vitest) via containers
5. ✅ `BR-*` da fundação → `implementado` com ponteiros ao código
6. ✅ Fix tela em branco na HomePage — índice Dexie `created_at` em `registros` (schema v2)
7. ✅ Guia de fluxo do usuário — [`docs/ops/fluxo-usuario-brf-001.md`](../docs/ops/fluxo-usuario-brf-001.md)
8. ✅ Cache local de unidades/frentes no IndexedDB (schema v3) — contexto operacional offline após fechar turno
9. ✅ Validação offline browser (caso 2 regressão BRF-001) — sync automática após reconexão
10. ✅ **BRF-002 Colheita** — formulários horas de corte, consumo/densidade, entrada de cana; `INT-001` no fechamento

### ✅ Stack de desenvolvimento:

| Serviço | Como subir |
|---------|------------|
| Dev Container | Cursor → Reopen in Container (Postgres) |
| API + PWA | F5 — *Cocal Campo (API + PWA)* em `.vscode/launch.json` |
| Stack em containers | `docker compose --profile stack up -d` |

### 📋 Próximos passos:

1. Regressão pendente: RBAC visual (caso 6), falha sync API (caso 8), piloto mobile
2. Briefing `BRF-003` Transporte (ou consolidar supervisor em `BR-COLHEITA-003`)

**Última atualização**: 2026-06-15
