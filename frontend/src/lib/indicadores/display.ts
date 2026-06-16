import type { DisponibilidadeIndicador, IndicadorItem } from "@/types/indicadores";

const INDICADOR_LABELS: Record<string, string> = {
  horas_corte: "Horas de corte",
  consumo_densidade: "Consumo e densidade",
  entrada_cana: "Entrada de cana",
  impurezas: "Impurezas",
  perdas_campo: "Perdas e pisoteio",
};

export function labelIndicador(key: string): string {
  return INDICADOR_LABELS[key] ?? key.replace(/_/g, " ");
}

export function labelDisponibilidade(d: DisponibilidadeIndicador): string {
  switch (d) {
    case "disponivel":
      return "Disponível";
    case "em_processamento":
      return "Em processamento na usina";
    case "indisponivel":
      return "Indisponível";
    case "erro_integracao":
      return "Erro de integração";
    default:
      return d;
  }
}

export function badgeClass(d: DisponibilidadeIndicador): string {
  if (d === "disponivel") return "badge-ok";
  if (d === "em_processamento") return "badge-warn";
  return "badge-muted";
}

export function formatHorasCorteValor(valor?: Record<string, unknown>): string {
  if (!valor) return "—";
  const exibicao = valor.exibicao;
  if (typeof exibicao === "string") return exibicao;
  const h = valor.horas ?? 0;
  const m = valor.minutos ?? 0;
  return `${h}h ${String(m).padStart(2, "0")}min`;
}

export function formatNum(val: unknown, suffix = ""): string {
  if (val === undefined || val === null) return "—";
  if (typeof val === "number") return `${val}${suffix}`;
  return String(val);
}

export function metaComparacao(
  executado: number | undefined,
  meta: unknown
): "dentro" | "fora" | null {
  if (executado === undefined || meta === undefined || meta === null) return null;
  const m = typeof meta === "number" ? meta : Number(meta);
  if (Number.isNaN(m)) return null;
  return executado <= m ? "dentro" : "fora";
}

export function getItem(
  section: Record<string, IndicadorItem> | undefined,
  key: string
): IndicadorItem | undefined {
  return section?.[key];
}
