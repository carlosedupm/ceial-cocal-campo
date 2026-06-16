# Operações — Cocal Campo

Runbook mínimo, code review (G2), manutenção de documentação e snippet de CI.

## Guias

| Guia | Uso |
|------|-----|
| [fluxo-usuario-brf-001.md](./fluxo-usuario-brf-001.md) | Jornada fundação: login, contexto, turno, sync |
| [fluxo-usuario-visualizacao.md](./fluxo-usuario-visualizacao.md) | Jornadas BRF-005/006/007: colheita, supervisor, simulador |

## Manutenção de documentação

Checklist detalhado: [`documentation-checklist.md`](./documentation-checklist.md)

Rule Cursor resumida: [`.cursor/rules/documentation-maintenance.mdc`](../../.cursor/rules/documentation-maintenance.mdc)

## Code review (gate G2)

Checklist ao revisar PR vinculado a `BRF-NNN`:

- [ ] Diff alinhado ao escopo do briefing (sem scope creep)
- [ ] Nenhuma regra `BR-*` criada/alterada fora do catálogo
- [ ] Testes cobrem casos listados no briefing
- [ ] `npm run validate` (ou `validate-br-refs` + `validate-project`) no CI

## CI

Estratégia **lean** (`.github/workflows/ci.yml`):

| Gatilho | O que roda |
|---------|------------|
| **Pull request** | docs + testes unitários + build (backend e frontend) |
| **Push em `main`** | acima + testes de integração backend (`-tags=integration`) |
| **Manual** (`workflow_dispatch`) | mesmo pacote completo de `main` |

E2E Playwright **não** entra no gate de PR — rodar localmente antes de releases ou piloto:

```bash
npm run test:e2e          # stack Docker + browsers Playwright
npm run test:integration  # só integração backend
npm run validate          # docs e estrutura
```

Workflow legado `.github/workflows/docs-validate.yml` também valida referências `BR-*` em PR/push (duplicata leve; pode ser consolidado depois).

## Rollback e incidentes

Documente procedimentos específicos do projeto aqui conforme a stack evoluir.

---

**Última atualização**: 2026-06-16
