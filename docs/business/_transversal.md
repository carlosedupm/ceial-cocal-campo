# Documento transversal — fluxo mestre Cocal Campo

> Jornada end-to-end do PWA de frente. Regras que cruzam todos os módulos.

## Fluxo alvo (diagrama)

```mermaid
flowchart LR
  Login[Identificacao] --> Contexto[Selecionar unidade e frente]
  Contexto --> TurnoAberto[Abrir turno]
  TurnoAberto --> Registrar[Registrar dados da area]
  Registrar --> Visualizar[Visualizar conforme perfil]
  Visualizar --> Sync{Conexao?}
  Sync -->|Nao| FilaLocal[Fila local offline]
  Sync -->|Sim| Enviar[Sincronizar pendencias]
  Enviar --> TempoReal[Atualizacoes da equipe online]
  TurnoAberto --> Fechar[Fechar turno]
  Fechar --> Sync
```

## Lacunas e backlog conhecidos

| Lacuna | Módulos afetados | Prioridade | Status |
|--------|------------------|------------|--------|
| Política de resolução de conflito quando dois registros offline do mesmo indicador/turno divergem | offline-sync, todos os módulos de registro | alta | **Resolvida** — ver `BR-SYNC-005` |
| Quem valida ocorrência de segurança (supervisor, central, ambos?) | seguranca, supervisao | alta | **Resolvida** — ver `BR-SEGURANCA-004` |
| Origem dos valores **planejados** no MVP (cadastro manual, importação, integração futura) | performance, colheita, transporte, qualidade | média | **Resolvida** — ver `BR-PERFORMANCE-003` |
| Integração futura com painel Gestão à Vista | performance, supervisao | baixa (Fase 4) | Aberta |

### Decisões do workshop (2026-06-14)

| Tópico | Decisão | Regra |
|--------|---------|-------|
| Conflito offline | Primeiro sync bem-sucedido prevalece; segundo dispositivo recebe erro de conflito e registro fica em fila com status **erro** até resolução pelo supervisor | `BR-SYNC-005` |
| Autenticação no campo | Primeiro login exige conexão; sessão offline válida por 7 dias com renovação online | `BR-ACESSO-004` |
| Registros obrigatórios no fechamento (`INT-001`) | Na fundação (`BRF-001`): lista vazia — sem indicadores de área. Obrigatoriedade entra com briefings de área (`BRF-002+`) | nota em `INT-001` abaixo |
| Validação de ocorrência de segurança | Supervisor da frente valida em até 24h; contador só zera após validação | `BR-SEGURANCA-004` |
| Metas planejadas no MVP | Cadastro manual por supervisor ou perfil administrativo da unidade | `BR-PERFORMANCE-003` |

## Regras transversais

### BR-TRANS-001 — Operação offline completa

| Campo | Valor |
|-------|-------|
| **Enunciado** | Toda operação de leitura e escrita de registros do turno deve funcionar **sem conexão com Internet**. |
| **Escopo** | PWA Cocal Campo; todos os módulos de registro e consulta. |
| **Perfis** | Todos. |
| **Efeito** | Bloqueio de dependência de rede para operações locais; UI nunca impede registro por falta de conexão. |
| **Implementação** | `frontend/src/lib/db/schema.ts`, `frontend/src/lib/sync/engine.ts`, `frontend/src/features/turno/ContextoPage.tsx` (turno offline) |
| **Estado** | implementado |

---

### BR-TRANS-002 — Sincronização automática

| Campo | Valor |
|-------|-------|
| **Enunciado** | Quando houver conexão, pendências locais **sincronizam automaticamente** com o servidor, sem ação manual obrigatória do usuário. |
| **Escopo** | Fila de registros pendentes; retorno de conectividade. |
| **Perfis** | Todos. |
| **Efeito** | Sync em background; usuário informado do progresso (ver `BR-SYNC-003`). |
| **Implementação** | `frontend/src/lib/sync/engine.ts` — ver [offline-sync.md](./offline-sync.md) |
| **Estado** | implementado |

---

### BR-TRANS-003 — Vínculo obrigatório a turno, frente e unidade

| Campo | Valor |
|-------|-------|
| **Enunciado** | Todo registro operacional vincula-se a **turno aberto**, **frente de trabalho**, **unidade** e **área** do profissional. |
| **Escopo** | Criação de qualquer registro de indicador ou ocorrência. |
| **Perfis** | Todos (exceto consultas de leitura histórica conforme `BR-ACESSO-*`). |
| **Efeito** | Bloqueio se turno não estiver aberto (`TMP-002`). |
| **Implementação** | `frontend/src/features/turno/ContextoPage.tsx`, `backend/internal/service/services.go` — ver [turnos.md](./turnos.md) |
| **Estado** | implementado |

---

### BR-TRANS-004 — Imutabilidade pós-sync

| Campo | Valor |
|-------|-------|
| **Enunciado** | Registro preserva **autoria**, **timestamp de criação** e **identificação do dispositivo**; após sync bem-sucedido torna-se **imutável** para operadores (alteração apenas por perfis autorizados com trilha de auditoria). |
| **Escopo** | Todos os registros sincronizados. |
| **Perfis** | Operadores: somente leitura pós-sync; supervisor conforme `BR-SUPERVISAO-*`. |
| **Efeito** | Bloqueio de edição direta pós-sync para operadores. |
| **Implementação** | `backend/migrations/001_init.sql` (`synced_at`, sem UPDATE para operadores na fundação), status local `sincronizado` |
| **Estado** | implementado |

---

### BR-TRANS-005 — Semântica executado vs planejado

| Campo | Valor |
|-------|-------|
| **Enunciado** | Quando meta planejada estiver disponível, a comparação com o executado usa semântica de negócio **dentro da meta** ou **fora da meta** (referência operacional Gestão à Vista). |
| **Escopo** | Indicadores de performance e qualidade com meta cadastrada. |
| **Perfis** | Todos com permissão de visualização do indicador. |
| **Efeito** | Informativo na UI; não bloqueia registro fora da meta. |
| **Implementação** | _(planejado)_ — ver [performance.md](./performance.md) |
| **Estado** | planejado |

## Validações temporais (`TMP-*`)

| ID | Enunciado |
|----|-----------|
| `TMP-001` | Evento operacional não pode ter data/hora **futura** em relação ao relógio do dispositivo no momento do registro |
| `TMP-002` | Registro só é válido dentro de **turno aberto** do usuário, exceto supervisor com permissão explícita (`BR-SUPERVISAO-003`) |

## Integridade (`INT-*`)

| ID | Enunciado |
|----|-----------|
| `INT-001` | Fechamento de turno exige que todos os registros **obrigatórios da área** estejam presentes ou **justificados** pelo supervisor. **Fundação (`BRF-001`):** sem registros obrigatórios por área — aplicável após briefings de módulo (`BRF-002+`) |
| `INT-002` | Contador de dias sem acidentes só muda por **ocorrência registrada e validada** — nunca por edição manual livre do contador |

---

**Última atualização**: 2026-06-14
