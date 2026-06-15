import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { api } from "@/lib/api/client";
import {
  clearSession,
  getDeviceId,
  getUsuario,
  getValidAccessToken,
  isSessionValid,
} from "@/lib/auth/session";
import { db } from "@/lib/db/schema";
import { enqueueRegistro, flushOutbox } from "@/lib/sync/engine";
import { SyncStatusBar } from "@/features/sync/SyncStatusBar";
import type { RegistroLocal, Usuario } from "@/types/domain";

const AREA_MENUS: Record<string, string[]> = {
  colheita: ["Registrar placeholder", "Consultar turno"],
  transporte: ["Registrar placeholder", "Consultar turno"],
  qualidade: ["Registrar placeholder"],
  seguranca: ["Registrar placeholder"],
  supervisao: ["Painel frente", "Consultar turno"],
};

export function HomePage() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const turno = useLiveQuery(async () => {
    const local = await db.turno_atual.toCollection().first();
    if (local) return local;
    const token = await getValidAccessToken();
    if (!token || !navigator.onLine) return null;
    try {
      const remoto = await api.turnoAtual(token);
      if (remoto) await db.turno_atual.put(remoto);
      return remoto;
    } catch {
      return null;
    }
  });
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
    const token = await getValidAccessToken();
    if (!token) return;
    if (navigator.onLine) {
      const fechado = await api.fecharTurno(token, turno.id);
      await db.turno_atual.put(fechado);
    } else {
      await db.turno_atual.put({ ...turno, status: "fechado", fim: new Date().toISOString() });
    }
    await flushOutbox();
    navigate("/contexto");
  }

  async function logout() {
    await clearSession();
    await db.turno_atual.clear();
    navigate("/login");
  }

  const menus = usuario ? AREA_MENUS[usuario.area] ?? [] : [];
  const forbiddenTransportMenu =
    usuario?.area === "colheita" &&
    menus.some((m) => m.includes("transporte"));

  return (
    <main className="page">
      <SyncStatusBar />
      <h1>Olá, {usuario?.nome ?? "..."}</h1>
      <p className="subtitle">
        Perfil: {usuario?.perfil} · Área: {usuario?.area}
      </p>

      {turno && (
        <section className="card" data-testid="turno-info">
          <h2>Turno {turno.status}</h2>
          <p>Início: {new Date(turno.inicio).toLocaleString("pt-BR")}</p>
          {turno.status === "aberto" && (
            <>
              <button type="button" onClick={() => void registrarPlaceholder()}>
                Registrar placeholder
              </button>
              <button type="button" className="secondary" onClick={() => void fecharTurno()}>
                Fechar turno
              </button>
            </>
          )}
        </section>
      )}

      <section className="card">
        <h2>Menu ({usuario?.area})</h2>
        <ul>
          {menus.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        {forbiddenTransportMenu && (
          <p data-testid="rbac-hidden">Menu transporte oculto (BR-ACESSO-001)</p>
        )}
      </section>

      <section className="card">
        <h2>Registros locais</h2>
        <ul data-testid="registros-list">
          {(registros ?? []).map((r) => (
            <li key={r.id}>
              {r.tipo} — {r.sync_status}
              {r.last_error_code ? ` (${r.last_error_code})` : ""}
            </li>
          ))}
        </ul>
      </section>

      <button type="button" className="secondary" onClick={() => void logout()}>
        Sair
      </button>
    </main>
  );
}
