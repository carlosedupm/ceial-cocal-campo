# Briefing BRF-003 — Transporte: indicadores do turno
> Fluxo, papéis e gates: [`docs/briefings/README.md`](./README.md). Segundo módulo de área após a fundação `BRF-001` e colheita `BRF-002`.

## Metadados

| Campo | Valor |
|-------|-------|
| ID | `BRF-003` |
| Data | 2026-06-15 |
| Analista | Hermes (analista funcional) |
| Status | implementado |
| Aprovado por (G1) | Carlos Manarin (PO) — 2026-06-15 |
| PR vinculado (G2) | BRF-003 Transporte |

## 1. Objetivo

Permitir que o **operador de transporte** registre no turno aberto os indicadores operacionais da frente — **consumo transbordo** (L/t) e **cargas/viagens** — com operação **offline-first**, sync automática e validações de domínio. Ativar a lista de registros obrigatórios por área no fechamento do turno (`INT-001`) para a área transporte.

## 2. Regras de negócio (fonte de verdade)

| ID | Módulo | Estado atual | O que muda |
|----|--------|--------------|------------|
| `BR-TRANSPORTE-001` | [transporte.md](../business/transporte.md) | planejado | formulário consumo transbordo (L/t) |
| `BR-TRANSPORTE-002` | [transporte.md](../business/transporte.md) | planejado | formulário cargas/viagens do turno |
| `BR-TRANS-001` | [_transversal.md](../business/_transversal.md) | implementado | registros transporte offline |
| `BR-TRANS-003` | [_transversal.md](../business/_transversal.md) | implementado | vínculo turno/frente/unidade |
| `BR-TRANS-004` | [_transversal.md](../business/_transversal.md) | implementado | imutabilidade pós-sync |
| `BR-ACESSO-001` | [acesso-perfis.md](../business/acesso-perfis.md) | implementado | rotas transporte só para área transporte |
| `BR-SYNC-001`–`005` | [offline-sync.md](../business/offline-sync.md) | implementado | fila e sync dos novos tipos |

**Invariantes aplicáveis:**

- `TMP-001`: valores e `evento_at` não futuros; consumo não negativo
- `TMP-002`: registro exige turno aberto do usuário
- `INT-001`: **consumo transbordo (`consumo_transbordo`) obrigatório** para fechar turno na área transporte; **cargas/viagens (`cargas_viagens`) opcional** neste MVP

**Perfis autorizados:**

- `operador_transporte` / área `transporte`: todos os formulários deste briefing
- Supervisor: **fora deste briefing** — ver briefing de supervisão (Fase 3)

## 3. Escopo da implementação

### Backend

- **Endpoints**: validação nos tipos `consumo_transbordo`, `cargas_viagens` em `POST /api/v1/sync/push`; bloqueio `INT-001` em `POST /api/v1/turnos/{id}/fechar`
- **Camadas tocadas**: `internal/service/transporte.go` (novo), `services.go` (integração validação + INT-001), `repository/registro.go` (sem mudanças — payload JSON genérico)
- **Migration/constraint**: nenhuma — payload JSON no modelo genérico `registros`
- **Códigos de erro**: `ERR-TRANSPORTE-001` (payload inválido / faixa física), `ERR-INT-001` (fechamento sem obrigatório), `ERR-ACESSO-001` (perfil errado)

### Frontend

- **Páginas/rotas**: `/transporte` — formulários dos 2 indicadores; link na home do operador transporte
- **Componentes**: `TransportePage` (novo), `validation.ts` compartilhado (novo); remoção do placeholder para área transporte
- **Roteamento**: adicionar rota `/transporte` em `App.tsx`
- **Menu**: atualizar `AREA_MENUS.transporte` em `HomePage.tsx` para link `/transporte`

### O que NÃO mexer

- Colheita, Qualidade, Segurança, Performance (agregação)
- Cadastro de metas (`BR-PERFORMANCE-003`) e comparação executado vs planejado (`BR-PERFORMANCE-002`, `BR-TRANS-005`)
- Painel supervisor (`BR-SUPERVISAO-*`)
- Gestão à Vista
- Validação de ocorrência de segurança (`BR-SEGURANCA-004`)

## 4. Casos de teste exigidos

- [x] **Caminho feliz online**: operador transporte registra consumo transbordo → sync → imutável (`BR-TRANS-004`)
- [x] **Offline**: registros na fila → reconexão → sync automático (`BR-TRANS-001`, `BR-SYNC-002`)
- [x] **Sem turno / turno fechado**: bloqueio ao registrar (`TMP-002`, `BR-TURNO-003`)
- [x] **Valor inválido**: consumo transbordo fora da faixa MVP rejeitado (`BR-TRANSPORTE-001`, `ERR-TRANSPORTE-001`)
- [x] **Timestamp futuro**: rejeitado (`TMP-001`)
- [x] **RBAC**: perfil colheita não acessa `/transporte` (`BR-ACESSO-001`)
- [x] **INT-001**: fechar turno transporte sem `consumo_transbordo` bloqueado (`ERR-INT-001`)
- [x] **INT-001 feliz**: com `consumo_transbordo` registrado, fechamento permitido
- [x] **Cargas/viagens**: múltiplos registros por turno (idempotência por `viagem_numero`) aceitos; opcional no fechamento

## 5. Perguntas em aberto (obrigatório)

| # | Pergunta | Resposta (desenvolvedor) |
|---|----------|--------------------------|
| 1 | Quais indicadores são obrigatórios no fechamento (`INT-001`) na área transporte? | **`consumo_transbordo` obrigatório**; `cargas_viagens` opcional no MVP |
| 2 | Granularidade de `BR-TRANSPORTE-002`: por turno ou por viagem? | **Por viagem** — um registro por viagem com `viagem_numero`, `toneladas`, `frente_origem`, `frente_destino` (opcional) |
| 3 | Faixas físicas configuráveis pela unidade no MVP? | **Validação fixa no código** — consumo transbordo 1–30 L/t; toneladas por viagem >0 e ≤5000; configurável por unidade em briefing futuro |
| 4 | BRF-003 inclui metas e comparação (`BR-PERFORMANCE-002/003`, `BR-TRANS-005`)? | **Não** — apenas captura de executado; comparação em briefing posterior |
| 5 | Supervisor registra/valida transporte neste briefing? | **Não** — apenas operador transporte; supervisor na Fase 3 |

## 6. Critérios de aceite (gate G3)

- [x] Testes da stack passam (comandos em `techContext.md`)
- [x] `node scripts/validate-br-refs.mjs` OK
- [x] Casos de teste da seção 4 existem e passam
- [x] Comportamento validado manualmente
- [x] `BR-TRANSPORTE-001`–`002` → `implementado` com ponteiros ao código
- [x] `memory-bank/activeContext.md` atualizado
- [x] Status deste briefing → `implementado`

## 7. Notas adicionais

### Tipos de registro e payloads

| Tipo (`tipo`) | Payload JSON | Idempotência |
|---------------|--------------|--------------|
| `consumo_transbordo` | `{ consumo_lt: number }` | `turnoId:consumo_transbordo:unico` (1 por turno) |
| `cargas_viagens` | `{ viagem_numero: number, toneladas: number, frente_origem?: string, frente_destino?: string }` | `turnoId:cargas_viagens:{viagem_numero}` (1 por viagem) |

### Validações MVP (fixas no código)

- **Consumo transbordo**: 1.0–30.0 L/t (faixa ampla para cobrir transbordo cana/veículo)
- **Cargas/viagens**: `toneladas` > 0 e ≤ 5000; `viagem_numero` inteiro ≥ 1

### Integração com sync existente

- `SyncService.Push` já aceita qualquer `tipo` — adicionar chamada a `ValidateTransporteRegistro` após validação de turno aberto
- `enqueueRegistroTurno` no frontend usa `idempotencyKeyTurno` para `consumo_transbordo` (único por turno) e chave composta para `cargas_viagens`
- Estados locais: `pendente` → `sincronizado` | `erro` (conforme ADR-002)

### Frontend — padrão `ColheitaPage`

- `TransportePage.tsx` espelha estrutura: 2 forms (consumo + cargas/viagens), status sync por indicador, bloqueio pós-sync (`BR-TRANS-004`), validação local + envio via `enqueueRegistroTurno`
- Novo arquivo `frontend/src/lib/transporte/validation.ts` com constantes, validadores e `OBRIGATORIOS_TRANSPORTE = [consumoTransbordo]`

### Backend — padrão `colheita.go`

- Novo arquivo `backend/internal/service/transporte.go` com:
  - Constantes de tipos, área `transporte`, faixas MVP
  - `ValidateTransporteRegistro(user, tipo, payload)` — dispatcher + validadores por tipo + RBAC área
  - `ObrigatoriosTransporteFechamento = [TipoConsumoTransbordo]` para `INT-001`
- Em `services.go` (SyncService.Push): adicionar `ValidateTransporteRegistro` após validação de colheita
- Em `TurnoService.validateObrigatoriosFechamento`: adicionar caso `AreaTransporte` verificando `ObrigatoriosTransporteFechamento`