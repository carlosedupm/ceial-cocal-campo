import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { getDeviceId, getUsuario, isSessionValid } from "@/lib/auth/session";
import {
  QUALIDADE_TIPOS,
  talhaoCodigoFromPayload,
  validateImpurezas,
  validatePerdasCampo,
} from "@/lib/qualidade/validation";
import { db } from "@/lib/db/schema";
import {
  enqueueRegistroTalhao,
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

export function QualidadePage() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [talhaoImpurezas, setTalhaoImpurezas] = useState("T01");
  const [mineral, setMineral] = useState("2.5");
  const [vegetal, setVegetal] = useState("1.0");
  const [talhaoPerdas, setTalhaoPerdas] = useState("T02");
  const [perdas, setPerdas] = useState("3.5");
  const [pisoteio, setPisoteio] = useState("0");
  const [abaloArranquio, setAbaloArranquio] = useState("0");
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

  const impurezasRegs =
    registrosTurno?.filter((r) => r.tipo === QUALIDADE_TIPOS.impurezas) ?? [];
  const perdasRegs =
    registrosTurno?.filter((r) => r.tipo === QUALIDADE_TIPOS.perdasCampo) ?? [];

  const talhaoImpurezasAtual = talhaoImpurezas.trim();
  const impurezasAtualReg = impurezasRegs.find(
    (r) => talhaoCodigoFromPayload(r.payload) === talhaoImpurezasAtual
  );
  const impurezasBloqueado =
    impurezasAtualReg?.sync_status === "sincronizado" ||
    isSyncConflictPermanent(impurezasAtualReg?.last_error_code);

  const talhaoPerdasAtual = talhaoPerdas.trim();
  const perdasAtualReg = perdasRegs.find(
    (r) => talhaoCodigoFromPayload(r.payload) === talhaoPerdasAtual
  );
  const perdasBloqueado =
    perdasAtualReg?.sync_status === "sincronizado" ||
    isSyncConflictPermanent(perdasAtualReg?.last_error_code);

  useEffect(() => {
    void (async () => {
      const valid = await isSessionValid();
      if (!valid) {
        navigate("/login");
        return;
      }
      const u = await getUsuario();
      if (!u || u.area !== "qualidade") {
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

  async function onImpurezas(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSucesso(null);
    const m = Number(mineral);
    const v = Number(vegetal);
    const msg = validateImpurezas(talhaoImpurezas, m, v);
    if (msg) {
      setErro(msg);
      return;
    }
    const codigo = talhaoImpurezas.trim();
    try {
      await enqueueRegistroTalhao(
        turno!.id,
        QUALIDADE_TIPOS.impurezas,
        codigo,
        {
          talhao_codigo: codigo,
          impureza_mineral_kg_ton: m,
          impureza_vegetal_kg_ton: v,
        },
        getDeviceId()
      );
      setSucesso(`Impurezas registradas — talhão ${codigo}`);
    } catch (e) {
      if (e instanceof RegistroImutavelError) {
        setErro(e.message);
        return;
      }
      setErro(e instanceof Error ? e.message : "Erro ao registrar");
    }
  }

  async function onPerdasCampo(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSucesso(null);
    const p = Number(perdas);
    const pi = Number(pisoteio);
    const a = Number(abaloArranquio);
    const msg = validatePerdasCampo(talhaoPerdas, p, pi, a);
    if (msg) {
      setErro(msg);
      return;
    }
    const codigo = talhaoPerdas.trim();
    try {
      await enqueueRegistroTalhao(
        turno!.id,
        QUALIDADE_TIPOS.perdasCampo,
        codigo,
        {
          talhao_codigo: codigo,
          perdas_pct: p,
          pisoteio_pct: pi,
          abalo_arranquio_pct: a,
        },
        getDeviceId()
      );
      setSucesso(`Perdas registradas — talhão ${codigo}`);
    } catch (e) {
      if (e instanceof RegistroImutavelError) {
        setErro(e.message);
        return;
      }
      setErro(e instanceof Error ? e.message : "Erro ao registrar");
    }
  }

  const avaliacoes = [...impurezasRegs, ...perdasRegs].sort((a, b) =>
    a.created_at.localeCompare(b.created_at)
  );

  return (
    <main className="page">
      <SyncStatusBar />
      <p>
        <Link to="/">← Voltar</Link>
      </p>
      <h1>Qualidade</h1>
      <p className="subtitle">Turno aberto — {usuario.nome}</p>

      {erro && <p className="error">{erro}</p>}
      {sucesso && <p className="success">{sucesso}</p>}

      <section className="card" data-testid="form-impurezas">
        <h2>Impurezas mineral e vegetal</h2>
        <p className="hint">
          Pelo menos uma avaliação de qualidade no turno para fechar (INT-001)
        </p>
        {statusIndicador(impurezasAtualReg) && (
          <p className="hint" data-testid="status-impurezas">
            {statusIndicador(impurezasAtualReg)}
          </p>
        )}
        <form onSubmit={(e) => void onImpurezas(e)}>
          <label>
            Código do talhão
            <input
              type="text"
              value={talhaoImpurezas}
              onChange={(e) => setTalhaoImpurezas(e.target.value)}
              required
              maxLength={20}
              disabled={impurezasBloqueado}
            />
          </label>
          <label>
            Impureza mineral (kg/ton)
            <input
              type="number"
              step="0.1"
              min={0}
              max={50}
              value={mineral}
              onChange={(e) => setMineral(e.target.value)}
              required
              disabled={impurezasBloqueado}
            />
          </label>
          <label>
            Impureza vegetal (kg/ton)
            <input
              type="number"
              step="0.1"
              min={0}
              max={50}
              value={vegetal}
              onChange={(e) => setVegetal(e.target.value)}
              required
              disabled={impurezasBloqueado}
            />
          </label>
          <button type="submit" disabled={impurezasBloqueado}>
            Registrar impurezas
          </button>
        </form>
      </section>

      <section className="card" data-testid="form-perdas-campo">
        <h2>Perdas, pisoteio, abalo e arranquio</h2>
        <p className="hint">Por talhão — opcional se já houver impurezas no turno</p>
        {statusIndicador(perdasAtualReg) && (
          <p className="hint">{statusIndicador(perdasAtualReg)}</p>
        )}
        <form onSubmit={(e) => void onPerdasCampo(e)}>
          <label>
            Código do talhão
            <input
              type="text"
              value={talhaoPerdas}
              onChange={(e) => setTalhaoPerdas(e.target.value)}
              required
              maxLength={20}
              disabled={perdasBloqueado}
            />
          </label>
          <label>
            Perdas (%)
            <input
              type="number"
              step="0.1"
              min={0}
              max={100}
              value={perdas}
              onChange={(e) => setPerdas(e.target.value)}
              required
              disabled={perdasBloqueado}
            />
          </label>
          <label>
            Pisoteio (%)
            <input
              type="number"
              step="0.1"
              min={0}
              max={100}
              value={pisoteio}
              onChange={(e) => setPisoteio(e.target.value)}
              required
              disabled={perdasBloqueado}
            />
          </label>
          <label>
            Abalo e arranquio (%)
            <input
              type="number"
              step="0.1"
              min={0}
              max={100}
              value={abaloArranquio}
              onChange={(e) => setAbaloArranquio(e.target.value)}
              required
              disabled={perdasBloqueado}
            />
          </label>
          <button type="submit" disabled={perdasBloqueado}>
            Registrar perdas
          </button>
        </form>
      </section>

      {avaliacoes.length > 0 && (
        <section className="card">
          <h2>Avaliações do turno</h2>
          <ul data-testid="avaliacoes-registradas">
            {avaliacoes.map((r) => (
              <li key={r.id}>
                {r.tipo} — talhão {talhaoCodigoFromPayload(r.payload) ?? "?"} — {r.sync_status}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
