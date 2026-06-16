# Módulo — Transporte

> Registros operacionais de transporte e transbordo de cana.

## Implementação principal

| Camada | Caminho |
|--------|---------|
| Backend | `backend/internal/service/transporte.go`, `backend/internal/service/services.go` |
| Frontend | `frontend/src/features/transporte/TransportePage.tsx`, `frontend/src/lib/transporte/validation.ts` |

---

## BR-TRANSPORTE-001 — Consumo transbordo

| Campo | Valor |
|-------|-------|
| **Enunciado** | Operador de transporte registra **consumo transbordo** (L/t) do turno. |
| **Escopo** | Turno aberto; área Transporte. MVP BRF-003: **por turno** (1 registro). |
| **Perfis** | Operador transporte. |
| **Efeito** | Bloqueio se valor fora de faixa física (MVP: 1–30 L/t). Obrigatório no fechamento (`INT-001`, BRF-003). Comparação com meta via `BR-TRANS-005` — fora do BRF-003. |
| **Implementação** | Tipo `consumo_transbordo`; payload `{ consumo_lt }`; validação em `transporte.go` e `validation.ts` |
| **Estado** | implementado |

---

## BR-TRANSPORTE-002 — Cargas e viagens do turno

| Campo | Valor |
|-------|-------|
| **Enunciado** | Operador registra **cargas/viagens** associadas ao turno de transporte — uma por viagem com toneladas e frentes opcionais. |
| **Escopo** | Turno aberto; MVP BRF-003: **por viagem** (`viagem_numero`). Contribui para entrada de cana e densidade agregadas. |
| **Perfis** | Operador transporte. |
| **Efeito** | Bloqueio se `viagem_numero` ou `toneladas` inválidos (MVP: toneladas >0 e ≤5000). Opcional no fechamento (`INT-001`). Timestamp via `evento_at` (`BR-TRANS-003`). |
| **Implementação** | Tipo `cargas_viagens`; payload `{ viagem_numero, toneladas, frente_origem?, frente_destino? }`; idempotência `turnoId:cargas_viagens:{viagem_numero}` |
| **Estado** | implementado |

---

**Última atualização**: 2026-06-15
