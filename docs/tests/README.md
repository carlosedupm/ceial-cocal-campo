# Testes — Cocal Campo

Checklists manuais e referência para testes automatizados por briefing.

| Checklist | Briefing | Uso |
|-----------|----------|-----|
| [regressao-fundacao-turno-sync.md](./regressao-fundacao-turno-sync.md) | `BRF-001` | Regressão fundação + G3 |
| [validacao-offline-campo.md](./validacao-offline-campo.md) | `BRF-001` | Dispositivo real / piloto |

## Testes automatizados

```bash
cd backend && go test ./...
cd frontend && npm test
```

Casos nomeados conforme seção 4 dos briefings (`BR-TURNO-002_turno_duplicado`, etc.).

**Última atualização**: 2026-06-14
