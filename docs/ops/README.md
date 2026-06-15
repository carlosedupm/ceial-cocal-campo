# Operações — Cocal Campo

Runbook mínimo, code review (G2), manutenção de documentação e snippet de CI.

## Guias

| Guia | Uso |
|------|-----|
| [fluxo-usuario-brf-001.md](./fluxo-usuario-brf-001.md) | Jornada do usuário, telas e dados da fundação |

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

Workflow em `.github/workflows/docs-validate.yml`:

```bash
npm run validate
```

## Rollback e incidentes

Documente procedimentos específicos do projeto aqui conforme a stack evoluir.

---

**Última atualização**: 2026-06-15
