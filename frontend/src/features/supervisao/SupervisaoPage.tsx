import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { GestaoDashboard } from "@/components/gestao-vista/GestaoDashboard";
import { PageFooter } from "@/components/PageFooter";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/lib/api/client";
import { fetchAndCachePainelUnidade } from "@/lib/gestao-vista/cache";
import { getUsuario, getValidAccessToken, isSessionValid } from "@/lib/auth/session";
import { refreshContextoCatalog } from "@/lib/catalog/contexto-cache";
import { db } from "@/lib/db/schema";
import {
  frenteNomeById,
  getSelectedFrenteId,
  loadFrentesForUsuario,
  setSelectedFrenteId,
} from "@/lib/frente/helpers";
import { SyncStatusBar } from "@/features/sync/SyncStatusBar";
import { labelArea } from "@/lib/ui/labels";
import type { FrenteResumo } from "@/types/indicadores";
import type { PainelUnidade } from "@/types/gestao-vista";

const POLL_MS = 45000;

export function SupervisaoPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [frentes, setFrentes] = useState<{ id: string; nome: string }[]>([]);
  const [frenteId, setFrenteId] = useState("");
  const [frenteNome, setFrenteNome] = useState("");
  const [resumo, setResumo] = useState<FrenteResumo | null>(null);
  const [painel, setPainel] = useState<PainelUnidade | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const turnoIds = (resumo?.turnos ?? []).map((t) => t.id).join(",");

  const indicadoresPorTurno = useLiveQuery(async () => {
    const turnos = resumo?.turnos ?? [];
    const flags: Record<string, boolean> = {};
    await Promise.all(
      turnos.map(async (t) => {
        const row = await db.indicadores_cache.get(t.id);
        flags[t.id] = Boolean(row?.snapshot);
      })
    );
    return flags;
  }, [turnoIds, resumo?.turnos?.length]);

  async function carregarPainel(unidadeId: string) {
    const token = await getValidAccessToken();
    if (!token || !unidadeId) return;
    const row = await fetchAndCachePainelUnidade(token, unidadeId);
    setPainel(row);
  }

  async function carregar(activeFrenteId: string) {
    const token = await getValidAccessToken();
    if (!token || !activeFrenteId) return;
    try {
      const data = await api.resumoFrente(token, activeFrenteId);
      setResumo(data);
      setErro(null);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao carregar painel");
    }
  }

  useEffect(() => {
    void (async () => {
      const valid = await isSessionValid();
      if (!valid) {
        navigate("/login");
        return;
      }
      const u = await getUsuario();
      if (!u || u.perfil !== "supervisor_frente") {
        navigate("/");
        return;
      }
      const token = await getValidAccessToken();
      if (token) await refreshContextoCatalog(token);
      const list = await loadFrentesForUsuario(u);
      setFrentes(list);
      const selected = getSelectedFrenteId(u, searchParams.get("frente"));
      setFrenteId(selected);
      setSelectedFrenteId(selected);
      setFrenteNome(await frenteNomeById(selected));
      await carregar(selected);
      if (u.unidade_ids[0]) await carregarPainel(u.unidade_ids[0]);
    })();
  }, [navigate, searchParams]);

  useEffect(() => {
    if (!frenteId) return;
    const reload = () => void carregar(frenteId);
    const id = setInterval(reload, POLL_MS);
    window.addEventListener("online", reload);
    return () => {
      clearInterval(id);
      window.removeEventListener("online", reload);
    };
  }, [frenteId]);

  function onFrenteChange(nextId: string) {
    setFrenteId(nextId);
    setSelectedFrenteId(nextId);
    void frenteNomeById(nextId).then(setFrenteNome);
    setSearchParams(nextId ? { frente: nextId } : {});
    void carregar(nextId);
  }

  return (
    <main className="page page-gestao-vista page-has-footer" data-testid="supervisao-page">
      <SyncStatusBar />
      <PageHeader
        title="Painel da frente"
        subtitle={`Consulta somente leitura — ${frenteNome || "equipe na frente"}`}
        breadcrumbs={[{ label: "Início", to: "/" }, { label: "Painel da frente" }]}
        backTo="/"
        backLabel="Voltar ao início"
      />
      {frentes.length > 1 && (
        <section className="card">
          <label>
            Frente
            <select value={frenteId} onChange={(e) => onFrenteChange(e.target.value)}>
              {frentes.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nome}
                </option>
              ))}
            </select>
          </label>
        </section>
      )}
      {erro && <p className="error">{erro}</p>}
      {painel?.snapshot && (
        <GestaoDashboard
          snapshot={painel.snapshot}
          atualizadoEm={painel.atualizado_em}
          compact
          testId="gestao-vista-resumo"
        />
      )}
      <section className="card">
        <h2>Turnos abertos</h2>
        <div className="turnos-equipe" data-testid="turnos-equipe">
          {(resumo?.turnos ?? []).map((t) => {
            const comDados = indicadoresPorTurno?.[t.id];
            return (
              <Link
                key={t.id}
                className="card turno-card-link"
                data-testid={`turno-card-${t.id}`}
                to={`/supervisao/turnos/${t.id}${frenteId ? `?frente=${frenteId}` : ""}`}
              >
                <strong>{t.usuario_nome}</strong>
                <p className="turno-card-meta">
                  <span>{labelArea(t.usuario_area)}</span>
                  <span>desde {new Date(t.inicio).toLocaleString("pt-BR")}</span>
                  <span className={comDados ? "badge-ok" : "badge-muted"}>
                    {comDados ? "Com dados" : "Aguardando central"}
                  </span>
                </p>
              </Link>
            );
          })}
        </div>
        {(resumo?.turnos ?? []).length === 0 && (
          <p className="subtitle">Nenhum turno aberto nesta frente.</p>
        )}
      </section>
      <PageFooter backTo="/" backLabel="Voltar ao início" />
    </main>
  );
}
