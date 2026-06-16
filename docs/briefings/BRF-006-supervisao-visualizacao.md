# Briefing BRF-006 — Supervisão: visualização da frente

> Fluxo, papéis e gates: [`docs/briefings/README.md`](./README.md).

## Metadados

| Campo | Valor |
|-------|-------|
| ID | `BRF-006` |
| Data | 2026-06-16 |
| Analista | agente documentação |
| Status | implementado |
| Aprovado por (G1) | Workshop escopo visualização (2026-06-16) |
| PR vinculado (G2) | BRF-006 Supervisão consulta |

## 1. Objetivo

Permitir que o **supervisor de frente** **visualize** turnos abertos da equipe na frente atribuída, com resumo por setor/área e detalhe read-only dos indicadores de cada turno.

## 2. Regras de negócio (fonte de verdade)

| ID | Módulo | Estado atual | O que muda |
|----|--------|--------------|------------|
| `BR-SUPERVISAO-001` | [supervisao.md](../business/supervisao.md) | planejado | painel read-only |
| `BR-SUPERVISAO-002` | [supervisao.md](../business/supervisao.md) | planejado | polling MVP |
| `BR-ACESSO-002` | [acesso-perfis.md](../business/acesso-perfis.md) | planejado | leitura cross-usuário |

**Invariantes:** nenhuma de escrita.

**Perfis:** supervisor frente apenas.

## 3. Escopo da implementação

### Backend

- `GET /api/v1/frentes/{id}/turnos?status=aberto`
- `GET /api/v1/frentes/{id}/indicadores-resumo`
- `GET /api/v1/turnos/{id}/indicadores` (RBAC supervisor)

### Frontend

- `/supervisao`, `/supervisao/turnos/:id`
- Supervisor **não** obrigado a abrir turno próprio para consultar

### O que NÃO mexer

- `BR-SUPERVISAO-003` (justificativa)
- Registro pelo operador

## 4. Casos de teste exigidos

- [ ] Supervisor vê turnos abertos da frente colheita
- [ ] Detalhe read-only de turno de operador
- [ ] RBAC: supervisor bloqueado em frente não atribuída
- [ ] Polling atualiza lista quando simulador ingere

## 5. Perguntas em aberto

Nenhuma — escopo completo para MVP leitura.

## 6. Critérios de aceite (gate G3)

- [ ] Testes passam
- [ ] `BR-SUPERVISAO-001/002` e `BR-ACESSO-002` implementados
