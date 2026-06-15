# Briefing BRF-001 — Fundação: turno, offline e sync

> Fluxo, papéis e gates: [`docs/briefings/README.md`](./README.md). Ordem de serviço para a **primeira entrega implementável** — sem módulos de área específica (Colheita, etc.).

## Metadados

| Campo | Valor |
|-------|-------|
| ID | `BRF-001` |
| Data | 2026-06-14 |
| Analista | agente documentação |
| Status | implementado |
| Aprovado por (G1) | Workshop PO/operação/TI (2026-06-14) |
| PR vinculado (G2) | fundação BRF-001 (Dev Container + Docker Compose) |

## 1. Objetivo

Entregar a **fundação operacional** do PWA Cocal Campo: identificação do profissional, seleção de unidade/frente, ciclo de **turno** (abrir → registrar → fechar), operação **offline-first** com **fila local** e **sincronização automática**, e **controle de acesso** básico por perfil. Esta fundação habilita briefings subsequentes por área (`BRF-002` Colheita, etc.).

## 2. Regras de negócio (fonte de verdade)

| ID | Módulo | Estado atual | O que muda |
|----|--------|--------------|------------|
| `BR-TRANS-001` | [_transversal.md](../business/_transversal.md) | implementado | offline completa |
| `BR-TRANS-002` | [_transversal.md](../business/_transversal.md) | implementado | sync automática |
| `BR-TRANS-003` | [_transversal.md](../business/_transversal.md) | implementado | vínculo turno/frente/unidade |
| `BR-TRANS-004` | [_transversal.md](../business/_transversal.md) | implementado | imutabilidade pós-sync |
| `BR-TURNO-001` | [turnos.md](../business/turnos.md) | implementado | abertura obrigatória |
| `BR-TURNO-002` | [turnos.md](../business/turnos.md) | implementado | um turno aberto |
| `BR-TURNO-003` | [turnos.md](../business/turnos.md) | implementado | fechamento somente leitura |
| `BR-TURNO-004` | [turnos.md](../business/turnos.md) | implementado | metadados do turno |
| `BR-SYNC-001` | [offline-sync.md](../business/offline-sync.md) | implementado | fila local |
| `BR-SYNC-002` | [offline-sync.md](../business/offline-sync.md) | implementado | sync automática |
| `BR-SYNC-003` | [offline-sync.md](../business/offline-sync.md) | implementado | indicadores UX |
| `BR-SYNC-004` | [offline-sync.md](../business/offline-sync.md) | implementado | retry sem perda |
| `BR-SYNC-005` | [offline-sync.md](../business/offline-sync.md) | implementado | conflito first-sync-wins |
| `BR-ACESSO-001` | [acesso-perfis.md](../business/acesso-perfis.md) | implementado | telas por perfil |
| `BR-ACESSO-004` | [acesso-perfis.md](../business/acesso-perfis.md) | implementado | sessão offline após login online |

**Invariantes aplicáveis:**

- `TMP-001`: registros de turno e eventos não podem ter timestamp futuro
- `TMP-002`: registro exige turno aberto do usuário
- `INT-001`: na fundação, **sem registros obrigatórios por área** — lista vazia; justificativa em `BR-SUPERVISAO-003` para briefings posteriores

**Perfis autorizados:**

- Todos os perfis de `domain-patterns.mdc` para abertura/fechamento de turno próprio
- `BR-ACESSO-001`: menus filtrados por perfil (formulários de área vêm em briefings posteriores)

## 3. Escopo da implementação

### Backend

- **Endpoints**: a definir com stack — must support turno CRUD, fila de sync, perfil do usuário
- **Camadas tocadas**: _(a definir após stack)_
- **Migration/constraint**: entidades turno, registro genérico, fila sync
- **Códigos de erro**: rejeição de registro sem turno (`TMP-002`), turno duplicado aberto (`BR-TURNO-002`)

### Frontend

- **Páginas/rotas**: identificação → seleção unidade/frente → turno → home por perfil → status sync
- **Componentes**: indicador offline/pendências (`BR-SYNC-003`), fluxo abrir/fechar turno

### O que NÃO mexer

- Formulários de indicadores por área (Colheita, Transporte, Qualidade, Segurança, Performance)
- Painel supervisor tempo real (`BR-SUPERVISAO-*`)
- Integração Gestão à Vista
- Definição de metas planejadas (`BR-PERFORMANCE-002`)

## 4. Casos de teste exigidos

- [ ] **Caminho feliz online**: abrir turno → criar registro placeholder → sync → registro imutável para operador (`BR-TRANS-004`)
- [ ] **Offline completo**: sem rede, abrir turno → registrar → fechar → pendências visíveis → reconectar → sync automático (`BR-TRANS-001`, `BR-SYNC-002`)
- [ ] **Turno duplicado**: tentativa de segundo turno aberto bloqueada (`BR-TURNO-002`)
- [ ] **Sem turno**: tentativa de registro bloqueada (`BR-TURNO-001`, `TMP-002`)
- [ ] **Turno fechado**: operador não edita registros (`BR-TURNO-003`)
- [ ] **RBAC**: perfil colheita não acessa menu exclusivo de outra área (`BR-ACESSO-001`)
- [ ] **Bordas temporais**: registro com timestamp futuro rejeitado (`TMP-001`)
- [ ] **Falha sync**: dado local preservado, retry (`BR-SYNC-004`)

## 5. Perguntas em aberto (obrigatório)

| # | Pergunta | Resposta (desenvolvedor) |
|---|----------|--------------------------|
| 1 | Política de conflito quando dois dispositivos offline registram o mesmo indicador/turno? | **First-sync-wins** — ver `BR-SYNC-005`; conflito gera status **erro** e resolução pelo supervisor |
| 2 | Autenticação no campo: login online obrigatório na primeira vez ou credencial offline? | **Login online obrigatório na primeira vez**; sessão offline 7 dias — ver `BR-ACESSO-004` |
| 3 | Lista de «registros obrigatórios» por área no fechamento (`INT-001`) — vazio nesta fundação? | **Sim, lista vazia** nesta fundação; `INT-001` pleno entra com briefings de área (`BRF-002+`) |

## 6. Critérios de aceite (gate G3)

- [ ] Testes da stack passam (comandos em `techContext.md` quando definidos)
- [ ] `node scripts/validate-br-refs.mjs` OK
- [ ] Casos de teste da seção 4 existem e passam
- [ ] Comportamento validado manualmente em cenário offline → online
- [ ] `BR-*` da seção 2 → `implementado` com ponteiros ao código
- [ ] `memory-bank/activeContext.md` atualizado
- [x] Status deste briefing → `implementado`

## 7. Notas adicionais

- Este briefing **bloqueia** briefings de área até G3 ou decisão explícita de paralelizar após G1.
- Stack técnica deve ser definida **antes** do gate G2; requisitos de negócio já estão completos no catálogo.
