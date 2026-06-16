import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/lib/api/client";
import { getDeviceId, getUsuario, getValidAccessToken, isSessionValid } from "@/lib/auth/session";
import { refreshContextoCatalog } from "@/lib/catalog/contexto-cache";
import {
  COLHEITA_TIPOS,
  formatHorasCorte,
  validateConsumoDensidade,
  validateEntradaCana,
  validateHorasCorte,
} from "@/lib/colheita/validation";
import {
  frenteNomeById,
  getSelectedFrenteId,
  loadFrentesForUsuario,
  setSelectedFrenteId,
} from "@/lib/frente/helpers";
import {
  QUALIDADE_TIPOS,
  validateImpurezas,
} from "@/lib/qualidade/validation";
import { buildIdempotencyKey } from "@/lib/db/schema";
import { SyncStatusBar } from "@/features/sync/SyncStatusBar";
import type { TurnoComUsuario } from "@/types/indicadores";
import type { Usuario } from "@/types/domain";

export function SimuladorPage() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [frentes, setFrentes] = useState<{ id: string; nome: string }[]>([]);
  const [frenteId, setFrenteId] = useState("");
  const [frenteNome, setFrenteNome] = useState("");
  const [turnos, setTurnos] = useState<TurnoComUsuario[]>([]);
  const [turnoId, setTurnoId] = useState("");
  const [semTurnosAlvo, setSemTurnosAlvo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [horas, setHoras] = useState("8");
  const [minutos, setMinutos] = useState("0");
  const [consumo, setConsumo] = useState("8.5");
  const [densidade, setDensidade] = useState("28");
  const [toneladas, setToneladas] = useState("120");
  const [talhao, setTalhao] = useState("T01");
  const [impMin, setImpMin] = useState("2");
  const [impVeg, setImpVeg] = useState("3");
  const [qualidadePendente, setQualidadePendente] = useState(true);

  async function carregarTurnos(u: Usuario, activeFrenteId: string) {
    const token = await getValidAccessToken();
    if (!token || !activeFrenteId) return;
    const list = await api.turnosFrente(token, activeFrenteId);
    const alvos = list.filter((t) => t.usuario_id !== u.id);
    setTurnos(alvos);
    setSemTurnosAlvo(alvos.length === 0);
    setTurnoId(alvos[0]?.id ?? "");
  }

  useEffect(() => {
    void (async () => {
      const valid = await isSessionValid();
      if (!valid) {
        navigate("/login");
        return;
      }
      const u = await getUsuario();
      if (!u || u.perfil !== "simulador_central") {
        navigate("/");
        return;
      }
      setUsuario(u);
      const token = await getValidAccessToken();
      if (token) await refreshContextoCatalog(token);
      const list = await loadFrentesForUsuario(u);
      setFrentes(list);
      const selected = getSelectedFrenteId(u);
      setFrenteId(selected);
      setSelectedFrenteId(selected);
      setFrenteNome(await frenteNomeById(selected));
      await carregarTurnos(u, selected);
    })();
  }, [navigate]);

  async function onFrenteChange(nextId: string) {
    setFrenteId(nextId);
    setSelectedFrenteId(nextId);
    setFrenteNome(await frenteNomeById(nextId));
    if (usuario) await carregarTurnos(usuario, nextId);
  }

  async function ingerir(
    tipo: string,
    payload: Record<string, unknown>,
    idempotencySuffix: string
  ) {
    setErro(null);
    setSucesso(null);
    if (!turnoId) {
      setErro("Selecione um turno alvo.");
      return;
    }
    const token = await getValidAccessToken();
    if (!token) return;
    const id = crypto.randomUUID();
    const item = {
      id,
      turno_id: turnoId,
      tipo,
      idempotency_key: buildIdempotencyKey(turnoId, tipo, idempotencySuffix),
      payload,
      device_id: getDeviceId(),
      evento_at: new Date().toISOString(),
    };
    try {
      await api.syncPush(token, [item]);
      setSucesso(`Indicador ${tipo} ingerido com sucesso.`);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha na ingestão");
    }
  }

  async function ingerirHoras() {
    const h = Number(horas);
    const m = Number(minutos);
    const msg = validateHorasCorte(h, m);
    if (msg) {
      setErro(msg);
      return;
    }
    await ingerir(
      COLHEITA_TIPOS.horasCorte,
      { horas: h, minutos: m, exibicao: formatHorasCorte(h, m), _disponibilidade: "disponivel" },
      "unico"
    );
  }

  async function ingerirConsumo() {
    const c = Number(consumo);
    const d = Number(densidade);
    const msg = validateConsumoDensidade(c, d);
    if (msg) {
      setErro(msg);
      return;
    }
    await ingerir(
      COLHEITA_TIPOS.consumoDensidade,
      { consumo_lt: c, densidade_ton_carga: d, _disponibilidade: "disponivel" },
      "unico"
    );
  }

  async function ingerirEntrada() {
    const t = Number(toneladas);
    const msg = validateEntradaCana(t);
    if (msg) {
      setErro(msg);
      return;
    }
    await ingerir(
      COLHEITA_TIPOS.entradaCana,
      { toneladas: t, _disponibilidade: "disponivel" },
      "unico"
    );
  }

  async function ingerirImpurezas() {
    const mineral = Number(impMin);
    const vegetal = Number(impVeg);
    const payload: Record<string, unknown> = {
      talhao_codigo: talhao,
      impureza_mineral_kg_ton: mineral,
      impureza_vegetal_kg_ton: vegetal,
      _disponibilidade: qualidadePendente ? "em_processamento" : "disponivel",
    };
    if (!qualidadePendente) {
      const msg = validateImpurezas(talhao, mineral, vegetal);
      if (msg) {
        setErro(msg);
        return;
      }
    }
    await ingerir(QUALIDADE_TIPOS.impurezas, payload, talhao);
  }

  async function liberarQualidade() {
    setQualidadePendente(false);
    const mineral = Number(impMin);
    const vegetal = Number(impVeg);
    const msg = validateImpurezas(talhao, mineral, vegetal);
    if (msg) {
      setErro(msg);
      return;
    }
    await ingerir(
      QUALIDADE_TIPOS.impurezas,
      {
        talhao_codigo: talhao,
        impureza_mineral_kg_ton: mineral,
        impureza_vegetal_kg_ton: vegetal,
        _disponibilidade: "disponivel",
      },
      `${talhao}-liberado`
    );
  }

  return (
    <main className="page" data-testid="simulador-page">
      <SyncStatusBar />
      <p className="banner-simulador">Modo simulação — ingestão como sistema central</p>
      <PageHeader
        title="Simulador central"
        subtitle={frenteNome ? `Frente: ${frenteNome}` : undefined}
        breadcrumbs={[{ label: "Início", to: "/" }, { label: "Simulador" }]}
      />
      {frentes.length > 1 && (
        <section className="card">
          <label>
            Frente
            <select value={frenteId} onChange={(e) => void onFrenteChange(e.target.value)}>
              {frentes.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nome}
                </option>
              ))}
            </select>
          </label>
        </section>
      )}
      <section className="card">
        <label>
          Turno alvo
          <select value={turnoId} onChange={(e) => setTurnoId(e.target.value)} disabled={semTurnosAlvo}>
            {turnos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.usuario_nome} — {t.usuario_area} — {new Date(t.inicio).toLocaleString("pt-BR")}
              </option>
            ))}
          </select>
        </label>
        {semTurnosAlvo && (
          <p className="error">
            Nenhum turno aberto de outro profissional nesta frente. O operador deve abrir o turno antes da ingestão.
          </p>
        )}
      </section>
      {erro && <p className="error">{erro}</p>}
      {sucesso && <p className="success">{sucesso}</p>}
      <section className="card">
        <h2>Performance (colheita)</h2>
        <div className="form-row">
          <label>
            Horas
            <input type="number" value={horas} onChange={(e) => setHoras(e.target.value)} aria-label="horas" />
          </label>
          <label>
            Minutos
            <input type="number" value={minutos} onChange={(e) => setMinutos(e.target.value)} aria-label="minutos" />
          </label>
          <button type="button" onClick={() => void ingerirHoras()}>Horas de corte</button>
        </div>
        <div className="form-row">
          <label>
            Consumo (L/t)
            <input type="number" step="0.1" value={consumo} onChange={(e) => setConsumo(e.target.value)} />
          </label>
          <label>
            Densidade (ton/carga)
            <input type="number" step="0.1" value={densidade} onChange={(e) => setDensidade(e.target.value)} />
          </label>
          <button type="button" onClick={() => void ingerirConsumo()}>Consumo + densidade</button>
        </div>
        <div className="form-row">
          <label>
            Entrada (ton)
            <input type="number" value={toneladas} onChange={(e) => setToneladas(e.target.value)} />
          </label>
          <button type="button" onClick={() => void ingerirEntrada()}>Entrada de cana</button>
        </div>
      </section>
      <section className="card">
        <h2>Qualidade</h2>
        <div className="form-row">
          <label>
            Talhão
            <input value={talhao} onChange={(e) => setTalhao(e.target.value)} />
          </label>
          <label>
            Imp. mineral (kg/ton)
            <input type="number" step="0.1" value={impMin} onChange={(e) => setImpMin(e.target.value)} />
          </label>
          <label>
            Imp. vegetal (kg/ton)
            <input type="number" step="0.1" value={impVeg} onChange={(e) => setImpVeg(e.target.value)} />
          </label>
        </div>
        <label>
          <input type="checkbox" checked={qualidadePendente} onChange={(e) => setQualidadePendente(e.target.checked)} />
          Simular em processamento na usina
        </label>
        <button type="button" onClick={() => void ingerirImpurezas()}>Ingerir impurezas</button>
        <button type="button" className="secondary" onClick={() => void liberarQualidade()}>
          Liberar qualidade (disponível)
        </button>
      </section>
      <Link to="/">Voltar</Link>
    </main>
  );
}
