# Cocal Campo

PWA offline-first para operações de cana no campo (colheita, transporte, qualidade, segurança, supervisão). Este repositório segue **documentação viva**: requisitos em `docs/business/`, entregas via briefings `BRF-*`, estado em `memory-bank/`.

**Fase atual:** negócio e processo definidos; **stack em proposta** ([ADR-001](docs/architecture/ADR-001-stack.md)) — sem código de aplicação até ratificação.

## Estrutura

| Path | Conteúdo |
|------|----------|
| [`docs/business/`](docs/business/) | Catálogo de regras `BR-*` (fonte de verdade) |
| [`docs/briefings/`](docs/briefings/) | Ordens de serviço `BRF-*` (gates G1–G3) |
| [`docs/architecture/`](docs/architecture/) | ADRs — stack e decisões técnicas |
| [`docs/tests/`](docs/tests/) | Checklists manuais de regressão |
| [`memory-bank/`](memory-bank/) | Estado vivo do projeto |
| [`AGENTS.md`](AGENTS.md) | Instruções para agentes de IA |
| [`project.config.json`](project.config.json) | Config do produto (scan de código, IDs) |

## Fluxo de trabalho

```
BR-* planejado → BRF-NNN aprovado (G1) → implementação (G2) → aceite (G3)
```

1. Regra nova em `docs/business/` com estado `planejado`
2. Briefing referencia IDs — não copia regras
3. Implementação só com briefing `aprovado` e **ADR aceito**
4. G3: `BR-*` → `implementado` com ponteiros ao código, memory-bank atualizado, CI verde

**Fundação:** [`BRF-001`](docs/briefings/BRF-001-fundacao-turno-sync.md) (G1 aprovado; aguarda ADR + G2).

## Dev Container (Cursor / VS Code)

Abra a **raiz do repositório** como workspace para que as **Cursor Rules** em `.cursor/rules/` e o `AGENTS.md` sejam carregados corretamente.

1. Clone o repositório: `git clone git@github.com:carlosedupm/ceial-cocal-campo.git`
2. Abra a pasta clonada (`ceial-cocal-campo/`) no Cursor
3. **Command Palette** → *Dev Containers: Reopen in Container*
4. O container usa Node 20 e roda `npm run validate` na criação

Configuração em [`.devcontainer/`](.devcontainer/).

## Comandos

```bash
npm run validate          # estrutura do projeto + referências BR
npm run validate:project  # arquivos obrigatórios
npm run validate:docs     # integridade BR-* / TMP-* / INT-*
```

## Próximos passos (equipe)

1. Revisar e aceitar ou alterar [ADR-001](docs/architecture/ADR-001-stack.md)
2. Preencher `memory-bank/techContext.md` e `systemPatterns.md`
3. Gate G2 do `BRF-001` — scaffold e implementação

**Última atualização**: 2026-06-14
