# Módulo — Performance

> Agregação e comparação de indicadores operacionais (entrada de cana, ATR, horizontes temporais).

## Implementação principal

| Camada | Caminho |
|--------|---------|
| Backend | `backend/internal/service/indicadores.go` |
| Frontend | `frontend/src/features/colheita/ColheitaConsultaPage.tsx` |

---

## BR-PERFORMANCE-001 — Agregação por horizonte temporal

| Campo | Valor |
|-------|-------|
| **Enunciado** | Indicadores de performance agregam-se por horizonte **diário** (prioridade campo/turno), **semanal** e **safra** quando dados e conexão permitirem. |
| **Escopo** | Fonte: sistema central (não registros locais do operador). |
| **Perfis** | Operadores (diário/turno); supervisor (semanal/safra online). |
| **Efeito** | Informativo; MVP foca turno/diário. |
| **Implementação** | `gestao_vista.go` (painel unidade); snapshot por turno em `indicadores.go` |
| **Estado** | implementado |

---

## BR-PERFORMANCE-002 — Executado vs planejado

| Campo | Valor |
|-------|-------|
| **Enunciado** | Quando meta **planejada** estiver disponível, exibição compara executado vs planejado com indicação **dentro da meta** ou **fora da meta**. |
| **Escopo** | Indicadores com meta no snapshot ou cadastro `BR-PERFORMANCE-003`. |
| **Perfis** | Conforme `BR-ACESSO-001`. |
| **Efeito** | Informativo; núcleo da UI de consulta colheita. |
| **Implementação** | `ColheitaConsultaPage` |
| **Estado** | implementado |

---

## BR-PERFORMANCE-003 — Cadastro manual de metas planejadas no MVP

| Campo | Valor |
|-------|-------|
| **Enunciado** | No MVP, valores **planejados** podem ser cadastrados pelo **simulador central** ou supervisor; sem integração Gestão à Vista. |
| **Escopo** | Metas por indicador e frente/unidade no snapshot. |
| **Perfis** | `simulador_central`; supervisor frente. |
| **Efeito** | Comparação `BR-PERFORMANCE-002` só quando meta presente. |
| **Implementação** | `planejado` por horizonte no painel unidade; campo `metas` no snapshot turno |
| **Estado** | implementado |

---

**Última atualização**: 2026-06-16
