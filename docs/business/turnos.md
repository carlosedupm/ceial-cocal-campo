# Módulo — Turnos

> Abertura, operação e fechamento do turno de trabalho no campo.

## Implementação principal

| Camada | Caminho |
|--------|---------|
| Backend | _(planejado)_ |
| Frontend | _(planejado)_ |

---

## BR-TURNO-001 — Abertura obrigatória antes do registro

| Campo | Valor |
|-------|-------|
| **Enunciado** | Profissional deve **abrir turno** antes de realizar o primeiro registro operacional. |
| **Escopo** | Fluxo inicial após identificação e seleção de unidade/frente. |
| **Perfis** | Todos os perfis operacionais. |
| **Efeito** | Bloqueio de criação de registro sem turno aberto (`TMP-002`). |
| **Implementação** | _(planejado)_ |
| **Estado** | planejado |

---

## BR-TURNO-002 — Um turno aberto por profissional

| Campo | Valor |
|-------|-------|
| **Enunciado** | Um profissional só pode ter **um turno aberto** por vez. |
| **Escopo** | Abertura de novo turno; tentativa com turno já aberto. |
| **Perfis** | Todos. |
| **Efeito** | Bloqueio até fechamento ou cancelamento do turno anterior. |
| **Implementação** | _(planejado)_ |
| **Estado** | planejado |

---

## BR-TURNO-003 — Turno fechado é somente leitura para operadores

| Campo | Valor |
|-------|-------|
| **Enunciado** | Fechamento de turno **consolida** registros do período; turno fechado torna-se **somente leitura** para operadores. |
| **Escopo** | Pós-fechamento; edição de registros do turno. |
| **Perfis** | Operadores: leitura; supervisor: ações conforme `BR-SUPERVISAO-003`. |
| **Efeito** | Bloqueio de edição para operadores; sync de estado final (`INT-001`). |
| **Implementação** | _(planejado)_ |
| **Estado** | planejado |

---

## BR-TURNO-004 — Metadados do turno

| Campo | Valor |
|-------|-------|
| **Enunciado** | Turno registra **unidade**, **frente de trabalho**, **área principal**, **horário de início** e **horário de fim** (no fechamento). |
| **Escopo** | Entidade turno; relatórios e agregações. |
| **Perfis** | Todos. |
| **Efeito** | Bloqueio de abertura sem unidade e frente selecionadas. |
| **Implementação** | _(planejado)_ |
| **Estado** | planejado |

---

**Última atualização**: 2026-06-14
