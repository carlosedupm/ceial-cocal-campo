# Módulo — Supervisão

> Visão consolidada da frente, tempo real online e exceções no fechamento de turno.

## Implementação principal

| Camada | Caminho |
|--------|---------|
| Backend | _(planejado)_ |
| Frontend | _(planejado)_ |

---

## BR-SUPERVISAO-001 — Painel consolidado da frente

| Campo | Valor |
|-------|-------|
| **Enunciado** | Supervisor visualiza **turnos abertos**, **pendências de sync da equipe** e **últimos registros** da frente atribuída. |
| **Escopo** | Mesma unidade e frente; turno vigente e janela recente configurável. |
| **Perfis** | Supervisor frente. |
| **Efeito** | Bloqueio de acesso a outras frentes (`BR-ACESSO-002`). |
| **Implementação** | _(planejado)_ |
| **Estado** | planejado |

---

## BR-SUPERVISAO-002 — Atualizações em tempo real quando online

| Campo | Valor |
|-------|-------|
| **Enunciado** | Com conexão ativa, atualizações de registros da equipe na mesma frente refletem-se **sem recarregamento manual** pelo supervisor. |
| **Escopo** | Painel de supervisão; membros da frente com turno aberto. |
| **Perfis** | Supervisor frente. |
| **Efeito** | Requisito de negócio tempo real; offline exibe último estado local sincronizado. |
| **Implementação** | _(planejado)_ |
| **Estado** | planejado |

---

## BR-SUPERVISAO-003 — Justificativa de fechamento incompleto

| Campo | Valor |
|-------|-------|
| **Enunciado** | Supervisor pode **justificar** fechamento de turno com registros obrigatórios ausentes, registrando motivo auditável. |
| **Escopo** | Fechamento de turno; validação `INT-001`. |
| **Perfis** | Supervisor frente. |
| **Efeito** | Permite fechamento excepcional; justificativa obrigatória e imutável pós-sync. |
| **Implementação** | _(planejado)_ |
| **Estado** | planejado |

---

**Última atualização**: 2026-06-14
