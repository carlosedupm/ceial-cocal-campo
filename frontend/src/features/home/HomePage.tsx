import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { api, ApiClientError } from "@/lib/api/client";
import {
  clearSession,
  getDeviceId,
  getUsuario,
  getValidAccessToken,
  isSessionValid,
} from "@/lib/auth/session";
import { db } from "@/lib/db/schema";
import { enqueueRegistro, flushOutbox, aceitarVersaoServidor, isSyncConflictPermanent } from "@/lib/sync/engine";
import { clearTurnoIfUsuarioMismatch, purgeOrphanRegistros, turnoMatchesUsuario } from "@/lib/turno/session";
import { SyncStatusBar } from "@/features/sync/SyncStatusBar";
import { labelArea, labelPerfil } from "@/lib/ui/labels";
import type { RegistroLocal, Turno, Usuario } from "@/types/domain";

type HomeAtalho = {
  label: string;
  to?: string;
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
  colheita: [{ label: "Consultar desempenho do turno", to: "/colheita" }],
  transporte: [{ label: "Consultar turno" }],
  qualidade: [{ label: "Consultar avaliações" }],
  seguranca: [{ label: "Consultar segurança" }],
};

function getHomeAtalhos(usuario: Usuario | null, turno: Turno | null | undefined): HomeAtalho[] {
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
    await clearSession();
    await db.turno_atual.clear();
    await purgeOrphanRegistros();
    navigate("/login");
  }

  const isSimulador = usuario?.perfil === "simulador_central";
  const isSupervisor = usuario?.perfil === "supervisor_frente";
  const isOperador = !isSimulador && !isSupervisor;
  const atalhos = getHomeAtalhos(usuario, turno);

  const showPlaceholder =
    isOperador && usuario?.area !== "colheita" && turno?.status === "aberto";

  const showFecharTurno = turno && turno.status === "aberto" && isOperador;

  const showRegistrosLocais = isOperador && usuario?.area !== "colheita";

  return (
    <main className="page">
      <SyncStatusBar />
      <h1>Olá, {usuario?.nome ?? "..."}</h1>
      <p className="subtitle">
        {usuario ? `${labelPerfil(usuario.perfil)} · ${labelArea(usuario.area)}` : "..."}
      </p>

      {turno && isOperador && (
        <section className="card" data-testid="turno-info">
          <h2>Turno {turno.status}</h2>
          <p>Início: {new Date(turno.inicio).toLocaleString("pt-BR")}</p>
          {fecharErro && <p className="error">{fecharErro}</p>}
          {showFecharTurno && (
            <>
              {showPlaceholder && (
                <button type="button" onClick={() => void registrarPlaceholder()}>
                  Registrar placeholder
                </button>
              )}
              <button type="button" className="secondary" onClick={() => void fecharTurno()}>
                Fechar turno
              </button>
            </>
          )}
        </section>
      )}

      {atalhos.length > 0 && (
        <section className="card" data-testid="home-atalhos">
          <h2>Atalhos</h2>
          <div className="page-actions">
            {atalhos.map((item) =>
              item.to ? (
                <Link
                  key={item.label}
                  className={`button-link${item.secondary ? " secondary-link" : ""}`}
                  to={item.to}
                >
                  {item.label}
                </Link>
              ) : (
                <p key={item.label} className="hint home-atalho-indisponivel">
                  {item.label}
                </p>
              )
            )}
          </div>
        </section>
      )}

      {showRegistrosLocais && (
        <section className="card">
          <h2>Registros locais</h2>
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
        </section>
      )}

      <button type="button" className="secondary" onClick={() => void logout()}>
        Sair
      </button>
    </main>
  );
}
