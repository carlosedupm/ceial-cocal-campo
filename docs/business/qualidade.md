# Módulo — Qualidade

> Visualização de indicadores de qualidade processados na usina (latência pós-colheita).

## Implementação principal

| Camada | Caminho |
|--------|---------|
| Backend | Materialização em `indicadores_turno.snapshot.qualidade` |
| Frontend | `ColheitaConsultaPage` (seção qualidade) |

---

## BR-QUALIDADE-001 — Visualização de impurezas

| Campo | Valor |
|-------|-------|
| **Enunciado** | Profissional autorizado **visualiza** **impureza mineral** e **impureza vegetal** (kg/ton) quando processadas e disponibilizadas pelo central. |
| **Escopo** | Consulta no turno; frequentemente `em_processamento` até chegada na usina. |
| **Perfis** | Operador colheita (no contexto do seu turno); supervisor. |
| **Efeito** | Somente leitura; badge de latência na UI. |
| **Implementação** | Snapshot `qualidade.impurezas` |
| **Estado** | implementado |

> Regras de registro em campo (`BRF-004`) **superseded** para operadores; ingestão MVP via `BR-INTEG-005`.

---

## BR-QUALIDADE-002 — Visualização de perdas e pisoteio

| Campo | Valor |
|-------|-------|
| **Enunciado** | Profissional **visualiza** **perdas**, **pisoteio** e **abalo e arranquio** (%) quando disponíveis. |
| **Escopo** | Turno ou consolidação da frente. |
| **Perfis** | Operador colheita; supervisor. |
| **Efeito** | Somente leitura. |
| **Implementação** | Snapshot `qualidade.perdas_campo` |
| **Estado** | implementado |

---

## BR-QUALIDADE-003 — Contexto talhão/frente na exibição

| Campo | Valor |
|-------|-------|
| **Enunciado** | Indicadores de qualidade exibidos incluem identificação de **talhão** e/ou **frente** quando fornecidos pelo central. |
| **Escopo** | Exibição em consulta. |
| **Perfis** | Conforme `BR-ACESSO-001`. |
| **Efeito** | Informativo na UI. |
| **Implementação** | Campo `talhao_codigo` no snapshot |
| **Estado** | implementado |

---

**Última atualização**: 2026-06-16
