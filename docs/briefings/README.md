# Fluxo de Briefings — Análise Funcional → Implementação

Fluxo **agnóstico de ferramenta e de agente**: os papéis abaixo podem ser exercidos por qualquer agente de IA ou por um humano.

## Princípio

**A fonte de verdade das regras de negócio é `docs/business/`** (IDs `BR-*`). O briefing é uma **ordem de serviço fina e descartável**: referencia regras por ID, nunca as copia.

## Papéis

| Papel | Responsabilidade |
|-------|------------------|
| **Analista Funcional** | Criar `BR-*` `planejado` em `docs/business/` + briefing `BRF-NNN` |
| **Desenvolvedor (humano)** | Aprovar nos gates G1–G3; único que muda `Status` do briefing |
| **Implementador** | Executar briefing aprovado, sem criar/alterar regra de negócio |

### Regras do Analista Funcional

1. Consultar `docs/business/README.md` e módulo afetado antes de escrever.
2. Citar fonte em toda afirmação (`BR-*`, `TMP-*`, `INT-*` ou caminho de arquivo).
3. Regra nova nasce no catálogo com estado `planejado` **no mesmo trabalho** que o briefing.
4. Dúvidas vão para «Perguntas em aberto» — nunca assumir resposta.

### Regras do Implementador

1. Só implementar briefing com `Status: aprovado`.
2. Recusar briefing com perguntas em aberto sem resposta.
3. Proibido criar/alterar regra de negócio — devolver ao G1 se houver lacuna.
4. Ao concluir: `BR-*` → `implementado`, memory-bank, briefing → `implementado`.

## Ciclo de vida e gates

```
Análise ──► G1: aprovado ──► Implementação ──► G2: PR ──► G3: aceite ──► arquivado
```

| Gate | O que aprovar |
|------|---------------|
| **G1** | `BR-*` planejadas + briefing completo + perguntas respondidas |
| **G2** | PR pequeno vinculado a 1 `BRF-NNN` |
| **G3** | Comportamento validado + docs sincronizadas + CI verde |

**Status possíveis**: `rascunho` → `aprovado` → `implementado` → `arquivado`.

## Convenções de arquivo

- **Local**: `docs/briefings/BRF-NNN-titulo-curto.md`
- **Template**: [`briefing-template.md`](./briefing-template.md)
- **Exemplo**: use [`briefing-template.md`](./briefing-template.md) como referência; briefings reais seguem `BRF-NNN`

## Verificação automatizada

```bash
node scripts/validate-br-refs.mjs
```

Falha se código ou briefing referenciar ID inexistente no catálogo, ou briefing sem metadados mínimos.

---

**Última atualização**: 2026-06-14
