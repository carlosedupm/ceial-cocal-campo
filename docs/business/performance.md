# Módulo — Performance

> Agregação e comparação de indicadores operacionais (entrada de cana, ATR, horizontes temporais).

## Implementação principal

| Camada | Caminho |
|--------|---------|
| Backend | _(planejado)_ |
| Frontend | _(planejado)_ |

---

## BR-PERFORMANCE-001 — Agregação por horizonte temporal

| Campo | Valor |
|-------|-------|
| **Enunciado** | Indicadores de performance agregam-se por horizonte **diário** (prioridade campo/turno), **semanal** e **safra** quando dados e conexão permitirem. |
| **Escopo** | Entrada de cana, ATR (kg/ton), densidade, horas de corte, consumos; fontes: colheita, transporte. |
| **Perfis** | Operadores (diário/turno); supervisor e perfis autorizados (semanal/safra online). |
| **Efeito** | Informativo; registros de turno alimentam agregação diária offline local. |
| **Implementação** | _(planejado)_ |
| **Estado** | planejado |

---

## BR-PERFORMANCE-002 — Executado vs planejado

| Campo | Valor |
|-------|-------|
| **Enunciado** | Quando meta **planejada** estiver disponível, exibição compara executado vs planejado com indicação **dentro da meta** ou **fora da meta** sem prescrever implementação visual. |
| **Escopo** | Indicadores com meta cadastrada; horizontes diário, semanal, safra. |
| **Perfis** | Conforme `BR-ACESSO-001`. |
| **Efeito** | Informativo; ver `BR-TRANS-005`. Origem das metas: `BR-PERFORMANCE-003`. |
| **Implementação** | _(planejado)_ |
| **Estado** | planejado |

---

## BR-PERFORMANCE-003 — Cadastro manual de metas planejadas no MVP

| Campo | Valor |
|-------|-------|
| **Enunciado** | No MVP, valores **planejados** são cadastrados **manualmente** por supervisor ou perfil administrativo da unidade; sem importação nem integração com Gestão à Vista. |
| **Escopo** | Metas diárias, semanais e de safra por indicador e frente/unidade. |
| **Perfis** | Supervisor frente; administrador unidade (conforme `BR-ACESSO-001`). |
| **Efeito** | Comparação executado vs planejado (`BR-PERFORMANCE-002`) só exibida quando meta cadastrada. |
| **Implementação** | _(planejado)_ — fora do escopo `BRF-001` |
| **Estado** | planejado |

---

**Última atualização**: 2026-06-14
