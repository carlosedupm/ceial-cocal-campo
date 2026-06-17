# Briefing BRF-008 — Gestão à Vista MVP (dados primeiro)

> Fluxo, papéis e gates: [`docs/briefings/README.md`](./README.md). Antecipa parcialmente Fase 4 com leitura + simulador.

## Metadados

| Campo | Valor |
|-------|-------|
| ID | `BRF-008` |
| Data | 2026-06-16 |
| Analista | agente implementação |
| Status | implementado |
| Aprovado por (G1) | Plano Gestão à Vista (2026-06-16) |
| PR vinculado (G2) | BRF-008 Gestão à Vista MVP |

## 1. Objetivo

Exibir painel **Gestão à Vista** por **unidade** com contadores de **dias sem acidentes** e comparativos **planejado vs executado** de **Performance** e **Qualidade** por horizonte (**diário**, **semanal**, **safra**), originados no sistema central (MVP: simulador `BR-INTEG-005`). Duas superfícies: rota dedicada `/gestao-a-vista` e resumo no painel do supervisor.

## 2. Regras de negócio (fonte de verdade)

| ID | Módulo | Estado atual | O que muda |
|----|--------|--------------|------------|
| `BR-PERFORMANCE-001` | [performance.md](../business/performance.md) | parcial | agregação por horizonte no painel unidade |
| `BR-PERFORMANCE-003` | [performance.md](../business/performance.md) | parcial | metas por horizonte via simulador |
| `BR-TRANS-005` | [_transversal.md](../business/_transversal.md) | planejado | semântica verde/vermelho na UI |
| `BR-SEGURANCA-002` | [seguranca.md](../business/seguranca.md) | planejado | visualização contadores |
| `BR-INTEG-006` | [integracao-central.md](../business/integracao-central.md) | planejado | ingestão/consulta snapshot painel unidade |

**Invariantes aplicáveis:**

- `INT-002`: contador só muda por ocorrência validada — **fora do escopo** deste briefing (simulador envia estado atual como central)

**Perfis autorizados:**

- `GET`: supervisor, simulador, operadores da unidade (read-only)
- `PUT`: `simulador_central` apenas (`BR-ACESSO-005`)

## 3. Escopo da implementação

### Backend

- **Endpoints**: `GET/PUT /api/v1/unidades/{id}/gestao-vista`
- **Camadas**: `gestao_vista.go`, `repository/painel_unidade.go`, `handlers/gestao_vista.go`
- **Migration**: `004_painel_unidade.sql` + seed exemplo
- **Códigos**: `ERR-ACESSO-001`, `ERR-REQ-001`, `ERR-NOT-FOUND`

### Frontend

- **Rotas**: `/gestao-a-vista`, resumo em `/supervisao`
- **Componentes**: `ComparativoGrid`, `DiasSemAcidentesPanel`, aba simulador
- **Lib**: `lib/gestao-vista/` (cache, comparação)

### O que NÃO mexer

- Snapshot por turno (`indicadores_turno`, BRF-005/006)
- Fluxo ocorrências segurança (`BR-SEGURANCA-001/003/004`)
- Layout TV pixel-perfect
- Agregação local safra/semanal a partir de turnos

## 4. Casos de teste exigidos

- [ ] Simulador faz PUT painel → supervisor vê resumo e painel completo
- [ ] GET sem painel ingerido → 404
- [ ] Operador colheita tenta PUT → ERR-ACESSO-001
- [ ] Comparativo verde/vermelho conforme `direcao` do indicador

## 5. Perguntas em aberto

Nenhuma — escopo completo para MVP dados primeiro.

## 6. Critérios de aceite (gate G3)

- [ ] Testes backend e E2E passam
- [ ] `npm run validate` OK
- [ ] `BR-INTEG-006`, `BR-TRANS-005`, `BR-SEGURANCA-002` atualizados
- [ ] `memory-bank` atualizado

## 7. Notas adicionais

Snapshot pré-agregado espelha payload do central; não somar `indicadores_turno`.

**Última atualização**: 2026-06-16
