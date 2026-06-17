import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { api, ApiClientError } from "@/lib/api/client";
import {
  getDefaultContextoIds,
  loadFrentesFromCache,
  loadUnidadesFromCache,
  refreshContextoCatalog,
  saveFrentesCache,
} from "@/lib/catalog/contexto-cache";
import { getDeviceId, getUsuario, getValidAccessToken, logoutSession } from "@/lib/auth/session";
import { SyncStatusBar } from "@/features/sync/SyncStatusBar";
import { postOpenTurnoPath } from "@/lib/auth/routes";
import { clearTurnoIfUsuarioMismatch, turnoMatchesUsuario } from "@/lib/turno/session";
import { COPY } from "@/lib/ui/copy";
import { db } from "@/lib/db/schema";
import type { Frente, Turno, Unidade, Usuario } from "@/types/domain";

async function applyFrentesForUnidade(
  unidadeId: string,
  token: string | null
): Promise<Frente[]> {
  let frentes = await loadFrentesFromCache(unidadeId);
  if (token && navigator.onLine) {
    try {
      frentes = await api.listFrentes(token, unidadeId);
      await saveFrentesCache(frentes);
    } catch {
      /* usa cache */
    }
  }
  return frentes;
}

function destinoAposTurno(usuario: Usuario | null): string {
  return postOpenTurnoPath(usuario?.area ?? "");
}

export function ContextoPage() {
  const navigate = useNavigate();
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [frentes, setFrentes] = useState<Frente[]>([]);
  const [unidadeId, setUnidadeId] = useState("");
  const [frenteId, setFrenteId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [catalogOffline, setCatalogOffline] = useState(false);
  const [hasDefaults, setHasDefaults] = useState(false);

  useEffect(() => {
    void (async () => {
      const token = await getValidAccessToken();
      if (!token) {
        navigate("/login");
        return;
      }

      const usuario = await getUsuario();
      if (usuario?.perfil === "supervisor_frente") {
        navigate("/supervisao");
        return;
      }

      const cached = await loadUnidadesFromCache();
      if (cached.length > 0) {
        setUnidades(cached);
      }

      const defaults = await getDefaultContextoIds();
      if (defaults?.unidadeId && defaults.frenteId) {
        setHasDefaults(true);
        setUnidadeId(defaults.unidadeId);
        const cachedFrentes = await loadFrentesFromCache(defaults.unidadeId);
        if (cachedFrentes.length > 0) {
          setFrentes(cachedFrentes);
          setFrenteId(
            cachedFrentes.some((f) => f.id === defaults.frenteId)
              ? defaults.frenteId
              : (cachedFrentes[0]?.id ?? "")
          );
        }
      }

      await clearTurnoIfUsuarioMismatch();
      const local = await db.turno_atual.toCollection().first();
      if (local?.status === "aberto" && turnoMatchesUsuario(local, usuario)) {
        navigate(destinoAposTurno(usuario));
        return;
      }

      if (navigator.onLine) {
        try {
          const remoto = await api.turnoAtual(token);
          if (remoto) {
            await db.turno_atual.put(remoto);
            void refreshContextoCatalog(token);
            navigate(destinoAposTurno(usuario));
            return;
          }
        } catch {
          /* segue para seleção de contexto */
        }
      }

      const list = await refreshContextoCatalog(token);
      setCatalogOffline(list.length > 0 && !navigator.onLine);
      if (list.length > 0) {
        setUnidades(list);
        const nextUnidadeId =
          defaults?.unidadeId && list.some((u) => u.id === defaults.unidadeId)
            ? defaults.unidadeId
            : list[0].id;
        setUnidadeId(nextUnidadeId);
        const nextFrentes = await applyFrentesForUnidade(nextUnidadeId, token);
        setFrentes(nextFrentes);
        setFrenteId(
          defaults?.frenteId && nextFrentes.some((f) => f.id === defaults.frenteId)
            ? defaults.frenteId
            : (nextFrentes[0]?.id ?? "")
        );
      } else if (!navigator.onLine) {
        setCatalogOffline(true);
        setError("Sem catálogo local. Conecte-se uma vez para carregar unidades e frentes.");
      }
    })();
  }, [navigate]);

  useEffect(() => {
    if (!unidadeId) return;
    void (async () => {
      const token = await getValidAccessToken();
      const list = await applyFrentesForUnidade(unidadeId, token);
      setFrentes(list);
      setFrenteId((current) =>
        list.some((f) => f.id === current) ? current : (list[0]?.id ?? "")
      );
    })();
  }, [unidadeId]);

  async function abrirTurno() {
    setLoading(true);
    setError("");
    try {
      const usuario = await getUsuario();
      if (!usuario) throw new Error("sem usuario");
      const deviceId = getDeviceId();
      const turnoId = crypto.randomUUID();
      const inicio = new Date().toISOString();
      const payload = {
        id: turnoId,
        unidade_id: unidadeId,
        frente_id: frenteId,
        device_id: deviceId,
        inicio,
      };
      const destino = destinoAposTurno(usuario);

      if (navigator.onLine) {
        const token = await getValidAccessToken();
        if (!token) throw new Error("sem sessao");
        try {
          const turno = await api.abrirTurno(token, payload);
          await db.turno_atual.put(turno);
          navigate(destino);
          return;
        } catch (err) {
          if (err instanceof ApiClientError && err.code === "ERR-TURNO-002") {
            const remoto = await api.turnoAtual(token);
            if (remoto) {
              await db.turno_atual.put(remoto);
              navigate(destino);
              return;
            }
            const local = await db.turno_atual.toCollection().first();
            if (local) {
              navigate(destino);
              return;
            }
          }
          throw err;
        }
      }

      const localTurno: Turno = {
        id: turnoId,
        usuario_id: usuario.id,
        unidade_id: unidadeId,
        frente_id: frenteId,
        area: usuario.area,
        status: "aberto",
        inicio,
        device_id: deviceId,
      };
      await db.turno_atual.put(localTurno);
      navigate(destino);
    } catch {
      setError("Não foi possível abrir turno.");
    } finally {
      setLoading(false);
    }
  }

  const unidadeNome = unidades.find((u) => u.id === unidadeId)?.nome ?? "";
  const frenteNome = frentes.find((f) => f.id === frenteId)?.nome ?? "";
  const showContinuar = hasDefaults && Boolean(unidadeId && frenteId && unidadeNome && frenteNome);

  async function sair() {
    await logoutSession();
    navigate("/login");
  }

  return (
    <main className="page">
      <SyncStatusBar />
      <PageHeader title="Contexto operacional" subtitle={COPY.contextoSubtitle} />
      {catalogOffline && unidades.length > 0 && (
        <p className="subtitle" data-testid="catalogo-offline">
          Catálogo local (offline)
        </p>
      )}
      {showContinuar && (
        <div className="contexto-rapido">
          <button
            type="button"
            data-testid="contexto-continuar"
            onClick={() => void abrirTurno()}
            disabled={loading}
          >
            {COPY.continuarCom(frenteNome, unidadeNome)}
          </button>
        </div>
      )}
      {showContinuar && <p className="contexto-rapido-label">{COPY.contextoOutro}</p>}
      <div className="card">
        <label>
          Unidade
          <select value={unidadeId} onChange={(e) => setUnidadeId(e.target.value)}>
            {unidades.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}
              </option>
            ))}
          </select>
        </label>
        <label>
          Frente
          <select value={frenteId} onChange={(e) => setFrenteId(e.target.value)}>
            {frentes.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nome}
              </option>
            ))}
          </select>
        </label>
        {error && <p className="error">{error}</p>}
        <button type="button" onClick={() => void abrirTurno()} disabled={loading || !frenteId}>
          Abrir turno
        </button>
      </div>
      <button type="button" className="secondary" onClick={() => void sair()}>
        {COPY.sair}
      </button>
    </main>
  );
}
