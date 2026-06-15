# Briefing BRF-NNN — [Título curto do requisito]

> Fluxo, papéis e gates: [`docs/briefings/README.md`](./README.md). O briefing é uma **ordem de serviço**: referencia regras por ID, não as copia.

## Metadados

| Campo | Valor |
|-------|-------|
| ID | `BRF-NNN` |
| Data | AAAA-MM-DD |
| Analista | [agente/humano que produziu a análise] |
| Status | rascunho |
| Aprovado por (G1) | — |
| PR vinculado (G2) | — |

## 1. Objetivo

[1 parágrafo: o que o usuário quer fazer, em linguagem de domínio do projeto.]

## 2. Regras de negócio (fonte de verdade)

Regras em `docs/business/` que este trabalho implementa ou altera.

| ID | Módulo | Estado atual | O que muda |
|----|--------|--------------|------------|
| `BR-XXX-NNN` | [`<modulo>.md`](../business/) | planejado | [criação/alteração] |

**Invariantes aplicáveis** (citar apenas IDs):

- `TMP-001`: [justificativa em 1 linha]
- `INT-001`: [justificativa em 1 linha]

**Perfis autorizados**:

- [perfis e restrições, citando `BR-ACESSO-*` quando existir]

## 3. Escopo da implementação

### Backend

- **Endpoints**: [método + rota + auth]
- **Camadas tocadas**: [caminhos]
- **Migration/constraint**: [nº ou "nenhuma"]
- **Códigos de erro**: [códigos esperados]

### Frontend

- **Páginas/rotas**: [caminhos]
- **Componentes**: [existentes / novos]

### O que NÃO mexer

- [escopo explicitamente excluído]

## 4. Casos de teste exigidos

- [ ] Caminho feliz: [descrever]
- [ ] Bordas temporais (`TMP-*`): [descrever]
- [ ] RBAC negado: [descrever]

## 5. Perguntas em aberto (obrigatório)

> Dúvida não respondida **bloqueia** o gate G1. Se não houver dúvidas: «Nenhuma — escopo completo».

| # | Pergunta | Resposta (desenvolvedor) |
|---|----------|--------------------------|
| 1 | | |

## 6. Critérios de aceite (gate G3)

- [ ] Testes da stack passam (adaptar comandos em `techContext.md`)
- [ ] `node scripts/validate-br-refs.mjs` OK
- [ ] Casos de teste da seção 4 existem e passam
- [ ] Comportamento validado manualmente
- [ ] `BR-*` da seção 2 → `implementado` com ponteiros ao código
- [ ] `memory-bank/activeContext.md` atualizado
- [ ] Status deste briefing → `implementado`

## 7. Notas adicionais

[Contexto extra, edge cases conhecidos.]
