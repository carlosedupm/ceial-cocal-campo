# 🎯 Product Context — Cocal Campo

> Visão de produto: personas, jornadas e métricas de valor. Detalhe operacional em `docs/business/`.

## Mercado e Problema

Profissionais da Cocal operam em frentes de trabalho espalhadas pelo campo — colheita de cana, transporte, controle de qualidade, segurança e supervisão. Esses locais **frequentemente não têm sinal de Internet estável**.

**Dores principais:**

- Dificuldade de consultar desempenho do turno no momento da operação
- Indicadores de qualidade disponíveis só após processamento na usina, sem visibilidade no campo
- Falta de visão consolidada para supervisores sobre a equipe da frente
- Dados operacionais concentrados no sistema central, inacessíveis no campo

## Missão e Visão

- **Missão:** Permitir que cada profissional no campo **consulte** o desempenho do turno de forma confiável, com ou sem Internet.
- **Visão:** Toda frente de trabalho Cocal com indicadores do central disponíveis no turno, apoiando melhoria contínua.

## Jornadas por perfil

| Perfil | Objetivo principal | Fluxos críticos |
|--------|-------------------|-----------------|
| **Operador de colheita** | Ver performance e qualidade do seu turno | Identificar → abrir turno → **consultar** indicadores → fechar turno |
| **Operador de transporte** | Ver indicadores de transporte do turno | Identificar → abrir turno → consultar → fechar |
| **Técnico de qualidade** | Consultar avaliações processadas | Identificar → consultar indicadores da frente |
| **Técnico de segurança** | Consultar contadores e ocorrências | Identificar → consultar |
| **Supervisor de frente** | Visão da equipe por setor/área | Identificar → **painel frente** → detalhe turno read-only |
| **Simulador central** (MVP) | Alimentar dados simulando o central | Ingerir indicadores em turnos da frente |

## Indicadores de referência (domínio Cocal)

- **Performance**: entrada de cana, densidade, ATR, horas de corte, consumo colhedora/transbordo
- **Qualidade**: impurezas, perdas, pisoteio, abalo (frequentemente com latência pós-usina)
- **Segurança**: dias sem acidentes (futuro)

## Métricas de valor

- Tempo entre disponibilidade no central e consulta no campo
- Frequência de consulta por turno
- Satisfação do supervisor com visibilidade da frente

**Última atualização**: 2026-06-16
