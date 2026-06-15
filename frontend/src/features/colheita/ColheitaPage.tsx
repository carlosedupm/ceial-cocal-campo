import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { getDeviceId, getUsuario, isSessionValid } from "@/lib/auth/session";
import {
  COLHEITA_TIPOS,
  formatHorasCorte,
  validateConsumoDensidade,
  validateEntradaCana,
  validateHorasCorte,
} from "@/lib/colheita/validation";
import { db } from "@/lib/db/schema";
import {
  enqueueRegistroTurno,
  isSyncConflictPermanent,
  RegistroImutavelError,
} from "@/lib/sync/engine";
import { SyncStatusBar } from "@/features/sync/SyncStatusBar";
import type { RegistroLocal, Usuario } from "@/types/domain";

function statusIndicador(reg: RegistroLocal | undefined): string | null {
  if (!reg) return null;
  if (reg.sync_status === "sincronizado") return "Sincronizado — não pode alterar (BR-TRANS-004)";
  if (isSyncConflictPermanent(reg.last_error_code)) {
    return "Conflito: versão no servidor prevaleceu (BR-SYNC-005). Aceite na home.";
  }
  if (reg.sync_status === "pendente") return "Pendente de sync";
  if (reg.sync_status === "erro") return `Erro de sync (${reg.last_error_code ?? "?"})`;
  return null;
}

export function ColheitaPage() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [horas, setHoras] = useState("8");
  const [minutos, setMinutos] = useState("0");
  const [consumo, setConsumo] = useState("8.5");
  const [densidade, setDensidade] = useState("28");
  const [toneladas, setToneladas] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  const turno = useLiveQuery(async () => {
    const list = await db.turno_atual.toArray();
    return list[0] ?? null;
  });

  const registrosTurno = useLiveQuery(async () => {
    if (!turno?.id) return [];
    return db.registros.where("turno_id").equals(turno.id).toArray();
  });

  const regPorTipo = (tipo: string): RegistroLocal | undefined =>
    registrosTurno?.find((r) => r.tipo === tipo);

  const horasSync = regPorTipo(COLHEITA_TIPOS.horasCorte);
  const consumoSync = regPorTipo(COLHEITA_TIPOS.consumoDensidade);
  const entradaSync = regPorTipo(COLHEITA_TIPOS.entradaCana);

  const horasBloqueado =
    horasSync?.sync_status === "sincronizado" ||
    isSyncConflictPermanent(horasSync?.last_error_code);
  const consumoBloqueado =
    consumoSync?.sync_status === "sincronizado" ||
    isSyncConflictPermanent(consumoSync?.last_error_code);
  const entradaBloqueado =
    entradaSync?.sync_status === "sincronizado" ||
    isSyncConflictPermanent(entradaSync?.last_error_code);

  useEffect(() => {
    void (async () => {
      const valid = await isSessionValid();
      if (!valid) {
        navigate("/login");
        return;
      }
      const u = await getUsuario();
      if (!u || u.area !== "colheita") {
        navigate("/");
        return;
      }
      setUsuario(u);
    })();
  }, [navigate]);

  useEffect(() => {
    if (turno === undefined) return;
    if (!turno || turno.status !== "aberto") {
      navigate("/");
    }
  }, [navigate, turno]);

  if (turno === undefined || !usuario) {
    return (
      <main className="page">
        <SyncStatusBar />
        <p className="subtitle">Carregando...</p>
      </main>
    );
  }

  if (!turno || turno.status !== "aberto") {
    return (
      <main className="page">
        <SyncStatusBar />
        <p className="subtitle">Carregando...</p>
      </main>
    );
  }

  async function salvar(
    tipo: string,
    payload: Record<string, unknown>,
    label: string
  ) {
    setErro(null);
    setSucesso(null);
    try {
      await enqueueRegistroTurno(turno!.id, tipo, payload, getDeviceId());
      setSucesso(`${label} registrado`);
    } catch (e) {
      if (e instanceof RegistroImutavelError) {
        setErro(e.message);
        return;
      }
      setErro(e instanceof Error ? e.message : "Erro ao registrar");
    }
  }

  async function onHorasCorte(e: React.FormEvent) {
    e.preventDefault();
    const h = Number(horas);
    const m = Number(minutos);
    const msg = validateHorasCorte(h, m);
    if (msg) {
      setErro(msg);
      return;
    }
    await salvar(
      COLHEITA_TIPOS.horasCorte,
      { horas: h, minutos: m, exibicao: formatHorasCorte(h, m) },
      "Horas de corte"
    );
  }

  async function onConsumoDensidade(e: React.FormEvent) {
    e.preventDefault();
    const c = Number(consumo);
    const d = Number(densidade);
    const msg = validateConsumoDensidade(c, d);
    if (msg) {
      setErro(msg);
      return;
    }
    await salvar(
      COLHEITA_TIPOS.consumoDensidade,
      { consumo_lt: c, densidade_ton_carga: d },
      "Consumo e densidade"
    );
  }

  async function onEntradaCana(e: React.FormEvent) {
    e.preventDefault();
    const t = Number(toneladas);
    const msg = validateEntradaCana(t);
    if (msg) {
      setErro(msg);
      return;
    }
    await salvar(COLHEITA_TIPOS.entradaCana, { toneladas: t }, "Entrada de cana");
    setToneladas("");
  }

  return (
    <main className="page">
      <SyncStatusBar />
      <p>
        <Link to="/">← Voltar</Link>
      </p>
      <h1>Colheita</h1>
      <p className="subtitle">Turno aberto — {usuario.nome}</p>

      {erro && <p className="error">{erro}</p>}
      {sucesso && <p className="success">{sucesso}</p>}

      <section className="card" data-testid="form-horas-corte">
        <h2>Horas de corte</h2>
        <p className="hint">Obrigatório para fechar o turno (INT-001)</p>
        {statusIndicador(horasSync) && (
          <p className="hint" data-testid="status-horas-corte">{statusIndicador(horasSync)}</p>
        )}
        <form onSubmit={(e) => void onHorasCorte(e)}>
          <label>
            Horas
            <input
              type="number"
              min={0}
              max={24}
              value={horas}
              onChange={(e) => setHoras(e.target.value)}
              required
              disabled={horasBloqueado}
            />
          </label>
          <label>
            Minutos
            <input
              type="number"
              min={0}
              max={59}
              value={minutos}
              onChange={(e) => setMinutos(e.target.value)}
              required
              disabled={horasBloqueado}
            />
          </label>
          <button type="submit" disabled={horasBloqueado}>
            Registrar horas de corte
          </button>
        </form>
      </section>

      <section className="card" data-testid="form-consumo-densidade">
        <h2>Consumo e densidade</h2>
        <p className="hint">Por turno — opcional no fechamento</p>
        {statusIndicador(consumoSync) && (
          <p className="hint">{statusIndicador(consumoSync)}</p>
        )}
        <form onSubmit={(e) => void onConsumoDensidade(e)}>
          <label>
            Consumo colhedora (L/t)
            <input
              type="number"
              step="0.1"
              min={0.5}
              max={15}
              value={consumo}
              onChange={(e) => setConsumo(e.target.value)}
              required
              disabled={consumoBloqueado}
            />
          </label>
          <label>
            Densidade (ton/carga)
            <input
              type="number"
              step="0.1"
              min={20}
              max={35}
              value={densidade}
              onChange={(e) => setDensidade(e.target.value)}
              required
              disabled={consumoBloqueado}
            />
          </label>
          <button type="submit" disabled={consumoBloqueado}>
            Registrar consumo e densidade
          </button>
        </form>
      </section>

      <section className="card" data-testid="form-entrada-cana">
        <h2>Entrada de cana</h2>
        <p className="hint">Opcional no fechamento</p>
        {statusIndicador(entradaSync) && (
          <p className="hint">{statusIndicador(entradaSync)}</p>
        )}
        <form onSubmit={(e) => void onEntradaCana(e)}>
          <label>
            Toneladas
            <input
              type="number"
              step="0.1"
              min={0.1}
              value={toneladas}
              onChange={(e) => setToneladas(e.target.value)}
              required
              disabled={entradaBloqueado}
            />
          </label>
          <button type="submit" disabled={entradaBloqueado}>
            Registrar entrada de cana
          </button>
        </form>
      </section>
    </main>
  );
}
