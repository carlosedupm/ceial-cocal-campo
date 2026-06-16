# Checklist — Regressão fundação turno e sync (`BRF-001`)

> Espelha seção 4 de [`BRF-001-fundacao-turno-sync.md`](../briefings/BRF-001-fundacao-turno-sync.md). Executar após cada entrega da fundação e antes do gate G3.

## Pré-requisitos

- [x] Backend e frontend rodando (ver `memory-bank/techContext.md`)
- [x] Usuários de teste: operador colheita, operador transporte
- [ ] Dispositivo ou emulador com opção de desligar rede

## Casos

### 1. Caminho feliz online (`BR-TRANS-004`)

- [x] Login online com operador colheita
- [x] Selecionar unidade e frente
- [x] Abrir turno
- [x] Criar registro placeholder
- [x] Sync confirma registro (status sincronizado)
- [x] Operador não pode editar registro após sync (lista somente leitura — sem UI de edição)

### 2. Offline completo (`BR-TRANS-001`, `BR-SYNC-002`)

- [x] Desligar rede **após** carregar `/contexto` online (ou usar request blocking `*/api/*`)
- [x] Abrir turno offline
- [x] Criar registro placeholder
- [x] Fechar turno
- [x] UI mostra pendências na fila
- [x] Combos em `/contexto` preenchidos via cache local (schema v3)
- [x] Reconectar rede
- [x] Sync automático sem ação manual
- [x] Pendências zeradas após sucesso

### 3. Turno duplicado (`BR-TURNO-002`)

- [x] Com turno aberto, tentar abrir segundo turno
- [x] Sistema bloqueia com mensagem clara (ERR-TURNO-002)

### 4. Sem turno (`BR-TURNO-001`, `TMP-002`)

- [x] Sem turno aberto, tentar criar registro (API: turno inexistente → ERR-TMP-002)
- [x] Sistema bloqueia (ERR-TMP-002); UI: botão inativo sem turno aberto

### 5. Turno fechado (`BR-TURNO-003`)

- [x] Fechar turno com registros
- [x] Operador não pode editar registros do turno fechado (API: ERR-TURNO-003; UI: sem botões de registro)

### 6. RBAC (`BR-ACESSO-001`)

- [x] Login como operador colheita — área `colheita` (API)
- [x] Login como operador transporte — área `transporte` (API)
- [x] Verificação visual do menu filtrado no browser (colheita vs transporte) — coberto em `frontend/e2e/fundacao.spec.ts`

### 7. Bordas temporais (`TMP-001`)

- [x] Tentar registro com timestamp futuro
- [x] Sistema rejeita (ERR-TMP-001)

### 8. Falha sync (`BR-SYNC-004`)

- [x] Retry idempotente após push bem-sucedido (API)
- [x] Simular falha de API (servidor parado ou timeout) — fila local preservada (Playwright com intercept em `sync/push`)
- [x] Após restaurar servidor, retry sincroniza sem perda (Playwright com `unroute` + reload)

## Resultado

| Data | Executor | Passou | Observações |
|------|----------|--------|-------------|
| 2026-06-15 | agente (API + unitários) | Parcial (6/8 casos API) | Casos 2, 6 (UI), 8 (falha rede) pendentes manual/browser. Playwright E2E: browsers não instalados (`npx playwright install`). |
| 2026-06-15 | usuário (browser) | Caso 2 OK | Offline completo: turno, registro, fechar, cache contexto, reconexão e sync automática. |
| 2026-06-16 | agente (automação E2E) | Cobertura adicionada | Casos 6, 8 e piloto mobile em `frontend/e2e/fundacao.spec.ts`; rodar com `npm run test:e2e` (fora do gate de PR). |

**Última atualização**: 2026-06-16
