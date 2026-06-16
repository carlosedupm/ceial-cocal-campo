# Módulo — Colheita

> Consulta de indicadores de performance e qualidade do turno de colheita (origem: sistema central).

## Implementação principal

| Camada | Caminho |
|--------|---------|
| Backend | `backend/internal/service/indicadores.go`, `GET /api/v1/turnos/atual/indicadores` |
| Frontend | `frontend/src/features/colheita/ColheitaConsultaPage.tsx` |

---

## BR-COLHEITA-001 — Visualização de horas de corte

| Campo | Valor |
|-------|-------|
| **Enunciado** | Operador de colheita **visualiza** **horas de corte** do turno (formato hh:mm), originadas no sistema central. |
| **Escopo** | Turno aberto ou consulta do turno vigente; área Colheita. |
| **Perfis** | Operador colheita. |
| **Efeito** | Somente leitura; estado `disponibilidade` conforme `BR-INTEG-003`. |
| **Implementação** | Snapshot `performance.horas_corte` em `indicadores_turno` |
| **Estado** | implementado |

> Regra anterior de registro (`BRF-002`) **superseded** para operadores de campo.

---

## BR-COLHEITA-002 — Visualização de consumo e densidade

| Campo | Valor |
|-------|-------|
| **Enunciado** | Operador **visualiza** **consumo colhedora** (L/t) e **densidade** (ton/carga) do turno. |
| **Escopo** | Turno de colheita; comparação com meta via `BR-PERFORMANCE-002` quando disponível. |
| **Perfis** | Operador colheita. |
| **Efeito** | Somente leitura. |
| **Implementação** | Snapshot `performance.consumo_densidade` |
| **Estado** | implementado |

---

## BR-COLHEITA-003 — Visualização de entrada de cana

| Campo | Valor |
|-------|-------|
| **Enunciado** | Operador **visualiza** **entrada de cana** (toneladas) atribuível à frente no turno/dia. |
| **Escopo** | Agregação por turno; horizonte safra quando central disponibilizar. |
| **Perfis** | Operador colheita; supervisor — leitura na frente (`BR-SUPERVISAO-001`). |
| **Efeito** | Somente leitura. |
| **Implementação** | Snapshot `performance.entrada_cana` |
| **Estado** | implementado |

---

**Última atualização**: 2026-06-16
