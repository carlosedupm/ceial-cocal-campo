import { statusComparativo } from "@/lib/gestao-vista/comparacao";
import {
  formatValorPainel,
  horizontesIndicador,
  labelHorizonte,
  labelIndicadorPainel,
} from "@/lib/gestao-vista/display";
import type { ComparativoPainel, HorizontePainel, IndicadorPainel } from "@/types/gestao-vista";

function ParValoresHorizonte({
  indicadorKey,
  horizonte,
  comp,
  suffix,
  exClass,
  variant = "table",
}: {
  indicadorKey: string;
  horizonte: HorizontePainel;
  comp: ComparativoPainel | undefined;
  suffix: string | undefined;
  exClass: string;
  variant?: "table" | "tile";
}) {
  const executado = formatValorPainel(comp?.executado, suffix);
  const planejado = formatValorPainel(comp?.planejado, suffix);
  const testId = `indicador-painel-${indicadorKey}-${horizonte}`;

  if (variant === "tile") {
    return (
      <>
        <span
          className={`gestao-valor-ex gestao-valor-ex-hero ${exClass}`}
          title="Executado"
          data-testid={testId}
        >
          {executado}
        </span>
        <span className="gestao-valor-pl gestao-valor-pl-sub" title="Planejado">
          <span className="gestao-valor-rotulo">Planejado: </span>
          {planejado}
        </span>
      </>
    );
  }

  return (
    <div className="gestao-par-valores">
      <span className={`gestao-valor-ex ${exClass}`} title="Executado" data-testid={testId}>
        <span className="gestao-valor-rotulo">Executado: </span>
        {executado}
      </span>
      <span className="gestao-valor-pl" title="Planejado">
        <span className="gestao-valor-rotulo">Planejado: </span>
        {planejado}
      </span>
    </div>
  );
}

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
      <ParValoresHorizonte
        indicadorKey={indicadorKey}
        horizonte={horizonte}
        comp={comp}
        suffix={suffix}
        exClass={exClass}
      />
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
      <div
        className={`gestao-card-horizontes gestao-card-horizontes-cols-${horizontes.length}`}
      >
        {horizontes.map((h) => {
          const comp = indicador.horizontes[h];
          const status = statusComparativo(comp, indicador.direcao);
          const exClass =
            status === "dentro" ? "cmp-dentro" : status === "fora" ? "cmp-fora" : "cmp-neutro";
          return (
            <div key={h} className="gestao-card-horizonte gestao-card-horizonte-tile">
              <span className="gestao-horizonte-tag">{labelHorizonte(h)}</span>
              <ParValoresHorizonte
                indicadorKey={indicadorKey}
                horizonte={h}
                comp={comp}
                suffix={suffix}
                exClass={exClass}
                variant="tile"
              />
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
              <th scope="col">Executado / Planejado</th>
              <th scope="col">Executado / Planejado</th>
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
