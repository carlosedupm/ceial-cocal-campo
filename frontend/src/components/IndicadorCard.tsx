import {
  badgeClass,
  labelDisponibilidade,
  labelIndicador,
  metaComparacao,
} from "@/lib/indicadores/display";

export function IndicadorCard({
  tituloKey,
  item,
  renderValor,
  metaKey,
  metaValor,
  variant = "default",
}: {
  tituloKey: string;
  item?: { valor?: Record<string, unknown>; disponibilidade: string };
  renderValor: (valor?: Record<string, unknown>) => string;
  metaKey?: string;
  metaValor?: unknown;
  variant?: "default" | "hero";
}) {
  const titulo = labelIndicador(tituloKey);
  const cardClass = `card indicador-card${variant === "hero" ? " hero" : ""}`;

  if (!item) {
    return (
      <div className={cardClass} data-testid={`indicador-${tituloKey}`}>
        <h3>{titulo}</h3>
        <p className="subtitle">Aguardando dados do sistema central</p>
      </div>
    );
  }

  const disp = item.disponibilidade as "disponivel" | "em_processamento" | "indisponivel";
  const showValor = disp === "disponivel";
  const cmp =
    showValor && metaKey && typeof item.valor?.[metaKey] === "number"
      ? metaComparacao(item.valor[metaKey] as number, metaValor)
      : null;

  return (
    <div className={cardClass} data-testid={`indicador-${tituloKey}`}>
      <h3>{titulo}</h3>
      <span className={badgeClass(disp)}>{labelDisponibilidade(disp)}</span>
      {showValor ? (
        <>
          <p className="indicador-valor">{renderValor(item.valor)}</p>
          {cmp && (
            <p className={cmp === "dentro" ? "meta-ok" : "meta-warn"}>
              {cmp === "dentro" ? "Dentro da meta" : "Fora da meta"}
            </p>
          )}
        </>
      ) : (
        <p className="subtitle">
          {disp === "em_processamento"
            ? "Dados em processamento na usina — consulte novamente mais tarde."
            : "Indicador indisponível no momento."}
        </p>
      )}
    </div>
  );
}
