# Módulo — Colheita

> Registros operacionais da frente de colheita de cana-de-açúcar.

## Implementação principal

| Camada | Caminho |
|--------|---------|
| Backend | `backend/internal/service/colheita.go`, `backend/internal/service/services.go` |
| Frontend | `frontend/src/features/colheita/ColheitaPage.tsx`, `frontend/src/lib/colheita/validation.ts` |

---

## BR-COLHEITA-001 — Horas de corte do turno

| Campo | Valor |
|-------|-------|
| **Enunciado** | Operador de colheita registra **horas de corte** acumuladas ou intervalo do turno (unidade: horas, formato hh:mm). |
| **Escopo** | Turno aberto; área Colheita; indicador performance. |
| **Perfis** | Operador colheita. |
| **Efeito** | Bloqueio se valor negativo ou data futura (`TMP-001`). Obrigatório no fechamento (`INT-001`, BRF-002). |
| **Implementação** | Tipo `horas_corte`; payload `{ horas, minutos, exibicao }`; validação em `colheita.go` e `validation.ts` |
| **Estado** | implementado |

---

## BR-COLHEITA-002 — Consumo colhedora e densidade

| Campo | Valor |
|-------|-------|
| **Enunciado** | Operador registra **consumo colhedora** (L/t) e **densidade** (ton/carga) do turno ou por carga conforme prática da frente. |
| **Escopo** | Turno aberto; frente de colheita. MVP BRF-002: **por turno**. |
| **Perfis** | Operador colheita. |
| **Efeito** | Bloqueio se valores fora de faixa física (MVP: 0,5–15 L/t, 20–35 ton/carga). Comparação com meta via `BR-TRANS-005` — fora do BRF-002. |
| **Implementação** | Tipo `consumo_densidade`; payload `{ consumo_lt, densidade_ton_carga }` |
| **Estado** | implementado |

---

## BR-COLHEITA-003 — Entrada de cana da frente

| Campo | Valor |
|-------|-------|
| **Enunciado** | Operador ou supervisor registra **entrada de cana** (toneladas) atribuível à frente de colheita no turno/dia. |
| **Escopo** | Agregação diária por frente; horizonte safra quando online. BRF-002: apenas **operador colheita**. |
| **Perfis** | Operador colheita (BRF-002); supervisor frente — briefing supervisão Fase 3. |
| **Efeito** | Bloqueio se turno não aberto; vínculo obrigatório a frente (`BR-TRANS-003`). |
| **Implementação** | Tipo `entrada_cana`; payload `{ toneladas }` — ver [performance.md](./performance.md) |
| **Estado** | parcial |

---

**Última atualização**: 2026-06-15
