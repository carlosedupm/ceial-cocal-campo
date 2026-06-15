# Cocal Campo — Instruções para Agentes

Instruções **portáveis** para agentes de IA (Cursor, CLI, etc.). Regras Cursor-specific ficam em [`.cursor/rules/`](.cursor/rules/).

## Visão Geral

**Cocal Campo** — PWA offline-first para frentes de trabalho no campo (colheita de cana Cocal). Stack: **Go + React PWA + PostgreSQL** (ADR-001 aceito). Dev via **Dev Container + Docker Compose**.

Requisitos versionados em `docs/business/` (IDs `BR-*`). Estado vivo em `memory-bank/`.

## Modo atual: fundação implementada (BRF-001)

1. **Stack definida** — ver `techContext.md`, `systemPatterns.md`, ADR-001/002.
2. **Fonte de verdade** = `docs/business/`; implementação via briefing `Status: aprovado` (G1) → G2/G3.
3. **Ambiente de dev** = Dev Container + `docker compose up -d` — **não** depender de Go/Node/Postgres instalados no host.
4. **Requisitos não-funcionais como negócio**: offline-first, PWA instalável, sync automática e multi-área estão em `BR-TRANS-*` e `BR-SYNC-*` — implementação em `backend/` + `frontend/` conforme ADR-001 aceito.
5. **Gestão à Vista** (dashboard de gestão) está **fora do escopo** até Fase 4 — não implementar nem especificar integração sem novo briefing.
6. **Dúvidas de domínio** → seção «Perguntas em aberto» do briefing; nunca assumir política de conflito offline, validação de segurança ou origem de metas planejadas (ver lacunas em `_transversal.md`).
7. **Proibido** criar ou alterar regras `BR-*` durante implementação — devolver ao analista funcional / gate G1.

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
- **Fluxo do usuário (BRF-001)**: [`docs/ops/fluxo-usuario-brf-001.md`](docs/ops/fluxo-usuario-brf-001.md)

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

**Última atualização**: 2026-06-15
