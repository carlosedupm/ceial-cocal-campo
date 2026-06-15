# Módulo — Acesso e perfis

> Quem vê e edita o quê, conforme área de atuação no campo.

## Implementação principal

| Camada | Caminho |
|--------|---------|
| Backend | _(planejado)_ |
| Frontend | _(planejado)_ |

---

## BR-ACESSO-001 — Telas filtradas por perfil e área

| Campo | Valor |
|-------|-------|
| **Enunciado** | Formulários e telas disponíveis são filtrados pelo **perfil + área** atribuídos ao profissional. |
| **Escopo** | Navegação e menus do PWA após identificação. |
| **Perfis** | Operador colheita, operador transporte, técnico qualidade, técnico segurança, supervisor frente. |
| **Efeito** | Bloqueio de acesso a formulários de área não autorizada. |
| **Implementação** | _(planejado)_ |
| **Estado** | planejado |

---

## BR-ACESSO-002 — Supervisor acessa registros da frente

| Campo | Valor |
|-------|-------|
| **Enunciado** | Supervisor de frente acessa registros de **todos os membros** vinculados à **mesma frente** no turno vigente e histórico recente conforme política da unidade. |
| **Escopo** | Consulta e ações de supervisão (`BR-SUPERVISAO-*`). |
| **Perfis** | Supervisor de frente. |
| **Efeito** | Bloqueio de acesso a frentes/unidades não atribuídas. |
| **Implementação** | _(planejado)_ — ver [supervisao.md](./supervisao.md) |
| **Estado** | planejado |

---

## BR-ACESSO-004 — Sessão offline após login online

| Campo | Valor |
|-------|-------|
| **Enunciado** | O **primeiro acesso** no dispositivo exige **autenticação online**; após sucesso, o PWA mantém **sessão offline** válida por **7 dias**, renovável com qualquer conexão posterior. Sem sessão válida, bloqueio de registro. |
| **Escopo** | Identificação inicial e renovação de credencial no dispositivo. |
| **Perfis** | Todos. |
| **Efeito** | Bloqueio de operação sem sessão; logout explícito invalida sessão local imediatamente. |
| **Implementação** | _(planejado)_ |
| **Estado** | planejado |

---

## BR-ACESSO-003 — Técnicos em múltiplas frentes da unidade

| Campo | Valor |
|-------|-------|
| **Enunciado** | Técnico de qualidade ou segurança pode registrar em **múltiplas frentes** dentro da **mesma unidade** operacional. |
| **Escopo** | Seleção de frente antes do registro; módulos qualidade e segurança. |
| **Perfis** | Técnico qualidade, técnico segurança. |
| **Efeito** | Bloqueio de registro em unidade não atribuída. |
| **Implementação** | _(planejado)_ |
| **Estado** | planejado |

---

**Última atualização**: 2026-06-14
