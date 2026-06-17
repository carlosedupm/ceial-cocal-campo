# Módulo — Segurança

> Ocorrências e contadores de dias sem acidentes.

## Implementação principal

| Camada | Caminho |
|--------|---------|
| Backend | `backend/internal/service/gestao_vista.go` |
| Frontend | `frontend/src/features/gestao-vista/` |

---

## BR-SEGURANCA-001 — Ocorrência zera contador de dias sem acidentes

| Campo | Valor |
|-------|-------|
| **Enunciado** | Registro de **acidente ou incidente** validado zera o contador de **dias sem acidentes** da combinação **unidade + operação** afetada. |
| **Escopo** | Unidades Paraguaçu Paulista e Narandiba; operações Colheita e Transporte. |
| **Perfis** | Técnico segurança; validação conforme `BR-SEGURANCA-004`. |
| **Efeito** | Atualização derivada do evento; proibida edição manual livre (`INT-002`). |
| **Implementação** | _(planejado)_ |
| **Estado** | planejado |

---

## BR-SEGURANCA-002 — Visualização de contadores atuais

| Campo | Valor |
|-------|-------|
| **Enunciado** | Profissionais autorizados visualizam contadores atuais de **dias sem acidentes** por unidade e por operação. |
| **Escopo** | Consulta read-only; sincronizada quando online. |
| **Perfis** | Técnico segurança, supervisor frente, operadores conforme `BR-ACESSO-001`. |
| **Efeito** | Informativo; dados somente leitura. |
| **Implementação** | `DiasSemAcidentesPanel`, snapshot `seguranca.dias_sem_acidentes` |
| **Estado** | parcial |

---

## BR-SEGURANCA-004 — Validação de ocorrência pelo supervisor

| Campo | Valor |
|-------|-------|
| **Enunciado** | Ocorrência de segurança fica em estado **pendente de validação** até o **supervisor da frente** aprovar ou rejeitar em até **24 horas**. Contador de dias sem acidentes (`BR-SEGURANCA-001`, `INT-002`) só zera após **validação aprovada**. |
| **Escopo** | Fluxo pós-registro de ocorrência; unidades Paraguaçu Paulista e Narandiba. |
| **Perfis** | Supervisor frente (validação); técnico segurança (registro). |
| **Efeito** | Bloqueio de impacto no contador sem validação; rejeição mantém contador e exige novo registro se necessário. |
| **Implementação** | _(planejado)_ — fora do escopo `BRF-001` |
| **Estado** | planejado |

---

## BR-SEGURANCA-003 — Campos obrigatórios da ocorrência

| Campo | Valor |
|-------|-------|
| **Enunciado** | Registro de ocorrência exige **tipo**, **severidade**, **unidade**, **operação** e **descrição mínima**. |
| **Escopo** | Criação de ocorrência de segurança. |
| **Perfis** | Técnico segurança; supervisor conforme política da unidade. |
| **Efeito** | Bloqueio até preenchimento completo; offline permitido com sync posterior. |
| **Implementação** | _(planejado)_ |
| **Estado** | planejado |

---

**Última atualização**: 2026-06-16
