# Arquitetura recomendada — Cocal Campo

PWA offline-first para frentes de trabalho no campo (colheita, transporte, qualidade, segurança, supervisão). Stack ratificada em [ADR-001](docs/architecture/ADR-001-stack.md).

**Fase atual:** fundação `BRF-001` implementada (G2/G3). Ambiente **100% containerizado** — Dev Container + Docker Compose.

## Estrutura

| Path | Conteúdo |
|------|----------|
| [`backend/`](backend/) | API Go — auth, turno, sync |
| [`frontend/`](frontend/) | PWA React + Vite + IndexedDB |
| [`docs/business/`](docs/business/) | Catálogo de regras `BR-*` |
| [`docs/briefings/`](docs/briefings/) | Ordens de serviço `BRF-*` |
| [`docs/architecture/`](docs/architecture/) | ADRs |
| [`memory-bank/`](memory-bank/) | Estado vivo do projeto |
| [`docker-compose.yml`](docker-compose.yml) | Postgres + API + PWA (dev) |
| [`.devcontainer/`](.devcontainer/) | Dev Container (Go + Node) |

## Desenvolvimento (Dev Container — recomendado)

**Não é necessário** instalar Go, Node ou PostgreSQL no host.

1. Clone: `git clone git@github.com:carlosedupm/ceial-cocal-campo.git`
2. Abra a pasta no Cursor
3. **Command Palette** → *Dev Containers: Reopen in Container*
4. Aguarde o build; sobe apenas **Postgres**
5. **Run and Debug** → selecione **Cocal Campo (API + PWA)** → **F5**

| Serviço | URL |
|---------|-----|
| PWA | http://localhost:5173 |
| API | http://localhost:8080/health |

**Login de teste:** `colheita@cocal.dev` / `campo123`

**Fluxo do usuário (telas e dados):** [docs/ops/fluxo-usuario-brf-001.md](docs/ops/fluxo-usuario-brf-001.md)

### Troubleshooting F5

Se o frontend falhar com `vite: not found`, a pasta `frontend/node_modules` pode estar vazia e pertencer a `root` (comum após `npm run dev` com profile `stack`). Corrija uma vez:

```bash
sudo rm -rf frontend/node_modules
```

Em seguida **F5** novamente (a task instala as deps automaticamente). Após **Rebuild do Dev Container**, o `post-create` faz isso sozinho.

Se a HomePage (`http://localhost:5173/`) abrir em branco **após login e abertura de turno**, verifique o console do browser (F12). Causa comum: erro no IndexedDB/Dexie — confirme que API e Vite estão no ar (**Shift+F5** → **F5**) e que `npm test` passa no frontend. Se persistir após atualizar o código, limpe dados do site em DevTools → Application → IndexedDB → `cocal-campo`.

## Comandos (dentro do Dev Container ou com Docker no host)

```bash
npm run validate          # docs + referências BR-*
npm run dev               # stack completa em containers (--profile stack)
npm run dev:logs          # logs api + frontend (profile stack)
npm run test              # testes backend + frontend (containers)
npm run build             # build produção (containers)
bash scripts/bootstrap-lockfiles.sh  # gera go.sum + package-lock.json
```

## Fluxo de entrega

```
BR-* planejado → BRF-NNN aprovado (G1) → implementação (G2) → aceite (G3)
```

**Fundação:** [`BRF-001`](docs/briefings/BRF-001-fundacao-turno-sync.md) — implementado.

**Última atualização**: 2026-06-15
