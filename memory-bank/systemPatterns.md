# 🏗️ System Patterns — Cocal Campo

> **Arquitetura e padrões técnicos pendentes de definição e aprovação humana.**

A stack, camadas da aplicação, padrões de API, autenticação e estratégia de testes **ainda não foram escolhidos**. Este arquivo será preenchido quando a decisão técnica for **ratificada** (ADR aceito).

## Proposta em discussão (não vinculante)

Ver [`docs/architecture/ADR-001-stack.md`](../docs/architecture/ADR-001-stack.md) — status **proposta**. Não criar `backend/` nem `frontend/` até aceite.

## O que já está definido (negócio)

Requisitos não-funcionais estão documentados como **regras de negócio**, não como decisões de implementação:

| Requisito | Onde documentar |
|-----------|-----------------|
| Offline-first | `BR-TRANS-001`, `BR-SYNC-*` |
| Sync automática | `BR-TRANS-002`, `BR-SYNC-002` |
| PWA instalável | Charter em `projectbrief.md` — detalhe técnico pendente |
| Multi-área / turno | `BR-TRANS-003`, `BR-TURNO-*`, `BR-ACESSO-*` |
| Tempo real online | `BR-SUPERVISAO-002` |

## Próximo passo

1. Equipe revisa e **aceita ou altera** ADR-001
2. Preencher este arquivo + `techContext.md`
3. Gate G2 do `BRF-001` — então scaffold e implementação

**Última atualização**: 2026-06-14
