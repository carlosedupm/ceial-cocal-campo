# 🚀 Active Context — Cocal Campo
> Estado vivo do projeto. Atualize a cada entrega significativa ou mudança de foco.

## 📋 Estado Atual do Projeto

### **Status Geral**

**Fase 1 em andamento — `BRF-001` fundação, `BRF-002` Colheita e `BRF-003` Transporte implementados (G3).** Hotfix sync produção aplicado (jun/2026). Próximo: deploy em Render + regressões BRF-001 pendentes.

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
11. ✅ **BRF-003 Transporte** — consumo transbordo + cargas/viagens; `INT-001` no fechamento; rota `/transporte`; validação manual G3 OK
12. ✅ **Sync hardening** — log de erros por item em `POST /sync/push`; `RegistroRepository` com `GetByID`
13. ✅ **Hotfix sync produção (2026-06-16)** — insert JSONB em `registro.go` via `string(json.Marshal(payload))` + `::jsonb` (evita bytea→22P02 e map sem OID); fila offline com `purgeOrphanRegistros`; testes de integração colheita + CI `-tags=integration`

### ✅ Stack de desenvolvimento:

| Serviço | Como subir |
|---------|------------|
| Dev Container | Cursor → Reopen in Container (Postgres) |
| API + PWA | F5 — *Cocal Campo (API + PWA)* em `.vscode/launch.json` |
| Stack em containers | `docker compose --profile stack up -d` |

### 📋 Próximos passos:

1. **Deploy hotfix** em Render (backend + frontend) e validar sync `horas_corte` + fechamento de turno em produção
2. Regressão BRF-001 pendente — caso 6 (menu RBAC no browser), caso 8 (falha API + retry), piloto mobile ([`docs/tests/regressao-fundacao-turno-sync.md`](../docs/tests/regressao-fundacao-turno-sync.md))
3. Briefing de Supervisão (Fase 3) ou próximo módulo de área (Qualidade/Segurança)

**Última atualização**: 2026-06-16