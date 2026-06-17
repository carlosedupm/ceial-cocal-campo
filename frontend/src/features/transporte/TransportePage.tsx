import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { PageFooter } from "@/components/PageFooter";
import { PageHeader } from "@/components/PageHeader";
import { getDeviceId, getUsuario, isSessionValid } from "@/lib/auth/session";
import {
  TRANSPORTE_TIPOS,
  validateCargasViagens,
  validateConsumoTransbordo,
} from "@/lib/transporte/validation";
import { db } from "@/lib/db/schema";
import {
  enqueueRegistroTurno,
  enqueueRegistroViagem,
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

function viagemNumeroFromPayload(reg: RegistroLocal): number | null {
  const n = reg.payload.viagem_numero;
  if (typeof n === "number" && Number.isInteger(n)) return n;
  return null;
}

export function TransportePage() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [consumo, setConsumo] = useState("10");
  const [viagemNumero, setViagemNumero] = useState("1");
  const [toneladas, setToneladas] = useState("");
  const [frenteOrigem, setFrenteOrigem] = useState("");
  const [frenteDestino, setFrenteDestino] = useState("");
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

  const consumoSync = registrosTurno?.find(
    (r) => r.tipo === TRANSPORTE_TIPOS.consumoTransbordo
  );
  const viagensSync =
    registrosTurno?.filter((r) => r.tipo === TRANSPORTE_TIPOS.cargasViagens) ?? [];

  const consumoBloqueado =
    consumoSync?.sync_status === "sincronizado" ||
    isSyncConflictPermanent(consumoSync?.last_error_code);

  const viagemAtual = Number(viagemNumero);
  const viagemAtualReg = viagensSync.find(
    (r) => viagemNumeroFromPayload(r) === viagemAtual
  );
  const viagemBloqueada =
    viagemAtualReg?.sync_status === "sincronizado" ||
    isSyncConflictPermanent(viagemAtualReg?.last_error_code);

  useEffect(() => {
    void (async () => {
      const valid = await isSessionValid();
      if (!valid) {
        navigate("/login");
        return;
      }
      const u = await getUsuario();
      if (!u || u.area !== "transporte") {
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

  async function onConsumoTransbordo(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSucesso(null);
    const c = Number(consumo);
    const msg = validateConsumoTransbordo(c);
    if (msg) {
      setErro(msg);
      return;
    }
    try {
      await enqueueRegistroTurno(
        turno!.id,
        TRANSPORTE_TIPOS.consumoTransbordo,
        { consumo_lt: c },
        getDeviceId()
      );
      setSucesso("Consumo transbordo registrado");
    } catch (e) {
      if (e instanceof RegistroImutavelError) {
        setErro(e.message);
        return;
      }
      setErro(e instanceof Error ? e.message : "Erro ao registrar");
    }
  }

  async function onCargasViagens(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSucesso(null);
    const v = Number(viagemNumero);
    const t = Number(toneladas);
    const msg = validateCargasViagens(v, t);
    if (msg) {
      setErro(msg);
      return;
    }
    const payload: Record<string, unknown> = {
      viagem_numero: v,
      toneladas: t,
    };
    if (frenteOrigem.trim()) payload.frente_origem = frenteOrigem.trim();
    if (frenteDestino.trim()) payload.frente_destino = frenteDestino.trim();

    try {
      await enqueueRegistroViagem(
        turno!.id,
        TRANSPORTE_TIPOS.cargasViagens,
        v,
        payload,
        getDeviceId()
      );
      setSucesso(`Viagem ${v} registrada`);
      setToneladas("");
    } catch (e) {
      if (e instanceof RegistroImutavelError) {
        setErro(e.message);
        return;
      }
      setErro(e instanceof Error ? e.message : "Erro ao registrar");
    }
  }

  return (
    <main className="page page-has-footer">
      <SyncStatusBar />
      <PageHeader
        title="Transporte"
        subtitle={`Turno aberto — ${usuario.nome}`}
        backTo="/"
        backLabel="Voltar ao início"
      />

      {erro && <p className="error">{erro}</p>}
      {sucesso && <p className="success">{sucesso}</p>}

      <section className="card" data-testid="form-consumo-transbordo">
        <h2>Consumo transbordo</h2>
        <p className="hint">Obrigatório para fechar o turno (INT-001)</p>
        {statusIndicador(consumoSync) && (
          <p className="hint" data-testid="status-consumo-transbordo">
            {statusIndicador(consumoSync)}
          </p>
        )}
        <form onSubmit={(e) => void onConsumoTransbordo(e)}>
          <label>
            Consumo (L/t)
            <input
              type="number"
              step="0.1"
              min={1}
              max={30}
              value={consumo}
              onChange={(e) => setConsumo(e.target.value)}
              required
              disabled={consumoBloqueado}
            />
          </label>
          <button type="submit" disabled={consumoBloqueado}>
            Registrar consumo transbordo
          </button>
        </form>
      </section>

      <section className="card" data-testid="form-cargas-viagens">
        <h2>Cargas e viagens</h2>
        <p className="hint">Por viagem — opcional no fechamento</p>
        {statusIndicador(viagemAtualReg) && (
          <p className="hint">{statusIndicador(viagemAtualReg)}</p>
        )}
        <form onSubmit={(e) => void onCargasViagens(e)}>
          <label>
            Nº da viagem
            <input
              type="number"
              min={1}
              step={1}
              value={viagemNumero}
              onChange={(e) => setViagemNumero(e.target.value)}
              required
            />
          </label>
          <label>
            Toneladas
            <input
              type="number"
              step="0.1"
              min={0.1}
              value={toneladas}
              onChange={(e) => setToneladas(e.target.value)}
              required
              disabled={viagemBloqueada}
            />
          </label>
          <label>
            Frente origem (opcional)
            <input
              type="text"
              value={frenteOrigem}
              onChange={(e) => setFrenteOrigem(e.target.value)}
              disabled={viagemBloqueada}
            />
          </label>
          <label>
            Frente destino (opcional)
            <input
              type="text"
              value={frenteDestino}
              onChange={(e) => setFrenteDestino(e.target.value)}
              disabled={viagemBloqueada}
            />
          </label>
          <button type="submit" disabled={viagemBloqueada}>
            Registrar viagem
          </button>
        </form>
        {viagensSync.length > 0 && (
          <ul data-testid="viagens-registradas">
            {viagensSync
              .slice()
              .sort((a, b) => (viagemNumeroFromPayload(a) ?? 0) - (viagemNumeroFromPayload(b) ?? 0))
              .map((r) => (
                <li key={r.id}>
                  Viagem {viagemNumeroFromPayload(r) ?? "?"} — {String(r.payload.toneladas)} t —{" "}
                  {r.sync_status}
                </li>
              ))}
          </ul>
        )}
      </section>
      <PageFooter backTo="/" backLabel="Voltar ao início" />
    </main>
  );
}
