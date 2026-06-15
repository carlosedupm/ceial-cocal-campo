# Checklist — Validação offline em campo

> Testes em dispositivo real ou emulador mobile antes do gate G3 e em pilotos de frente.

## Ambiente

- [ ] PWA instalado na home screen (add to homescreen)
- [ ] Chrome Android ou Safari iOS
- [ ] Área com sinal instável ou modo avião disponível

## Conectividade

- [x] App abre e opera em modo avião após login online prévio (`BR-ACESSO-004`) — validado DevTools Offline
- [x] Indicador offline visível (`BR-SYNC-003`)
- [x] Contagem de pendências atualiza após registros offline
- [x] Última sync bem-sucedida exibida após reconexão

## Usabilidade no campo

- [x] Fluxo abrir turno ≤ 3 toques após login (login → contexto → abrir turno)
- [x] Registro placeholder rápido (≤ 30s) — 1 clique na home
- [x] Textos legíveis (contraste `#1a1a1a` / `#f4f6f4` — revisão estática CSS)
- [x] Botões com área de toque adequada (`min-height: 44px` em `styles.css`)

## Sync em condições reais

- [ ] Alternar offline/online 3x durante turno — sem perda de dados
- [ ] Sync automático ao retorno de 4G/Wi‑Fi
- [ ] Após 7 dias sem online, sessão exige novo login online

## Registro de campo

| Data | Frente | Dispositivo | Executor | Resultado |
|------|--------|-------------|----------|-----------|
| 2026-06-15 | — | Dev Container / Chrome DevTools | usuário | Conectividade OK; piloto mobile pendente |

**Última atualização**: 2026-06-15
