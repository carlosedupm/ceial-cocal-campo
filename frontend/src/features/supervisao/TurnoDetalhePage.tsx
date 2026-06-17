import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { IndicadorCard } from "@/components/IndicadorCard";
import { PageFooter } from "@/components/PageFooter";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/lib/api/client";
import { getValidAccessToken, getUsuario, isSessionValid } from "@/lib/auth/session";
import { fetchAndCacheIndicadoresTurno } from "@/lib/indicadores/cache";
import {
  formatHorasCorteValor,
  formatNum,
  getItem,
} from "@/lib/indicadores/display";
import { labelArea } from "@/lib/ui/labels";
import { getSelectedFrenteId } from "@/lib/frente/helpers";
import { SyncStatusBar } from "@/features/sync/SyncStatusBar";
import type { IndicadoresTurno, TurnoComUsuario } from "@/types/indicadores";

export function TurnoDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [turno, setTurno] = useState<TurnoComUsuario | null>(null);
  const [dados, setDados] = useState<IndicadoresTurno | null>(null);

  useEffect(() => {
    if (!id) return;
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
      if (!token) return;
      const frenteId = getSelectedFrenteId(u, searchParams.get("frente"));
      if (frenteId) {
        const turnos = await api.turnosFrente(token, frenteId);
        setTurno(turnos.find((t) => t.id === id) ?? null);
      }
      const row = await fetchAndCacheIndicadoresTurno(token, id);
      setDados(row);
    })();
  }, [id, navigate, searchParams]);

  const snap = dados?.snapshot;
  const perf = snap?.performance;
  const qual = snap?.qualidade;
  const metas = snap?.metas ?? {};
  const frenteQuery = searchParams.get("frente");
  const painelLink = frenteQuery ? `/supervisao?frente=${frenteQuery}` : "/supervisao";

  return (
    <main className="page page-has-footer" data-testid="turno-detalhe">
      <SyncStatusBar />
      <PageHeader
        title={`Turno — ${turno?.usuario_nome ?? "..."}`}
        subtitle={`Setor: ${turno ? labelArea(turno.usuario_area) : "..."} · Somente leitura`}
        breadcrumbs={[
          { label: "Início", to: "/" },
          { label: "Painel da frente", to: painelLink },
          { label: turno?.usuario_nome ?? "Detalhe" },
        ]}
        backTo={painelLink}
        backLabel="Voltar ao painel"
      />
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
      {!snap && <p className="subtitle">Aguardando dados do sistema central.</p>}
      <PageFooter backTo={painelLink} backLabel="Voltar ao painel" />
    </main>
  );
}
