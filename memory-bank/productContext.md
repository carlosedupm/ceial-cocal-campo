# 🎯 Product Context — Cocal Campo

> Visão de produto: personas, jornadas e métricas de valor. Detalhe operacional em `docs/business/`.

## Mercado e Problema

Profissionais da Cocal operam em frentes de trabalho espalhadas pelo campo — colheita de cana, transporte (transbordo), controle de qualidade, segurança e supervisão. Esses locais **frequentemente não têm sinal de Internet estável**.

**Dores principais:**

- Dados do turno registrados em papel ou planilhas offline, com risco de perda e atraso na consolidação
- Impossibilidade de consultar indicadores da frente ou da equipe no momento da operação
- Falta de visibilidade em tempo real para supervisores quando há conexão
- Indicadores operacionais (performance, qualidade, segurança) desconectados do fluxo diário de quem está no campo

## Missão e Visão

- **Missão:** Permitir que cada profissional no campo registre e consulte informações do turno de forma confiável, com ou sem Internet.
- **Visão:** Toda frente de trabalho Cocal alimentada digitalmente no turno, com dados sincronizados e disponíveis para gestão e melhoria contínua.

## Jornadas por perfil

| Perfil | Objetivo principal | Fluxos críticos |
|--------|-------------------|-----------------|
| **Operador de colheita** | Registrar produção e consumo da colhedora no turno | Identificar → abrir turno → registrar horas de corte, densidade, consumo → consultar executado vs meta → fechar turno → sync |
| **Operador de transporte** | Registrar cargas e consumo de transbordo | Identificar → abrir turno → registrar viagens/cargas e consumo L/t → fechar turno → sync |
| **Técnico de qualidade** | Avaliar impurezas e perdas no talhão/frente | Identificar → selecionar frente → registrar amostras (impurezas, perdas, pisoteio, abalo) → sync |
| **Técnico de segurança** | Registrar ocorrências e consultar dias sem acidentes | Identificar → consultar contadores → registrar ocorrência se houver → sync |
| **Supervisor de frente** | Visão consolidada da equipe e pendências | Identificar → painel da frente (turnos abertos, registros, sync pendentes) → justificar fechamentos incompletos → acompanhar tempo real online |

## Indicadores de referência (domínio Cocal)

Derivados do contexto operacional da cana-de-açúcar (referência Gestão à Vista, fora do MVP):

- **Performance**: entrada de cana, densidade (ton/carga), ATR (kg/ton), horas de corte, consumo colhedora/transbordo (L/t)
- **Qualidade**: impureza mineral/vegetal (kg/ton), perdas, pisoteio, abalo e arranquio (%)
- **Segurança**: dias sem acidentes por unidade (Paraguaçu Paulista, Narandiba) e operação (Colheita, Transporte)

Horizontes de comparação: **diário**, **semanal**, **safra** — prioridade de registro no campo é o **turno/diário**.

## Métricas de valor

- Redução de retrabalho na digitação pós-campo
- Aumento da frequência de registros por turno
- Tempo médio entre registro no campo e disponibilidade no servidor (quando online)
- Satisfação do supervisor com visibilidade da frente em tempo real

## Ciclo de feedback

- Supervisores identificam lacunas de registro ou indicadores ausentes durante o turno
- Técnicos de qualidade e segurança validam aderência dos formulários à operação real
- Operadores reportam falhas de sync ou usabilidade offline
- Product owner prioriza briefings por área com base na cobertura de indicadores por frente

**Última atualização**: 2026-06-14
