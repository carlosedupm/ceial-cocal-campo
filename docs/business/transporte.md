# Módulo — Transporte

> Registros operacionais de transporte e transbordo de cana.

## Implementação principal

| Camada | Caminho |
|--------|---------|
| Backend | _(planejado)_ |
| Frontend | _(planejado)_ |

---

## BR-TRANSPORTE-001 — Consumo transbordo

| Campo | Valor |
|-------|-------|
| **Enunciado** | Operador de transporte registra **consumo transbordo** (L/t) do turno ou por viagem. |
| **Escopo** | Turno aberto; área Transporte. |
| **Perfis** | Operador transporte. |
| **Efeito** | Bloqueio se valor negativo; comparação com meta via `BR-TRANS-005`. |
| **Implementação** | _(planejado)_ |
| **Estado** | planejado |

---

## BR-TRANSPORTE-002 — Cargas e viagens do turno

| Campo | Valor |
|-------|-------|
| **Enunciado** | Operador registra **cargas/viagens** associadas ao turno de transporte (quantidade, toneladas ou viagens conforme prática da frente). |
| **Escopo** | Turno aberto; contribui para entrada de cana e densidade agregadas. |
| **Perfis** | Operador transporte. |
| **Efeito** | Bloqueio sem identificação mínima de carga (timestamp, frente). |
| **Implementação** | _(planejado)_ |
| **Estado** | planejado |

---

**Última atualização**: 2026-06-14
