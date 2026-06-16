# 📋 Project Brief — Cocal Campo

> Charter do projeto: PWA offline-first para consulta de desempenho no campo.

## 🎯 Objetivo Principal

Profissionais da Cocal nas frentes de trabalho (colheita, transporte, qualidade, segurança e supervisão) precisam **consultar** indicadores de **performance** e **qualidade** do turno em locais onde **frequentemente não há sinal de Internet**. O **Cocal Campo** é um PWA instalável que exibe dados originados no **sistema central do cliente**, com **cache local** para leitura offline e **atualização automática** quando a conexão retornar. O operador **não registra** indicadores operacionais — apenas visualiza o desempenho do seu turno; o supervisor visualiza turnos da equipe na frente.

O painel **Gestão à Vista** (dashboard de gestão) fica **fora do escopo do MVP**; este produto foca na consulta operacional de campo.

**MVP sem contrato central:** perfil `simulador_central` ingere dados na base simulando o central até integração real (ver `BR-INTEG-005`).

## 🧭 Norte do produto

| Princípio | Significado |
|-----------|-------------|
| **Consulta offline** | Último snapshot de indicadores consultável sem Internet |
| **Pull automático** | Indicadores atualizam em background quando houver conexão |
| **Multi-área** | Telas de consulta conforme perfil e área |
| **Turno como unidade** | Indicadores organizados por turno vinculado a frente e unidade |
| **Tempo real online** | Supervisor vê atualizações da equipe (polling no MVP) |
| **Sincronização tripla** | Código, produção e **`docs/business/`** evoluem no mesmo ciclo |

**Referência:** [docs/business/_transversal.md](../docs/business/_transversal.md), [integracao-central.md](../docs/business/integracao-central.md).

## 🎯 Objetivos Específicos

### Fase atual

- Reposicionamento: visualização + simulador central (`BRF-005`–`007`)
- Colheita consulta + Supervisão leitura (prioridade)
- Stack Go + React PWA + PostgreSQL em produção

### Roadmap (fases)

| Fase | Foco | Estado |
|------|------|--------|
| Fase 0 | Catálogo de negócio + vocabulário | concluído |
| Fase 1 | Turno + auth + sync fundação | concluído |
| Fase 1b | **Consulta colheita + simulador + supervisão** | em andamento |
| Fase 2 | Demais áreas (transporte, qualidade leitura, segurança) | planejado |
| Fase 3 | Integração real sistema central | planejado |
| Fase 4 | Gestão à Vista | fora do MVP |

## 📊 Métricas de Sucesso

- **Disponibilidade de indicadores**: ≥ 95% dos turnos com snapshot consultável em até 24h após início
- **Tempo até visualização**: redução do tempo para o operador ver desempenho vs. canais atuais
- **Adoção por frente**: ≥ 80% das frentes com consulta ativa por turno
- **Integridade offline**: último snapshot sempre disponível após primeira sync bem-sucedida

## ✅ Definição de Pronto (DoD)

- [ ] Regra `BR-*` implementada com ponteiros ao código e estado `implementado`
- [ ] Briefing `BRF-NNN` aceito no gate G3
- [ ] Casos de teste da seção 4 do briefing validados
- [ ] `memory-bank/activeContext.md` e `progress.md` atualizados
- [ ] `node scripts/validate-br-refs.mjs` OK

**Última atualização**: 2026-06-16
