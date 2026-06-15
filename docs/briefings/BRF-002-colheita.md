# Briefing BRF-002 — Colheita: indicadores do turno

> Fluxo, papéis e gates: [`docs/briefings/README.md`](./README.md). Primeiro módulo de área após a fundação `BRF-001`.

## Metadados

| Campo | Valor |
|-------|-------|
| ID | `BRF-002` |
| Data | 2026-06-15 |
| Analista | agente documentação |
| Status | implementado |
| Aprovado por (G1) | Decisões MVP documentadas na seção 5 (2026-06-15) |
| PR vinculado (G2) | BRF-002 Colheita |

## 1. Objetivo

Permitir que o **operador de colheita** registre no turno aberto os indicadores operacionais da frente — **horas de corte**, **consumo colhedora + densidade** e **entrada de cana** — com operação **offline-first**, sync automática e validações de domínio. Ativar a primeira lista de registros obrigatórios por área no fechamento do turno (`INT-001`).

## 2. Regras de negócio (fonte de verdade)

| ID | Módulo | Estado atual | O que muda |
|----|--------|--------------|------------|
| `BR-COLHEITA-001` | [colheita.md](../business/colheita.md) | planejado | formulário horas de corte |
| `BR-COLHEITA-002` | [colheita.md](../business/colheita.md) | planejado | formulário consumo + densidade (por turno) |
| `BR-COLHEITA-003` | [colheita.md](../business/colheita.md) | planejado | formulário entrada de cana (operador) |
| `BR-TRANS-001` | [_transversal.md](../business/_transversal.md) | implementado | registros colheita offline |
| `BR-TRANS-003` | [_transversal.md](../business/_transversal.md) | implementado | vínculo turno/frente |
| `BR-TRANS-004` | [_transversal.md](../business/_transversal.md) | implementado | imutabilidade pós-sync |
| `BR-ACESSO-001` | [acesso-perfis.md](../business/acesso-perfis.md) | implementado | rotas colheita só para área colheita |
| `BR-SYNC-001`–`005` | [offline-sync.md](../business/offline-sync.md) | implementado | fila e sync dos novos tipos |

**Invariantes aplicáveis:**

- `TMP-001`: valores e `evento_at` não futuros; horas/minutos não negativos
- `TMP-002`: registro exige turno aberto do usuário
- `INT-001`: **horas de corte** (`horas_corte`) obrigatório para fechar turno na área colheita; consumo/densidade e entrada de cana opcionais neste MVP

**Perfis autorizados:**

- `operador_colheita` / área `colheita`: todos os formulários deste briefing
- Supervisor em `BR-COLHEITA-003`: **fora deste briefing** — ver briefing de supervisão (Fase 3)

## 3. Escopo da implementação

### Backend

- **Endpoints**: validação nos tipos `horas_corte`, `consumo_densidade`, `entrada_cana` em `POST /api/v1/sync/push`; bloqueio `INT-001` em `POST /api/v1/turnos/{id}/fechar`
- **Camadas tocadas**: `internal/service/colheita.go`, `services.go`, `repository/registro.go`
- **Migration/constraint**: nenhuma — payload JSON no modelo genérico `registros`
- **Códigos de erro**: `ERR-COLHEITA-001` (payload inválido / faixa física), `ERR-INT-001` (fechamento sem obrigatório), `ERR-ACESSO-001` (perfil errado)

### Frontend

- **Páginas/rotas**: `/colheita` — formulários dos 3 indicadores; link na home do operador colheita
- **Componentes**: `ColheitaPage`, validação compartilhada; remoção do placeholder para área colheita

### O que NÃO mexer

- Transporte, Qualidade, Segurança, Performance (agregação)
- Cadastro de metas (`BR-PERFORMANCE-003`) e comparação executado vs planejado (`BR-PERFORMANCE-002`, `BR-TRANS-005`)
- Painel supervisor (`BR-SUPERVISAO-*`)
- Gestão à Vista
- Entrada de cana pelo supervisor (`BR-COLHEITA-003` perfil supervisor)

## 4. Casos de teste exigidos

- [ ] **Caminho feliz online**: operador colheita registra horas de corte → sync → imutável (`BR-TRANS-004`)
- [ ] **Offline**: registros na fila → reconexão → sync automático (`BR-TRANS-001`, `BR-SYNC-002`)
- [ ] **Sem turno / turno fechado**: bloqueio ao registrar (`TMP-002`, `BR-TURNO-003`)
- [ ] **Valor inválido**: consumo ou densidade fora da faixa MVP rejeitado (`BR-COLHEITA-002`, `ERR-COLHEITA-001`)
- [ ] **Timestamp futuro**: rejeitado (`TMP-001`)
- [ ] **RBAC**: perfil transporte não acessa `/colheita` (`BR-ACESSO-001`)
- [ ] **INT-001**: fechar turno colheita sem `horas_corte` bloqueado (`ERR-INT-001`)
- [ ] **INT-001 feliz**: com `horas_corte` registrado, fechamento permitido

## 5. Perguntas em aberto (obrigatório)

| # | Pergunta | Resposta (desenvolvedor) |
|---|----------|--------------------------|
| 1 | Quais indicadores são obrigatórios no fechamento (`INT-001`) na área colheita? | **`horas_corte` obrigatório**; `consumo_densidade` e `entrada_cana` opcionais no MVP |
| 2 | Granularidade de `BR-COLHEITA-002`: por turno ou por carga? | **Por turno** — um registro único com consumo (L/t) e densidade (ton/carga) por turno |
| 3 | Faixas físicas configuráveis pela unidade no MVP? | **Validação fixa no código** — consumo 0,5–15 L/t; densidade 20–35 ton/carga; configurável por unidade em briefing futuro |
| 4 | BRF-002 inclui metas e comparação (`BR-PERFORMANCE-002/003`, `BR-TRANS-005`)? | **Não** — apenas captura de executado; comparação em briefing posterior |
| 5 | Supervisor registra entrada de cana (`BR-COLHEITA-003`) neste briefing? | **Não** — apenas operador colheita; supervisor na Fase 3 |
| 6 | Exibir agregação diária (`BR-PERFORMANCE-001`) no BRF-002? | **Não** — apenas registros brutos do turno na lista local |

## 6. Critérios de aceite (gate G3)

- [x] Testes da stack passam (comandos em `techContext.md`)
- [x] `node scripts/validate-br-refs.mjs` OK
- [x] Casos de teste da seção 4 existem e passam
- [ ] Comportamento validado manualmente
- [x] `BR-COLHEITA-001`–`003` → `implementado` com ponteiros ao código (`BR-COLHEITA-003` parcial — só operador)
- [x] `memory-bank/activeContext.md` atualizado
- [x] Status deste briefing → `implementado`

## 7. Notas adicionais

- Tipos de registro: `horas_corte`, `consumo_densidade`, `entrada_cana` (payload documentado no código).
- Idempotência por turno: chave fixa `turnoId:tipo:unico` para evitar duplicatas do mesmo indicador no turno.
- Placeholder `BRF-001` permanece disponível para outras áreas até briefings respectivos.
