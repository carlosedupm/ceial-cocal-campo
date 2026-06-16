# Briefing BRF-007 — Simulador do sistema central

> Fluxo, papéis e gates: [`docs/briefings/README.md`](./README.md). Habilita MVP sem contrato de integração.

## Metadados

| Campo | Valor |
|-------|-------|
| ID | `BRF-007` |
| Data | 2026-06-16 |
| Analista | agente documentação |
| Status | implementado |
| Aprovado por (G1) | Workshop escopo visualização (2026-06-16) |
| PR vinculado (G2) | BRF-007 Simulador central |

## 1. Objetivo

Permitir que o perfil **`simulador_central`** **ingira** indicadores de colheita e qualidade vinculados ao **turno de outro profissional**, simulando o sistema central até existir contrato real (`BR-INTEG-005`).

## 2. Regras de negócio (fonte de verdade)

| ID | Módulo | Estado atual | O que muda |
|----|--------|--------------|------------|
| `BR-INTEG-005` | [integracao-central.md](../business/integracao-central.md) | planejado | ingestão simulador |
| `BR-ACESSO-005` | [acesso-perfis.md](../business/acesso-perfis.md) | planejado | RBAC ingestão |
| Validações colheita/qualidade | `colheita.go`, `qualidade.go` | implementado | reuso no push simulador |

**Perfis:** `simulador_central` apenas.

## 3. Escopo da implementação

### Backend

- Migration `origem`, `ingestido_por` em `registros`
- `SyncService.Push`: simulador pode escrever em turno alheio da frente autorizada
- Materialização `indicadores_turno` após cada ingestão
- Seed `simulador@cocal.dev`

### Frontend

- Rota `/simulador`: seletor de turno alvo + formulários colheita/qualidade
- Banner "Modo simulação — sistema central"
- Push online direto (sem fila local obrigatória)

### O que NÃO mexer

- UX consulta operador (`BRF-005`)
- Adapter sistema central real

## 4. Casos de teste exigidos

- [ ] Simulador ingere horas_corte em turno do operador colheita
- [ ] Materialização atualiza snapshot consultável
- [ ] Operador colheita recebe ERR-ACESSO-001 ao tentar push de indicador
- [ ] Qualidade com `disponibilidade=em_processamento` no payload

## 5. Perguntas em aberto

| # | Pergunta | Resposta |
|---|----------|----------|
| 1 | Nome do perfil | `simulador_central` (dedicado) |
| 2 | Metas planejadas no MVP | Opcional no snapshot via simulador |

## 6. Critérios de aceite (gate G3)

- [ ] `BR-INTEG-005` e `BR-ACESSO-005` implementados
- [ ] E2E simulador → operador consulta
