import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { api, ApiClientError } from "@/lib/api/client";
import {
  getDeviceId,
  getUsuario,
  getValidAccessToken,
  isSessionValid,
  logoutSession,
} from "@/lib/auth/session";
import { db } from "@/lib/db/schema";
import { enqueueRegistro, flushOutbox, aceitarVersaoServidor, isSyncConflictPermanent } from "@/lib/sync/engine";
import { clearTurnoIfUsuarioMismatch, turnoMatchesUsuario } from "@/lib/turno/session";
import { AppLogo } from "@/components/AppLogo";
import { InstallPrompt } from "@/components/InstallPrompt";
import { SyncStatusBar } from "@/features/sync/SyncStatusBar";
import { formatContextoLabel, resolveContextoLabels } from "@/lib/catalog/contexto-labels";
import { COPY } from "@/lib/ui/copy";
import { labelArea, labelPerfil } from "@/lib/ui/labels";
import type { RegistroLocal, Turno, Usuario } from "@/types/domain";

type HomeAtalho = {
  label: string;
  to: string;
  secondary?: boolean;
};

const SUPERVISOR_ATALHOS: HomeAtalho[] = [
  { label: "Abrir painel da frente", to: "/supervisao" },
  { label: "Gestão à vista", to: "/gestao-a-vista", secondary: true },
];

const SIMULADOR_ATALHOS: HomeAtalho[] = [
  { label: "Simular ingestão do sistema central", to: "/simulador" },
  { label: "Gestão à vista", to: "/gestao-a-vista", secondary: true },
];

const AREA_ATALHOS: Record<string, HomeAtalho[]> = {
  colheita: [{ label: COPY.consultarDesempenhoTurno, to: "/colheita" }],
};

export function getHomeAtalhos(usuario: Usuario | null, turno: Turno | null | undefined): HomeAtalho[] {
  if (!usuario) return [];
  if (usuario.perfil === "supervisor_frente") return SUPERVISOR_ATALHOS;
  if (usuario.perfil === "simulador_central") return SIMULADOR_ATALHOS;
  if (turno?.status !== "aberto") return [];
  return AREA_ATALHOS[usuario.area] ?? [];
}

export function HomePage() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [fecharErro, setFecharErro] = useState<string | null>(null);

  useEffect(() => {
    void clearTurnoIfUsuarioMismatch();
  }, []);

  const turno = useLiveQuery(async () => {
    const usuarioAtual = await getUsuario();
    const local = await db.turno_atual.toCollection().first();
    if (local) {
      if (!turnoMatchesUsuario(local, usuarioAtual)) return null;
      return local;
    }
    return null;
  });

  useEffect(() => {
    if (turno !== null) return;
    void (async () => {
      const local = await db.turno_atual.toCollection().first();
      if (local) return;
      const token = await getValidAccessToken();
      if (!token || !navigator.onLine) return;
      try {
        const remoto = await api.turnoAtual(token);
        if (remoto) await db.turno_atual.put(remoto);
      } catch {
        /* offline ou sem turno remoto */
      }
    })();
  }, [turno]);

  const registros = useLiveQuery(() =>
    db.registros.orderBy("created_at").reverse().toArray()
  ) as RegistroLocal[] | undefined;

  const contextoLabel = useLiveQuery(async () => {
    if (!turno?.unidade_id || !turno.frente_id) return null;
    const labels = await resolveContextoLabels(turno.unidade_id, turno.frente_id);
    return formatContextoLabel(labels.frenteNome, labels.unidadeNome);
  }, [turno?.unidade_id, turno?.frente_id]);

  useEffect(() => {
    void (async () => {
      const valid = await isSessionValid();
      if (!valid) {
        navigate("/login");
        return;
      }
      setUsuario(await getUsuario());
      const u = await getUsuario();
      if (u?.perfil === "supervisor_frente") return;
      if (turno === null) {
        const t = await db.turno_atual.toCollection().first();
        if (!t) navigate("/contexto");
      }
    })();
  }, [navigate, turno]);

  if (turno === undefined) {
    return (
      <main className="page">
        <SyncStatusBar />
        <p className="subtitle">Carregando...</p>
      </main>
    );
  }

  async function registrarPlaceholder() {
    if (!turno || turno.status !== "aberto") return;
    await enqueueRegistro(
      turno.id,
      "placeholder",
      { nota: "Registro fundacao BRF-001" },
      getDeviceId()
    );
  }

  async function fecharTurno() {
    if (!turno) return;
    setFecharErro(null);
    const token = await getValidAccessToken();
    if (!token) return;
    try {
      if (navigator.onLine) {
        await flushOutbox();
        const fechado = await api.fecharTurno(token, turno.id);
        await db.turno_atual.put(fechado);
      } else {
        await db.turno_atual.put({ ...turno, status: "fechado", fim: new Date().toISOString() });
      }
      navigate("/contexto");
    } catch (err) {
      if (err instanceof ApiClientError && err.code === "ERR-INT-001") {
        setFecharErro("Não foi possível fechar o turno.");
        return;
      }
      throw err;
    }
  }

  async function logout() {
    await logoutSession();
    navigate("/login");
  }

  const isSimulador = usuario?.perfil === "simulador_central";
  const isSupervisor = usuario?.perfil === "supervisor_frente";
  const isOperador = !isSimulador && !isSupervisor;
  const showColheitaCta =
    isOperador && usuario?.area === "colheita" && turno?.status === "aberto";
  const atalhos = getHomeAtalhos(usuario, turno).filter(
    (item) => !(showColheitaCta && item.to === "/colheita")
  );

  const showPlaceholder =
    isOperador && usuario?.area !== "colheita" && turno?.status === "aberto";

  const showFecharTurno = turno && turno.status === "aberto" && isOperador;

  const showSyncDiagnostico = isOperador && usuario?.area !== "colheita";

  return (
    <main className="page">
      <SyncStatusBar />
      <AppLogo title="" />
      <InstallPrompt />
      <h1>Olá, {usuario?.nome ?? "..."}</h1>
      <p className="subtitle">
        {usuario ? `${labelPerfil(usuario.perfil)} · ${labelArea(usuario.area)}` : "..."}
      </p>

      {showColheitaCta && (
        <Link className="button-link button-link-primary" to="/colheita" data-testid="colheita-cta">
          {COPY.verDesempenho}
        </Link>
      )}

      {turno && isOperador && (
        <section className="card" data-testid="turno-info">
          <h2>Turno {turno.status}</h2>
          {contextoLabel && <p data-testid="turno-contexto">{contextoLabel}</p>}
          <p>Início: {new Date(turno.inicio).toLocaleString("pt-BR")}</p>
          {fecharErro && <p className="error">{fecharErro}</p>}
          {showFecharTurno && (
            <button type="button" className="secondary" onClick={() => void fecharTurno()}>
              Fechar turno
            </button>
          )}
        </section>
      )}

      {atalhos.length > 0 && (
        <section className="card" data-testid="home-atalhos">
          <h2>Atalhos</h2>
          <div className="page-actions">
            {atalhos.map((item) => (
              <Link
                key={item.label}
                className={`button-link${item.secondary ? " secondary-link" : ""}`}
                to={item.to}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </section>
      )}

      {showSyncDiagnostico && (
        <details className="card sync-diagnostic" data-testid="sync-diagnostic">
          <summary>{COPY.diagnosticoSync}</summary>
          {showPlaceholder && turno?.status === "aberto" && (
            <button type="button" onClick={() => void registrarPlaceholder()}>
              {COPY.registrarPlaceholder}
            </button>
          )}
          <h3 className="sync-diagnostic-subtitle">Registros locais</h3>
          <ul data-testid="registros-list">
            {(registros ?? []).map((r) => (
              <li key={r.id}>
                {r.tipo} — {r.sync_status}
                {r.last_error_code ? ` (${r.last_error_code})` : ""}
                {isSyncConflictPermanent(r.last_error_code) && (
                  <button
                    type="button"
                    className="secondary conflict-btn"
                    onClick={() => void aceitarVersaoServidor(r.id)}
                  >
                    Aceitar versão do servidor
                  </button>
                )}
              </li>
            ))}
          </ul>
        </details>
      )}

      <button type="button" className="secondary" onClick={() => void logout()}>
        {COPY.sair}
      </button>
    </main>
  );
}
