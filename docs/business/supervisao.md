# Módulo — Supervisão

> Visão consolidada read-only da frente e consulta de turnos da equipe.

## Implementação principal

| Camada | Caminho |
|--------|---------|
| Backend | `GET /api/v1/frentes/{id}/turnos`, `GET /api/v1/frentes/{id}/indicadores-resumo` |
| Frontend | `frontend/src/features/supervisao/` |

---

## BR-SUPERVISAO-001 — Painel consolidado da frente

| Campo | Valor |
|-------|-------|
| **Enunciado** | Supervisor **visualiza** turnos abertos da equipe, indicadores resumidos por **setor/área** e estado de disponibilidade dos dados. |
| **Escopo** | Mesma unidade e frente atribuídas; turno vigente. |
| **Perfis** | Supervisor frente. |
| **Efeito** | Somente leitura; bloqueio a outras frentes (`BR-ACESSO-002`). |
| **Implementação** | `SupervisaoPage`, `TurnoDetalhePage` |
| **Estado** | implementado |

---

## BR-SUPERVISAO-002 — Atualizações quando online

| Campo | Valor |
|-------|-------|
| **Enunciado** | Com conexão ativa, painel da frente **atualiza periodicamente** sem recarregamento manual (polling no MVP). |
| **Escopo** | Painel de supervisão. |
| **Perfis** | Supervisor frente. |
| **Efeito** | Offline exibe último snapshot local. |
| **Implementação** | Polling em `SupervisaoPage` |
| **Estado** | implementado |

---

## BR-SUPERVISAO-003 — Justificativa de fechamento incompleto

| Campo | Valor |
|-------|-------|
| **Enunciado** | Supervisor pode justificar fechamento com registros obrigatórios ausentes. |
| **Escopo** | Modelo consulta sem registro pelo operador. |
| **Perfis** | Supervisor frente. |
| **Efeito** | **Adiado** — irrelevante enquanto operadores não registram (`INT-001` revogado para campo). |
| **Implementação** | _(adiado)_ |
| **Estado** | planejado |

---

**Última atualização**: 2026-06-16
