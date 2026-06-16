import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/lib/api/client";
import { getUsuario, getValidAccessToken, isSessionValid } from "@/lib/auth/session";
import { refreshContextoCatalog } from "@/lib/catalog/contexto-cache";
import {
  frenteNomeById,
  getSelectedFrenteId,
  loadFrentesForUsuario,
  setSelectedFrenteId,
} from "@/lib/frente/helpers";
import { SyncStatusBar } from "@/features/sync/SyncStatusBar";
import type { FrenteResumo } from "@/types/indicadores";

const POLL_MS = 45000;

export function SupervisaoPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [frentes, setFrentes] = useState<{ id: string; nome: string }[]>([]);
  const [frenteId, setFrenteId] = useState("");
  const [frenteNome, setFrenteNome] = useState("");
  const [resumo, setResumo] = useState<FrenteResumo | null>(null);
  const [erro, setErro] = useState<string | null>(null);

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
    <main className="page" data-testid="supervisao-page">
      <SyncStatusBar />
      <PageHeader
        title="Painel da frente"
        subtitle={`Consulta somente leitura — ${frenteNome || "equipe na frente"}`}
        breadcrumbs={[{ label: "Início", to: "/" }, { label: "Painel da frente" }]}
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
      <section className="card">
        <h2>Turnos abertos</h2>
        <ul data-testid="turnos-equipe">
          {(resumo?.turnos ?? []).map((t) => (
            <li key={t.id}>
              <Link
                to={`/supervisao/turnos/${t.id}${frenteId ? `?frente=${frenteId}` : ""}`}
              >
                {t.usuario_nome} · {t.usuario_area} · desde{" "}
                {new Date(t.inicio).toLocaleString("pt-BR")}
              </Link>
            </li>
          ))}
        </ul>
        {(resumo?.turnos ?? []).length === 0 && (
          <p className="subtitle">Nenhum turno aberto nesta frente.</p>
        )}
      </section>
      <Link to="/">Voltar</Link>
    </main>
  );
}
