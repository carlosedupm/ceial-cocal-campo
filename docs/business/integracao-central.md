# Módulo — Integração com sistema central

> Origem autoritativa dos indicadores operacionais exibidos no PWA. MVP sem contrato: perfil simulador alimenta a base.

## Implementação principal

| Camada | Caminho |
|--------|---------|
| Backend | `backend/internal/service/indicadores.go`, `backend/internal/repository/indicadores.go`, `backend/internal/integration/` |
| Frontend | `frontend/src/lib/indicadores/`, `frontend/src/features/simulador/` |

---

## BR-INTEG-001 — Origem autoritativa no sistema central

| Campo | Valor |
|-------|-------|
| **Enunciado** | Indicadores de performance e qualidade exibidos ao operador têm **origem autoritativa** no sistema central do cliente; o Cocal Campo **não** é fonte de verdade para valores operacionais em produção. |
| **Escopo** | Consulta de indicadores por turno; painel de supervisão. |
| **Perfis** | Todos com permissão de visualização. |
| **Efeito** | Bloqueio de edição pelo operador de campo; valores somente leitura na UI de consulta. |
| **Implementação** | `GET /api/v1/turnos/atual/indicadores`, `ColheitaConsultaPage` |
| **Estado** | implementado |

---

## BR-INTEG-002 — Vínculo indicador a turno, frente e profissional

| Campo | Valor |
|-------|-------|
| **Enunciado** | Cada snapshot de indicadores vincula-se a **turno**, **frente**, **unidade**, **área** e **profissional** (dono do turno). |
| **Escopo** | Materialização em `indicadores_turno`; futuro mapeamento com chaves do central. |
| **Perfis** | Sistema; simulador no MVP. |
| **Efeito** | Consulta filtrada por turno do usuário logado ou por frente (supervisor). |
| **Implementação** | `backend/migrations/003_indicadores.sql`, `indicadores.go` |
| **Estado** | implementado |

---

## BR-INTEG-003 — Estados de disponibilidade do indicador

| Campo | Valor |
|-------|-------|
| **Enunciado** | Cada indicador exibe estado: **`disponivel`**, **`em_processamento`** (ex.: qualidade na usina), **`indisponivel`** ou **`erro_integracao`**. |
| **Escopo** | UI de consulta colheita e supervisão. |
| **Perfis** | Operador colheita; supervisor frente. |
| **Efeito** | Informativo; UI não exibe valor quando `em_processamento` ou `indisponivel`. |
| **Implementação** | Snapshot JSON em `indicadores_turno`; badges em `ColheitaConsultaPage` |
| **Estado** | implementado |

---

## BR-INTEG-004 — Cache offline do último snapshot

| Campo | Valor |
|-------|-------|
| **Enunciado** | Com conexão, indicadores **atualizam em background**; o **último snapshot válido** permanece consultável **offline**. |
| **Escopo** | PWA; tabela IndexedDB `indicadores_cache`. |
| **Perfis** | Todos com telas de consulta. |
| **Efeito** | Leitura offline do último estado sincronizado; mensagem quando nunca houve sync. |
| **Implementação** | `frontend/src/lib/indicadores/cache.ts`, `frontend/src/lib/db/schema.ts` v4 |
| **Estado** | implementado |

---

## BR-INTEG-005 — Ingestão pelo simulador central (MVP)

| Campo | Valor |
|-------|-------|
| **Enunciado** | Enquanto o contrato com o sistema central não existir, o perfil **`simulador_central`** pode **ingerir** indicadores vinculados ao turno de outro profissional da frente; registros com `origem=simulador`. |
| **Escopo** | `POST /sync/push` com RBAC ampliado; materialização automática em `indicadores_turno`. |
| **Perfis** | `simulador_central` apenas. |
| **Efeito** | Bloqueio de ingestão para operadores de campo; auditoria via `ingestido_por`. |
| **Implementação** | `services.go` (SyncService.Push), `SimuladorPage` |
| **Estado** | implementado |

---

**Última atualização**: 2026-06-16
