# Briefing BRF-005 — Colheita: visualização do turno

> Fluxo, papéis e gates: [`docs/briefings/README.md`](./README.md). Substitui registro pelo operador (`BRF-002` superseded).

## Metadados

| Campo | Valor |
|-------|-------|
| ID | `BRF-005` |
| Data | 2026-06-16 |
| Analista | agente documentação |
| Status | implementado |
| Aprovado por (G1) | Workshop escopo visualização (2026-06-16) |
| PR vinculado (G2) | BRF-005 Colheita consulta |

## 1. Objetivo

Permitir que o **operador de colheita** **consulte** indicadores de **performance** e **qualidade** do turno aberto, originados no sistema central (MVP: materializados via simulador `BRF-007`), com cache offline e estados de disponibilidade (`BR-INTEG-003`).

## 2. Regras de negócio (fonte de verdade)

| ID | Módulo | Estado atual | O que muda |
|----|--------|--------------|------------|
| `BR-COLHEITA-001`–`003` | [colheita.md](../business/colheita.md) | planejado | visualização read-only |
| `BR-INTEG-001`–`004` | [integracao-central.md](../business/integracao-central.md) | planejado | pull + cache |
| `BR-PERFORMANCE-002` | [performance.md](../business/performance.md) | planejado | executado vs planejado na UI |
| `BR-ACESSO-001` | [acesso-perfis.md](../business/acesso-perfis.md) | implementado | menu consulta, sem registro |

**Invariantes aplicáveis:**

- `INT-001`: **revogado** para operador colheita no modelo consulta

**Perfis autorizados:**

- Operador colheita: `GET /turnos/atual/indicadores`, rota `/colheita` read-only

## 3. Escopo da implementação

### Backend

- **Endpoints**: `GET /api/v1/turnos/atual/indicadores`, `GET /api/v1/turnos/{id}/indicadores`
- **Camadas**: `internal/service/indicadores.go`, `internal/repository/indicadores.go`, handlers
- **Migration**: `003_indicadores.sql`

### Frontend

- **Páginas**: `ColheitaConsultaPage` em `/colheita`
- **Lib**: `frontend/src/lib/indicadores/` (pull + cache IndexedDB v4)

### O que NÃO mexer

- Ingestão simulador (`BRF-007`)
- Painel supervisor (`BRF-006`)
- Integração real sistema central (Fase 3)

## 4. Casos de teste exigidos

- [ ] Caminho feliz: simulador ingere → operador vê indicadores performance disponíveis
- [ ] Qualidade `em_processamento`: badge sem valor até liberar
- [ ] Offline: último snapshot consultável após sync prévia
- [ ] RBAC negado: operador não acessa `/simulador`
- [ ] Fechar turno sem registro local de indicadores (INT-001 revogado)

## 5. Perguntas em aberto

Nenhuma — escopo completo para MVP consulta.

## 6. Critérios de aceite (gate G3)

- [ ] Testes passam
- [ ] `validate-br-refs` OK
- [ ] Casos seção 4 validados
- [ ] `BR-COLHEITA-*` e `BR-INTEG-*` → implementado
- [ ] `memory-bank` atualizado

## 7. Notas adicionais

Operador não usa mais `POST /sync/push` para tipos colheita/qualidade.
