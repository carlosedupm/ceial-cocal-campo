# Checklist de manutenção de documentação

Guia operacional detalhado. A rule Cursor [`documentation-maintenance.mdc`](../../.cursor/rules/documentation-maintenance.mdc) resume o essencial e aponta para este arquivo.

## Princípio

**Documentação desatualizada é pior que documentação ausente.** Mantenha memory-bank, catálogo `BR-*` e briefings sincronizados com o estado real do projeto.

## Quando atualizar cada arquivo

### `memory-bank/activeContext.md`

**Atualize quando:** concluir funcionalidade, iniciar trabalho novo, identificar risco, tomar decisão técnica, mudar foco ou resolver problema conhecido.

**O que atualizar:** «O que está funcionando», «Em andamento», «Próximos passos imediatos», «Problemas Conhecidos», «Decisões Técnicas Ativas», «Foco Atual».

**Exemplo:**

```markdown
### ✅ Concluído desde a última atualização:
1. ✅ **Nova Funcionalidade X**: Descrição do que foi implementado

### 🚧 Em andamento:
- **Funcionalidade Z**: Status atual
```

### `memory-bank/progress.md`

**Atualize quando:** completar tarefas/sprints, atingir marcos, mudar percentuais ou backlog.

**O que atualizar:** «Status Geral», «O que foi concluído», «Em andamento», «Próximos Passos», «Histórico de Progresso», métricas.

### `memory-bank/techContext.md`

**Atualize quando:** adicionar dependências (`package.json`, `go.mod`, etc.), mudar versões da stack, alterar env/deploy/CORS, documentar novas ferramentas.

### `memory-bank/systemPatterns.md`

**Atualize quando:** estabelecer padrões arquiteturais, de código, API, segurança ou testes.

### `memory-bank/deploy-notes.md`

**Atualize quando:** mudar deploy, variáveis de ambiente, migrações de banco ou procedimentos operacionais.

### `memory-bank/projectbrief.md` e `productContext.md`

**Atualize quando:** mudar objetivos, fases, público-alvo, métricas de sucesso ou roadmap.

**Nota:** não duplique regras de domínio em parágrafos longos — resumo + link para `docs/business/<modulo>.md`.

### `docs/business/` (catálogo)

**Atualize obrigatoriamente quando:**

- Implementar ou alterar comportamento de produto (API, validações, fluxos de UI)
- Mudar permissões por perfil no domínio
- Alterar regras com contrapartida em banco (cite migration ou constraint)

**Modelo mínimo por regra:**

| Campo | Conteúdo |
|-------|----------|
| ID | `BR-<DOMINIO>-NNN` (estável; novo ID para regra nova) |
| Enunciado | O que o sistema garante |
| Escopo | Tenant, período, entidades |
| Perfis | Quem pode executar |
| Efeito | Bloqueio servidor vs alerta/UI |
| Implementação | Caminhos no repositório |
| Estado | implementado \| parcial \| planejado |

Mantenha [`README.md`](../business/README.md) como índice.

## Processo

1. **Antes:** leia o arquivo relevante do memory-bank
2. **Durante:** anote mudanças que afetam documentação
3. **Após:** atualize arquivos afetados com data `**Última atualização**: YYYY-MM-DD`
4. **Periodicamente:** revise semanalmente métricas e percentuais

## Checklist pós-mudança

- [ ] `activeContext.md` reflete o novo estado?
- [ ] `progress.md` atualizado?
- [ ] `techContext.md` se houve mudança de stack?
- [ ] `systemPatterns.md` se houve novo padrão?
- [ ] `deploy-notes.md` se houve mudança de deploy?
- [ ] `docs/business/` se houve mudança de comportamento de produto?
- [ ] Data «Última atualização» em todos os arquivos tocados?

## Referências

- [`AGENTS.md`](../../AGENTS.md)
- [`docs/business/README.md`](../business/README.md)
- [`docs/ops/README.md`](./README.md)

**Última atualização**: 2026-06-14
