# 🚀 Active Context — Cocal Campo
> Estado vivo do projeto. Atualize a cada entrega significativa ou mudança de foco.

## 📋 Estado Atual do Projeto

### **Status Geral**

**Gestão à Vista MVP (BRF-008) implementado.** Painel por unidade com dias sem acidentes e comparativos performance/qualidade; simulador alimenta snapshot; supervisor vê painel inline em `/supervisao` + rota dedicada `/gestao-a-vista`.

**Shell de UI padronizado** — navegação (`BackLink`, `PageHeader`, `PageFooter`) em todas as telas internas; home com card **Atalhos** único por perfil (sem menu duplicado).

### ✅ Concluído recentemente:

1. ✅ BRF-008 Gestão à Vista — `painel_unidade`, matriz comparativa, dashboard compact no supervisor
2. ✅ UI shell — voltar topo + rodapé sticky; `page-has-footer` nas subpáginas
3. ✅ Home — card **Atalhos** (supervisor, simulador, operadores); turno só ações operacionais
4. ✅ BRF-005 Colheita consulta — `ColheitaConsultaPage`, pull + cache IndexedDB
5. ✅ BRF-007 Simulador central — `/simulador`, RBAC ingestão, `indicadores_turno`
6. ✅ BRF-006 Supervisão — `/supervisao`, detalhe read-only

### 📋 Próximos passos:

1. Contrato integração sistema central real (Fase 3)
2. Layout TV fiel Gestão à Vista + fluxo ocorrências segurança
3. Rotas consulta transporte/qualidade/segurança (atalhos placeholder na home)
4. Feedback piloto com operadores e supervisores

**Última atualização**: 2026-06-16
