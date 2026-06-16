# Módulo — Qualidade

> Avaliação de impurezas e perdas no campo.

## Implementação principal

| Camada | Caminho |
|--------|---------|
| Backend | `backend/internal/service/qualidade.go`, `backend/internal/service/services.go` |
| Frontend | `frontend/src/features/qualidade/QualidadePage.tsx`, `frontend/src/lib/qualidade/validation.ts` |

---

## BR-QUALIDADE-001 — Impurezas mineral e vegetal

| Campo | Valor |
|-------|-------|
| **Enunciado** | Técnico registra **impureza mineral** e **impureza vegetal** (kg/ton) por amostra ou consolidado do turno. |
| **Escopo** | Avaliação de qualidade da cana; horizonte diário e safra. |
| **Perfis** | Técnico qualidade. |
| **Efeito** | Bloqueio se amostra sem talhão/frente (`BR-QUALIDADE-003`); comparação com meta via `BR-TRANS-005` — fora do BRF-004. |
| **Implementação** | Tipo `impurezas`; payload `{ talhao_codigo, impureza_mineral_kg_ton, impureza_vegetal_kg_ton }`; validação em `qualidade.go` e `validation.ts` |
| **Estado** | implementado |

---

## BR-QUALIDADE-002 — Perdas, pisoteio, abalo e arranquio

| Campo | Valor |
|-------|-------|
| **Enunciado** | Técnico registra **perdas**, **pisoteio** e **abalo e arranquio** (%) por avaliação de campo. |
| **Escopo** | Turno ou visita técnica; talhão/frente identificados. |
| **Perfis** | Técnico qualidade. |
| **Efeito** | Bloqueio se percentual fora de 0–100%; meta comparada via `BR-TRANS-005` — fora do BRF-004. |
| **Implementação** | Tipo `perdas_campo`; payload `{ talhao_codigo, perdas_pct, pisoteio_pct, abalo_arranquio_pct }` |
| **Estado** | implementado |

---

## BR-QUALIDADE-003 — Identificação de talhão/frente

| Campo | Valor |
|-------|-------|
| **Enunciado** | Todo registro de qualidade exige identificação de **talhão** e/ou **frente avaliada**. |
| **Escopo** | Criação de registro nos módulos `BR-QUALIDADE-001` e `BR-QUALIDADE-002`. |
| **Perfis** | Técnico qualidade. |
| **Efeito** | Bloqueio sem localização mínima. |
| **Implementação** | `talhao_codigo` obrigatório no payload; frente via turno (`BR-TRANS-003`) |
| **Estado** | implementado |

---

**Última atualização**: 2026-06-16
