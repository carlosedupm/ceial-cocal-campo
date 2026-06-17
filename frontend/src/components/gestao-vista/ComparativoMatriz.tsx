import { statusComparativo } from "@/lib/gestao-vista/comparacao";
import {
  formatValorPainel,
  horizontesIndicador,
  labelHorizonte,
  labelIndicadorPainel,
} from "@/lib/gestao-vista/display";
import type { HorizontePainel, IndicadorPainel } from "@/types/gestao-vista";

function HorizonteCell({
  indicadorKey,
  horizonte,
  indicador,
  compact,
}: {
  indicadorKey: string;
  horizonte: HorizontePainel;
  indicador: IndicadorPainel;
  compact?: boolean;
}) {
  const comp = indicador.horizontes[horizonte];
  const status = statusComparativo(comp, indicador.direcao);
  const suffix = indicador.unidade_medida === "%" ? "%" : undefined;
  const exClass =
    status === "dentro" ? "cmp-dentro" : status === "fora" ? "cmp-fora" : "cmp-neutro";

  return (
    <td className={compact ? "gestao-horizonte-cell compact" : "gestao-horizonte-cell"}>
      <span className="gestao-horizonte-tag">{labelHorizonte(horizonte)}</span>
      <div className="gestao-par-valores">
        <span className="gestao-valor-pl" title="Planejado">
          {formatValorPainel(comp?.planejado, suffix)}
        </span>
        <span
          className={`gestao-valor-ex ${exClass}`}
          title="Executado"
          data-testid={`indicador-painel-${indicadorKey}-${horizonte}`}
        >
          {formatValorPainel(comp?.executado, suffix)}
        </span>
      </div>
    </td>
  );
}

function IndicadorCardMobile({
  indicadorKey,
  indicador,
}: {
  indicadorKey: string;
  indicador: IndicadorPainel;
}) {
  const horizontes = horizontesIndicador(indicadorKey);
  const suffix = indicador.unidade_medida === "%" ? "%" : undefined;

  return (
    <article className="gestao-indicador-card" data-testid={`indicador-card-${indicadorKey}`}>
      <header>
        <strong>{labelIndicadorPainel(indicadorKey)}</strong>
        <span className="gestao-unidade-medida">{indicador.unidade_medida}</span>
      </header>
      <div className="gestao-card-horizontes">
        {horizontes.map((h) => {
          const comp = indicador.horizontes[h];
          const status = statusComparativo(comp, indicador.direcao);
          const exClass =
            status === "dentro" ? "cmp-dentro" : status === "fora" ? "cmp-fora" : "cmp-neutro";
          return (
            <div key={h} className="gestao-card-horizonte">
              <span className="gestao-horizonte-tag">{labelHorizonte(h)}</span>
              <div className="gestao-par-valores">
                <span className="gestao-valor-pl">{formatValorPainel(comp?.planejado, suffix)}</span>
                <span
                  className={`gestao-valor-ex ${exClass}`}
                  data-testid={`indicador-painel-${indicadorKey}-${h}`}
                >
                  {formatValorPainel(comp?.executado, suffix)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}

export function ComparativoMatriz({
  titulo,
  indicadores,
  keys,
  compact = false,
}: {
  titulo: string;
  indicadores: Record<string, IndicadorPainel>;
  keys: readonly string[];
  compact?: boolean;
}) {
  const presentKeys = keys.filter((k) => indicadores[k]);
  if (presentKeys.length === 0) return null;

  return (
    <section
      className={`card gestao-comparativo ${compact ? "compact" : ""}`}
      data-testid={`comparativo-${titulo.toLowerCase()}`}
    >
      <h2 className="gestao-panel-title">{titulo}</h2>

      <div className="gestao-matriz-desktop">
        <table className={`gestao-matriz ${compact ? "compact" : ""}`}>
          <thead>
            <tr>
              <th scope="col">Indicador</th>
              <th scope="col">Planejado → Executado</th>
              <th scope="col">Planejado → Executado</th>
            </tr>
          </thead>
          <tbody>
            {presentKeys.map((key) => {
              const ind = indicadores[key];
              const horizontes = horizontesIndicador(key);
              return (
                <tr key={key}>
                  <th scope="row" className="gestao-indicador-nome">
                    {labelIndicadorPainel(key)}
                    <span className="gestao-unidade-medida">{ind.unidade_medida}</span>
                  </th>
                  {horizontes.map((h) => (
                    <HorizonteCell
                      key={h}
                      indicadorKey={key}
                      horizonte={h}
                      indicador={ind}
                      compact={compact}
                    />
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="gestao-matriz-mobile">
        {presentKeys.map((key) => (
          <IndicadorCardMobile key={key} indicadorKey={key} indicador={indicadores[key]} />
        ))}
      </div>
    </section>
  );
}
