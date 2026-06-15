# 🚀 Active Context — Cocal Campo

> Estado vivo do projeto. Atualize a cada entrega significativa ou mudança de foco.

## 📋 Estado Atual do Projeto

### **Status Geral**

**Fase 0 — Documentação de negócio e processo.** Stack e arquitetura **a definir** (ADR-001 em **proposta**). **Sem código de aplicação** — scaffold prematuro removido. MVP = PWA de campo; Gestão à Vista fora do escopo inicial.

### ✅ Concluído desde a última atualização:

1. ✅ Lacunas de negócio documentadas (`_transversal.md`, `BR-SYNC-005`, `BR-ACESSO-004`, etc.)
2. ✅ `BRF-001` com perguntas respondidas e gate G1 (revisar validação humana)
3. ✅ Checklists em `docs/tests/` para fundação
4. ✅ ADR-001 como **proposta** (não aceita)
5. ✅ Remoção de `backend/` e `frontend/` criados sem ratificação de arquitetura
6. ✅ Repositório Git standalone preparado (`ceial-cocal-campo`, validação CI docs)

### ✅ O que está funcionando:

- Infraestrutura de documentação viva (memory-bank, `BR-*`, briefings, validação CI)
- Vocabulário de domínio em `domain-patterns.mdc`

### 🚧 Em andamento:

- Ratificação humana do ADR-001 (stack e arquitetura)
- Validação humana das decisões de negócio do workshop documentado

### 📋 Próximos passos imediatos:

1. **Revisar ADR-001** — aceitar, alterar ou substituir proposta de stack
2. Após ADR aceito: preencher `techContext.md` / `systemPatterns.md`
3. Gate G2 do `BRF-001` — scaffold e implementação da fundação
4. Briefing `BRF-002` Colheita (rascunho)

### 🔧 Decisões Técnicas Ativas

| Decisão | Status | Notas |
|---------|--------|-------|
| Stack (frontend, backend, banco, sync) | **proposta (ADR-001)** | Aguardando aceite humano |
| Gestão à Vista no ecossistema | adiado | Fase 4 — fora do MVP |
| Política de conflito offline | documentada | `BR-SYNC-005` — validar com operação |

### ⚠️ Problemas Conhecidos

- Decisões de workshop documentadas pelo processo de análise — **confirmar** com PO/operação/TI

### 🎯 Foco Atual

Fechar arquitetura (ADR aceito) antes de qualquer novo código.

**Última atualização**: 2026-06-14
