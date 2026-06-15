# Cocal Campo — Instruções para Agentes

Instruções **portáveis** para agentes de IA (Cursor, CLI, etc.). Regras Cursor-specific ficam em [`.cursor/rules/`](.cursor/rules/).

## Visão Geral

**Cocal Campo** — PWA offline-first para frentes de trabalho no campo (colheita de cana Cocal). Stack: **a definir**.

Requisitos versionados em `docs/business/` (IDs `BR-*`). Estado vivo em `memory-bank/`.

## Modo atual: negócio primeiro

1. **Não escolher stack** — `techContext.md` e `systemPatterns.md` estão pendentes de definição humana.
2. **Fonte de verdade** = `docs/business/`; implementação de código só via briefing `Status: aprovado` (gate G1).
3. **Requisitos não-funcionais como negócio**: offline-first, PWA instalável, sync automática e multi-área estão em `BR-TRANS-*` e `BR-SYNC-*` — **não** prescreva React, IndexedDB, Service Worker, etc. sem decisão registrada em `techContext.md`.
4. **Gestão à Vista** (dashboard de gestão) está **fora do escopo** até Fase 4 — não implementar nem especificar integração sem novo briefing.
5. **Dúvidas de domínio** → seção «Perguntas em aberto» do briefing; nunca assumir política de conflito offline, validação de segurança ou origem de metas planejadas (ver lacunas em `_transversal.md`).
6. **Proibido** criar ou alterar regras `BR-*` durante implementação — devolver ao analista funcional / gate G1.

## Documentação — onde consultar

### Memory Bank (`memory-bank/`)

**SEMPRE consulte antes de decisões significativas:**

| Arquivo | Conteúdo |
|---------|----------|
| `activeContext.md` | Estado atual, em andamento, próximos passos, problemas |
| `projectbrief.md` | Objetivos, fases e definição de pronto |
| `productContext.md` | Personas, jornadas, métricas de valor |
| `systemPatterns.md` | Placeholder — arquitetura pendente |
| `techContext.md` | Placeholder — stack pendente |
| `progress.md` | Completude e marcos |
| `deploy-notes.md` | Deploy e variáveis de ambiente |

### Outros

- **Vocabulário de domínio**: `.cursor/rules/domain-patterns.mdc`
- **Regras de domínio**: [`docs/business/README.md`](docs/business/README.md)
- **Fluxo transversal**: [`docs/business/_transversal.md`](docs/business/_transversal.md)
- **Fluxo de briefings**: [`docs/briefings/README.md`](docs/briefings/README.md) — gates G1–G3
- **Operações**: [`docs/ops/README.md`](docs/ops/README.md)

## Fluxo de requisitos

```
BR-* planejado (catálogo) → BRF-NNN aprovado (G1) → implementação (G2) → aceite (G3)
```

1. Regra nova nasce em `docs/business/` com estado `planejado`
2. Briefing referencia IDs — não copia regras
3. Implementador só executa briefing `aprovado`
4. G3: `BR-*` → `implementado`, memory-bank atualizado, CI verde

**Primeiro briefing de fundação:** [`docs/briefings/BRF-001-fundacao-turno-sync.md`](docs/briefings/BRF-001-fundacao-turno-sync.md)

## Comandos essenciais

```bash
npm run validate          # validação completa (estrutura + referências BR)
npm run validate:project  # arquivos obrigatórios do projeto
npm run validate:docs     # integridade BR-* / TMP-* / INT-*
```

Comandos de build/teste serão adicionados após definição de stack em `techContext.md`.

## Cursor — workspace e guardrails

- **Workspace:** abra a pasta `cocal-campo/` (ou devcontainer em `.devcontainer/`) para carregar `.cursor/rules/`
- **Hooks:** `.cursor/hooks.json` — validação após edição em docs; bloqueio de `git commit --no-verify`
- **Indexação:** `.cursorignore` exclui `node_modules/`, builds e `.env`

## Regras importantes

- Mudança de **comportamento de produto** → atualizar `docs/business/` no mesmo trabalho
- Não contradizer `docs/business/` — `systemPatterns.md` ainda não contém padrões técnicos vinculantes
- Manutenção de docs: `.cursor/rules/documentation-maintenance.mdc`

**Última atualização**: 2026-06-14
