# ⚙️ Tech Context — Cocal Campo

> **Stack a definir.** Este arquivo será preenchido quando frontend, backend, banco e infraestrutura forem escolhidos **e aprovados pela equipe** (gate após ADR).

## Status

| Camada | Tecnologia | Versão |
|--------|------------|--------|
| Frontend (PWA) | _a definir_ | — |
| Backend / API | _a definir_ | — |
| Banco de dados | _a definir_ | — |
| Sync offline | _a definir_ | — |

**Descrição resumida:** Stack a definir

## Proposta em discussão (não vinculante)

Há uma **proposta** de stack em [`docs/architecture/ADR-001-stack.md`](../docs/architecture/ADR-001-stack.md) (`Status: proposta`). **Não implementar** até ratificação humana e atualização deste arquivo.

## Requisitos de produto (não prescrevem tecnologia)

Estes requisitos orientam a escolha futura de stack; detalhe operacional em `docs/business/`:

- **PWA instalável** no dispositivo móvel do profissional de campo
- **Offline-first**: leitura e escrita completas sem Internet (`BR-TRANS-001`)
- **Sincronização automática** ao retorno da conexão (`BR-TRANS-002`, `BR-SYNC-*`)
- **Multi-área** com perfis distintos (`BR-ACESSO-*`)
- **Tempo real** para supervisão quando online (`BR-SUPERVISAO-002`)

## Desenvolvimento local

_Comandos serão adicionados após criação do repositório de código e aprovação da stack._

## Decisões técnicas documentadas

| Decisão | Motivo | Data |
|---------|--------|------|
| Documentação viva antes de stack | Negócio primeiro; evitar decisões prematuras | 2026-06-14 |
| Gestão à Vista fora do MVP | Escopo Fase 0–3 = PWA de campo | 2026-06-14 |
| Código removido (scaffold prematuro) | Arquitetura não ratificada; aguardar ADR aceito | 2026-06-14 |

**Última atualização**: 2026-06-14
