# Checklist — Regressão fundação turno e sync (`BRF-001`)

> Espelha seção 4 de [`BRF-001-fundacao-turno-sync.md`](../briefings/BRF-001-fundacao-turno-sync.md). Executar após cada entrega da fundação e antes do gate G3.

## Pré-requisitos

- [ ] Backend e frontend rodando (ver `memory-bank/techContext.md`)
- [ ] Usuários de teste: operador colheita, operador transporte
- [ ] Dispositivo ou emulador com opção de desligar rede

## Casos

### 1. Caminho feliz online (`BR-TRANS-004`)

- [ ] Login online com operador colheita
- [ ] Selecionar unidade e frente
- [ ] Abrir turno
- [ ] Criar registro placeholder
- [ ] Sync confirma registro (status sincronizado)
- [ ] Operador não pode editar registro após sync

### 2. Offline completo (`BR-TRANS-001`, `BR-SYNC-002`)

- [ ] Desligar rede antes do fluxo
- [ ] Abrir turno offline
- [ ] Criar registro placeholder
- [ ] Fechar turno
- [ ] UI mostra pendências na fila
- [ ] Reconectar rede
- [ ] Sync automático sem ação manual
- [ ] Pendências zeradas após sucesso

### 3. Turno duplicado (`BR-TURNO-002`)

- [ ] Com turno aberto, tentar abrir segundo turno
- [ ] Sistema bloqueia com mensagem clara (ERR-TURNO-002)

### 4. Sem turno (`BR-TURNO-001`, `TMP-002`)

- [ ] Sem turno aberto, tentar criar registro
- [ ] Sistema bloqueia (ERR-TMP-002)

### 5. Turno fechado (`BR-TURNO-003`)

- [ ] Fechar turno com registros
- [ ] Operador não pode editar registros do turno fechado

### 6. RBAC (`BR-ACESSO-001`)

- [ ] Login como operador colheita — menu sem área transporte
- [ ] Login como operador transporte — menu sem área colheita

### 7. Bordas temporais (`TMP-001`)

- [ ] Tentar registro com timestamp futuro
- [ ] Sistema rejeita (ERR-TMP-001)

### 8. Falha sync (`BR-SYNC-004`)

- [ ] Simular falha de API (servidor parado ou timeout)
- [ ] Dado local preservado na fila
- [ ] Após restaurar servidor, retry sincroniza sem perda

## Resultado

| Data | Executor | Passou | Observações |
|------|----------|--------|-------------|
| | | | |

**Última atualização**: 2026-06-14
