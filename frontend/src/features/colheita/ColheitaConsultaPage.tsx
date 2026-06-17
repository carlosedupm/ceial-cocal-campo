import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { IndicadorCard } from "@/components/IndicadorCard";
import { PageHeader } from "@/components/PageHeader";
import { PageFooter } from "@/components/PageFooter";
import { SyncStatusBar } from "@/features/sync/SyncStatusBar";
import { getValidAccessToken, getUsuario, isSessionValid } from "@/lib/auth/session";
import { db } from "@/lib/db/schema";
import {
  fetchAndCacheIndicadoresAtual,
  startIndicadoresPull,
  stopIndicadoresPull,
} from "@/lib/indicadores/cache";
import {
  formatHorasCorteValor,
  formatNum,
  getItem,
} from "@/lib/indicadores/display";
import type { IndicadoresTurno } from "@/types/indicadores";

export function ColheitaConsultaPage() {
  const navigate = useNavigate();
  const [dados, setDados] = useState<IndicadoresTurno | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const turno = useLiveQuery(async () => {
    const list = await db.turno_atual.toArray();
    return list[0] ?? null;
  });

  const cached = useLiveQuery(
    async () => (turno?.id ? db.indicadores_cache.get(turno.id) : undefined),
    [turno?.id]
  );

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
      if (u.perfil === "simulador_central") {
        navigate("/simulador");
      }
    })();
  }, [navigate]);

  useEffect(() => {
    if (!turno?.id) return;
    void (async () => {
      setLoading(true);
      setErro(null);
      const token = await getValidAccessToken();
      if (!token) return;
      const row = await fetchAndCacheIndicadoresAtual(token, turno.id);
      if (!row && !cached) {
        setErro("Conecte-se para atualizar os indicadores do seu turno.");
      }
      setDados(row);
      setLoading(false);
    })();
  }, [turno?.id, cached?.atualizado_em]);

  useEffect(() => {
    if (!turno?.id) return;
    startIndicadoresPull(
      () => getValidAccessToken(),
      async () => turno.id
    );
    return () => stopIndicadoresPull();
  }, [turno?.id]);

  if (!turno) {
    return (
      <main className="page page-has-footer">
        <SyncStatusBar />
        <PageHeader
          title="Desempenho do turno"
          subtitle="Consulta somente leitura"
          backTo="/"
          backLabel="Voltar ao início"
        />
        <p>Abra um turno para consultar seu desempenho.</p>
        <PageFooter backTo="/" backLabel="Voltar ao início" />
      </main>
    );
  }

  const snap = dados?.snapshot ?? cached?.snapshot;
  const perf = snap?.performance;
  const qual = snap?.qualidade;
  const metas = snap?.metas ?? {};
  const atualizadoEm = dados?.atualizado_em ?? cached?.atualizado_em;

  return (
    <main className="page page-has-footer" data-testid="colheita-consulta">
      <SyncStatusBar />
      <PageHeader
        title="Desempenho do turno"
        subtitle="Consulta somente leitura — dados do sistema central"
        breadcrumbs={[{ label: "Início", to: "/" }, { label: "Desempenho" }]}
        backTo="/"
        backLabel="Voltar ao início"
      />
      {atualizadoEm && (
        <p className="hint">
          Atualizado em {new Date(atualizadoEm).toLocaleString("pt-BR")}
        </p>
      )}
      {loading && <p>Carregando indicadores...</p>}
      {erro && <p className="error">{erro}</p>}
      {snap && (
        <>
          <section>
            <h2 className="section-title">Performance</h2>
            <div className="indicadores-grid">
              <IndicadorCard
                tituloKey="horas_corte"
                item={getItem(perf, "horas_corte")}
                renderValor={(v) => formatHorasCorteValor(v)}
              />
              <IndicadorCard
                tituloKey="consumo_densidade"
                item={getItem(perf, "consumo_densidade")}
                renderValor={(v) =>
                  `${formatNum(v?.consumo_lt, " L/t")} · ${formatNum(v?.densidade_ton_carga, " ton/carga")}`
                }
                metaKey="consumo_lt"
                metaValor={metas.consumo_lt}
              />
              <IndicadorCard
                tituloKey="entrada_cana"
                item={getItem(perf, "entrada_cana")}
                renderValor={(v) => formatNum(v?.toneladas, " ton")}
                metaKey="toneladas"
                metaValor={metas.toneladas}
              />
            </div>
          </section>
          <section>
            <h2 className="section-title">Qualidade</h2>
            <div className="indicadores-grid">
              <IndicadorCard
                tituloKey="impurezas"
                item={getItem(qual, "impurezas")}
                renderValor={(v) =>
                  `Mineral: ${formatNum(v?.impureza_mineral_kg_ton, " kg/ton")} · Vegetal: ${formatNum(v?.impureza_vegetal_kg_ton, " kg/ton")}`
                }
              />
              <IndicadorCard
                tituloKey="perdas_campo"
                item={getItem(qual, "perdas_campo")}
                renderValor={(v) =>
                  `Perdas: ${formatNum(v?.perdas_pct, "%")} · Pisoteio: ${formatNum(v?.pisoteio_pct, "%")}`
                }
              />
            </div>
          </section>
        </>
      )}
      <PageFooter backTo="/" backLabel="Voltar ao início" />
    </main>
  );
}
