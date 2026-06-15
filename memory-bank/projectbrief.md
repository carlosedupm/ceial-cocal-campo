# 📋 Project Brief — Cocal Campo

> Charter do projeto: PWA offline-first para frentes de trabalho no campo.

## 🎯 Objetivo Principal

Profissionais da Cocal nas frentes de trabalho (colheita, transporte, qualidade, segurança e supervisão) precisam registrar informações operacionais do turno de trabalho em locais onde **frequentemente não há sinal de Internet**. O **Cocal Campo** é um PWA instalável no dispositivo móvel que permite registrar, consultar e sincronizar dados do turno **offline**, com **sincronização automática** quando a conexão retornar, adaptando formulários e visualizações à **área de atuação** de cada profissional.

O painel **Gestão à Vista** (dashboard de gestão) fica **fora do escopo do MVP**; este produto foca exclusivamente na operação de campo.

## 🧭 Norte do produto

| Princípio | Significado |
|-----------|-------------|
| **Offline-first** | Toda leitura e escrita de registros funciona sem Internet |
| **Sync automática** | Pendências sobem ao servidor quando houver conexão, sem ação manual obrigatória |
| **Multi-área** | Formulários e telas conforme perfil e área (Colheita, Transporte, Qualidade, Segurança, Performance, Supervisão) |
| **Turno como unidade** | Registros organizados por turno de trabalho vinculado a frente e unidade |
| **Tempo real online** | Quando conectado, equipe da mesma frente vê atualizações sem recarregar manualmente |
| **Sincronização tripla** | Código, comportamento em produção e **`docs/business/`** (requisitos `BR-*`) evoluem **no mesmo ciclo de entrega** |

**Referência de requisitos transversais:** [docs/business/_transversal.md](../docs/business/_transversal.md).

## 🎯 Objetivos Específicos

### Fase atual (Fase 0)

- Catálogo de negócio completo com regras `BR-*` em estado `planejado`
- Vocabulário de domínio em `domain-patterns.mdc`
- Briefing de fundação `BRF-001` pronto para gate G1

### Roadmap (fases)

| Fase | Foco | Estado |
|------|------|--------|
| Fase 0 | Catálogo de negócio + vocabulário | em andamento |
| Fase 1 | Turno + sync + acesso + Colheita (primeiro briefing implementável) | planejado |
| Fase 2 | Transporte, Qualidade, Segurança, Performance | planejado |
| Fase 3 | Supervisão + tempo real entre equipe | planejado |
| Fase 4 | Integração futura com Gestão à Vista | fora do MVP |

## 📊 Métricas de Sucesso

- **Cobertura de sync**: ≥ 95% dos registros sincronizados em até 24h após criação
- **Tempo de registro**: redução do tempo médio de lançamento por turno vs. planilhas/papel
- **Adoção por frente**: ≥ 80% das frentes ativas registrando pelo menos um indicador obrigatório por turno
- **Integridade offline**: zero perda de registros locais em cenários de queda de conexão durante o turno

## ✅ Definição de Pronto (DoD)

- [ ] Regra `BR-*` implementada com ponteiros ao código e estado `implementado`
- [ ] Briefing `BRF-NNN` aceito no gate G3
- [ ] Casos de teste de negócio da seção 4 do briefing validados
- [ ] `memory-bank/activeContext.md` e `progress.md` atualizados
- [ ] `node scripts/validate-br-refs.mjs` OK

**Última atualização**: 2026-06-14
