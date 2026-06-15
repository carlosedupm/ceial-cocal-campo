# Módulo — Offline e sincronização

> Fila local, sync automática, status visível e retry. Requisitos de negócio — implementação técnica a definir.

## Implementação principal

| Camada | Caminho |
|--------|---------|
| Backend | _(planejado)_ |
| Frontend | _(planejado)_ |

---

## BR-SYNC-001 — Fila local com status visível

| Campo | Valor |
|-------|-------|
| **Enunciado** | Registros criados ou alterados offline entram em **fila local** com status visível: **pendente**, **sincronizado** ou **erro**. |
| **Escopo** | Todo registro após gravação local sem confirmação do servidor. |
| **Perfis** | Todos. |
| **Efeito** | UI exibe status por registro ou contagem agregada. |
| **Implementação** | _(planejado)_ |
| **Estado** | planejado |

---

## BR-SYNC-002 — Sync automático ao retorno da conexão

| Campo | Valor |
|-------|-------|
| **Enunciado** | Retorno de conectividade dispara sincronização **automática em background** da fila pendente. |
| **Escopo** | Transição offline → online; periodicidade quando online com pendências. |
| **Perfis** | Todos (transparente). |
| **Efeito** | Nenhuma ação manual obrigatória; ver `BR-TRANS-002`. |
| **Implementação** | _(planejado)_ |
| **Estado** | planejado |

---

## BR-SYNC-003 — Indicadores de sync para o usuário

| Campo | Valor |
|-------|-------|
| **Enunciado** | Usuário sempre visualiza **última sincronização bem-sucedida** e **quantidade de pendências** na fila local. |
| **Escopo** | Cabeçalho ou área persistente do PWA. |
| **Perfis** | Todos. |
| **Efeito** | Informativo; não bloqueia operação offline. |
| **Implementação** | _(planejado)_ |
| **Estado** | planejado |

---

## BR-SYNC-004 — Retry sem perda de dados locais

| Campo | Valor |
|-------|-------|
| **Enunciado** | Falha de sincronização **não apaga** dado local; sistema retenta até sucesso ou exige intervenção explícita após limite configurável. |
| **Escopo** | Erros de rede, timeout, rejeição temporária do servidor. |
| **Perfis** | Todos. |
| **Efeito** | Registro permanece pendente ou em erro com opção de retry manual. |
| **Implementação** | _(planejado)_ |
| **Estado** | planejado |

---

## BR-SYNC-005 — Resolução de conflito offline (first-sync-wins)

| Campo | Valor |
|-------|-------|
| **Enunciado** | Quando dois dispositivos offline registram valores divergentes para a **mesma chave lógica** (mesmo turno + tipo de registro + identificador), o servidor aceita o **primeiro sync bem-sucedido**; o segundo recebe **erro de conflito**, o registro local permanece com status **erro** e exige resolução pelo supervisor (`BR-SUPERVISAO-003`). |
| **Escopo** | Sync de registros com chave de idempotência duplicada e payload divergente. |
| **Perfis** | Todos (efeito automático); supervisor resolve conflitos. |
| **Efeito** | Bloqueio de overwrite silencioso; trilha de auditoria preservada. |
| **Implementação** | _(planejado)_ |
| **Estado** | planejado |

---

**Última atualização**: 2026-06-14
