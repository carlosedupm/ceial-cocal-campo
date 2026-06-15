# Módulo — Colheita

> Registros operacionais da frente de colheita de cana-de-açúcar.

## Implementação principal

| Camada | Caminho |
|--------|---------|
| Backend | _(planejado)_ |
| Frontend | _(planejado)_ |

---

## BR-COLHEITA-001 — Horas de corte do turno

| Campo | Valor |
|-------|-------|
| **Enunciado** | Operador de colheita registra **horas de corte** acumuladas ou intervalo do turno (unidade: horas, formato hh:mm). |
| **Escopo** | Turno aberto; área Colheita; indicador performance. |
| **Perfis** | Operador colheita. |
| **Efeito** | Bloqueio se valor negativo ou data futura (`TMP-001`). |
| **Implementação** | _(planejado)_ |
| **Estado** | planejado |

---

## BR-COLHEITA-002 — Consumo colhedora e densidade

| Campo | Valor |
|-------|-------|
| **Enunciado** | Operador registra **consumo colhedora** (L/t) e **densidade** (ton/carga) do turno ou por carga conforme prática da frente. |
| **Escopo** | Turno aberto; frente de colheita. |
| **Perfis** | Operador colheita. |
| **Efeito** | Bloqueio se valores fora de faixa física configurável pela unidade; comparação com meta via `BR-TRANS-005`. |
| **Implementação** | _(planejado)_ |
| **Estado** | planejado |

---

## BR-COLHEITA-003 — Entrada de cana da frente

| Campo | Valor |
|-------|-------|
| **Enunciado** | Operador ou supervisor registra **entrada de cana** (toneladas) atribuível à frente de colheita no turno/dia. |
| **Escopo** | Agregação diária por frente; horizonte safra quando online. |
| **Perfis** | Operador colheita, supervisor frente. |
| **Efeito** | Bloqueio se turno não aberto; vínculo obrigatório a frente (`BR-TRANS-003`). |
| **Implementação** | _(planejado)_ — ver [performance.md](./performance.md) |
| **Estado** | planejado |

---

**Última atualização**: 2026-06-14
