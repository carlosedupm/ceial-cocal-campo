# Briefing BRF-004 — Qualidade: avaliações de campo

> Fluxo, papéis e gates: [`docs/briefings/README.md`](./README.md). Terceiro módulo de área da Fase 2, após fundação `BRF-001`, colheita `BRF-002` e transporte `BRF-003`.

## Metadados

| Campo | Valor |
|-------|-------|
| ID | `BRF-004` |
| Data | 2026-06-16 |
| Analista | agente documentação |
| Status | arquivado |
| Aprovado por (G1) | PO — 2026-06-16 |
| PR vinculado (G2) | BRF-004 Qualidade |

## 1. Objetivo

Permitir que o **técnico de qualidade** registre no turno aberto as avaliações de campo — **impurezas mineral e vegetal** (kg/ton) e **perdas, pisoteio, abalo e arranquio** (%) — vinculadas a **talhão** e **frente** (via turno), com operação **offline-first**, sync automática e validações de domínio. Ativar a lista de registros obrigatórios por área no fechamento do turno (`INT-001`) para a área qualidade.

## 2. Regras de negócio (fonte de verdade)

| ID | Módulo | Estado atual | O que muda |
|----|--------|--------------|------------|
| `BR-QUALIDADE-001` | [qualidade.md](../business/qualidade.md) | planejado | formulário impurezas mineral/vegetal |
| `BR-QUALIDADE-002` | [qualidade.md](../business/qualidade.md) | planejado | formulário perdas, pisoteio, abalo e arranquio |
| `BR-QUALIDADE-003` | [qualidade.md](../business/qualidade.md) | planejado | `talhao_codigo` obrigatório em todo registro de qualidade |
| `BR-ACESSO-003` | [acesso-perfis.md](../business/acesso-perfis.md) | planejado | **parcial** — técnico com múltiplas frentes na unidade; seleção na abertura do turno (fluxo existente) |
| `BR-TRANS-001` | [_transversal.md](../business/_transversal.md) | implementado | registros qualidade offline |
| `BR-TRANS-003` | [_transversal.md](../business/_transversal.md) | implementado | vínculo turno/frente/unidade |
| `BR-TRANS-004` | [_transversal.md](../business/_transversal.md) | implementado | imutabilidade pós-sync |
| `BR-ACESSO-001` | [acesso-perfis.md](../business/acesso-perfis.md) | implementado | rotas qualidade só para área qualidade |
| `BR-SYNC-001`–`005` | [offline-sync.md](../business/offline-sync.md) | implementado | fila e sync dos novos tipos |

**Invariantes aplicáveis:**

- `TMP-001`: valores e `evento_at` não futuros; percentuais e kg/ton não negativos
- `TMP-002`: registro exige turno aberto do usuário
- `INT-001`: **pelo menos um** registro de qualidade (`impurezas` **ou** `perdas_campo`) obrigatório para fechar turno na área qualidade; ambos opcionais individualmente, mas o turno não fecha sem nenhum dos dois

**Perfis autorizados:**

- `tecnico_qualidade` / área `qualidade`: todos os formulários deste briefing
- Supervisor: **fora deste briefing** — ver briefing de supervisão (Fase 3)

## 3. Escopo da implementação

### Backend

- **Endpoints**: validação nos tipos `impurezas`, `perdas_campo` em `POST /api/v1/sync/push`; bloqueio `INT-001` em `POST /api/v1/turnos/{id}/fechar` (lógica «pelo menos um tipo»)
- **Camadas tocadas**: `internal/service/qualidade.go` (novo), `services.go` (integração validação + INT-001), `repository/registro.go` (`HasAnyTipoForTurno` ou equivalente)
- **Migration/constraint**: nenhuma no modelo `registros` — payload JSON genérico; **seed** com usuário `tecnico_qualidade` e frentes adicionais para E2E
- **Códigos de erro**: `ERR-QUALIDADE-001` (payload inválido / faixa / talhão ausente), `ERR-INT-001` (fechamento sem registro de qualidade), `ERR-ACESSO-001` (perfil errado)

### Frontend

- **Páginas/rotas**: `/qualidade` — formulários dos 2 tipos de avaliação; lista de registros do turno por talhão
- **Componentes**: `QualidadePage` (novo), `validation.ts` (novo); remoção do placeholder na home
- **Roteamento**: adicionar rota `/qualidade` em `App.tsx`
- **Atalhos (home)**: em `AREA_ATALHOS.qualidade` (`HomePage.tsx`), definir `to: "/qualidade"` no item do card **Atalhos** (hoje hint sem rota)
- **Shell UI**: `QualidadePage` usa `PageHeader` + `PageFooter` conforme padrão em `systemPatterns.md`
- **INT-001 local**: mensagem de fechamento na home espelhando colheita/transporte («registre ao menos uma avaliação de qualidade»)

### O que NÃO mexer

- Colheita, Transporte, Segurança, Performance (agregação)
- Cadastro de metas (`BR-PERFORMANCE-003`) e comparação executado vs planejado (`BR-PERFORMANCE-002`, `BR-TRANS-005`)
- Tabela/catálogo mestre de talhões (MVP usa código textual no payload)
- Múltiplas amostras do mesmo talhão no mesmo turno (1 registro por talhão por tipo)
- Troca de frente **durante** turno aberto (fora do escopo; `BR-ACESSO-003` completo em briefing futuro se necessário)
- Painel supervisor (`BR-SUPERVISAO-*`)
- Gestão à Vista
- Validação de ocorrência de segurança (`BR-SEGURANCA-004`)

## 4. Casos de teste exigidos

- [x] **Caminho feliz online**: técnico qualidade registra impurezas em talhão → sync → imutável (`BR-TRANS-004`)
- [x] **Perdas no mesmo turno**: segundo registro `perdas_campo` em outro talhão → sync OK
- [x] **Offline**: registros na fila → reconexão → sync automático (`BR-TRANS-001`, `BR-SYNC-002`)
- [x] **Sem turno / turno fechado**: bloqueio ao registrar (`TMP-002`, `BR-TURNO-003`)
- [x] **Talhão ausente**: payload sem `talhao_codigo` rejeitado (`BR-QUALIDADE-003`, `ERR-QUALIDADE-001`)
- [x] **Valor inválido**: impureza fora da faixa MVP ou percentual fora de 0–100 rejeitado (`ERR-QUALIDADE-001`)
- [x] **Timestamp futuro**: rejeitado (`TMP-001`)
- [x] **RBAC**: perfil colheita não acessa `/qualidade` (`BR-ACESSO-001`)
- [x] **INT-001**: fechar turno qualidade sem `impurezas` nem `perdas_campo` bloqueado (`ERR-INT-001`)
- [x] **INT-001 feliz**: com apenas `impurezas` **ou** apenas `perdas_campo`, fechamento permitido
- [x] **Idempotência**: segundo envio do mesmo talhão/tipo no turno atualiza ou conflita conforme chave existente (`BR-SYNC-005`)
- [x] **BR-ACESSO-003 parcial**: usuário com 2+ frentes na unidade escolhe frente na abertura do turno e registra qualidade vinculada à frente do turno

## 5. Perguntas em aberto (obrigatório)

| # | Pergunta | Resposta (G1) |
|---|----------|---------------|
| 1 | Quais indicadores são obrigatórios no fechamento (`INT-001`) na área qualidade? | **Pelo menos um** registro entre `impurezas` e `perdas_campo` no turno |
| 2 | Como identificar talhão no MVP (`BR-QUALIDADE-003`)? | Campo texto **`talhao_codigo`** (1–20 caracteres alfanuméricos); frente via turno |
| 3 | Granularidade: quantos registros por talhão/turno? | **Um por talhão por tipo** |
| 4 | Faixas físicas configuráveis pela unidade no MVP? | **Validação fixa** — impurezas 0–50 kg/ton; percentuais 0–100% |
| 5 | BRF-004 inclui metas e comparação? | **Não** |
| 6 | BRF-004 implementa `BR-ACESSO-003` por completo? | **Parcial** — múltiplas frentes na abertura do turno |
| 7 | Supervisor registra/valida qualidade neste briefing? | **Não** — Fase 3 |

## 6. Critérios de aceite (gate G3)

- [x] Testes da stack passam (comandos em `techContext.md`)
- [x] `node scripts/validate-br-refs.mjs` OK
- [x] Casos de teste da seção 4 existem e passam
- [x] Comportamento validado manualmente em cenário offline → online (G3 — 2026-06-16)
- [x] `BR-QUALIDADE-001`–`003` → `implementado`; `BR-ACESSO-003` → `parcial` com ponteiros ao código
- [x] `memory-bank/activeContext.md` atualizado
- [x] Status deste briefing → `implementado`

## 7. Notas adicionais

### Tipos de registro e payloads

| Tipo (`tipo`) | Payload JSON | Idempotência |
|---------------|--------------|--------------|
| `impurezas` | `{ talhao_codigo: string, impureza_mineral_kg_ton: number, impureza_vegetal_kg_ton: number }` | `turnoId:impurezas:{talhao_codigo}` |
| `perdas_campo` | `{ talhao_codigo: string, perdas_pct: number, pisoteio_pct: number, abalo_arranquio_pct: number }` | `turnoId:perdas_campo:{talhao_codigo}` |

### Validações MVP (fixas no código)

- **`talhao_codigo`**: obrigatório, trim, 1–20 caracteres, regex `^[A-Za-z0-9_-]+$`
- **Impurezas**: 0.0–50.0 kg/ton cada; pelo menos um > 0
- **Perdas**: 0.0–100.0% cada; pelo menos um > 0

### INT-001 — lógica «pelo menos um»

- Backend: `TiposQualidadeFechamento` + `HasAnyTipoForTurno`
- Frontend: `OBRIGATORIOS_QUALIDADE` + `turnoTemAlgumRegistro` na home

### Frontend — navegação

- Home: card **Atalhos** (`AREA_ATALHOS.qualidade`); consulta em `/qualidade` com shell `PageHeader` / `PageFooter`
- Ver padrão completo em [`memory-bank/systemPatterns.md`](../../memory-bank/systemPatterns.md) (seção Shell de UI)

### Seed / E2E

- `002_seed.sql`: `qualidade@cocal.dev` / `campo123`, frentes Colheita 01 + Qualidade 01
- `frontend/e2e/qualidade.spec.ts`
