import type { HorizontePainel } from "@/types/gestao-vista";

const INDICADOR_LABELS: Record<string, string> = {
  entrada_cana: "Entrada de cana de açúcar",
  densidade: "Densidade",
  atr: "ATR",
  horas_corte: "Horas de corte",
  consumo_transbordo: "Consumo transbordo",
  consumo_colhedora: "Consumo colhedora",
  impureza_mineral: "Impureza mineral",
  impureza_vegetal: "Impureza vegetal",
  perdas: "Perdas",
  pisoteio: "Pisoteio",
  abalo_arranquio: "Abalo e arranquio",
};

const HORIZONTE_LABELS: Record<HorizontePainel, string> = {
  diario: "Diário",
  semanal: "Semanal",
  safra: "Safra",
};

export const PERFORMANCE_KEYS = [
  "entrada_cana",
  "densidade",
  "atr",
  "horas_corte",
  "consumo_transbordo",
  "consumo_colhedora",
] as const;

export const QUALIDADE_KEYS = [
  "impureza_mineral",
  "impureza_vegetal",
  "perdas",
  "pisoteio",
  "abalo_arranquio",
] as const;

export function labelIndicadorPainel(key: string): string {
  return INDICADOR_LABELS[key] ?? key.replace(/_/g, " ");
}

export function labelHorizonte(h: HorizontePainel): string {
  return HORIZONTE_LABELS[h];
}

export function formatValorPainel(val: number | string | undefined, unidade?: string): string {
  if (val === undefined || val === null) return "—";
  if (typeof val === "number") {
    const formatted = Number.isInteger(val)
      ? val.toLocaleString("pt-BR")
      : val.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return unidade ? `${formatted} ${unidade}` : formatted;
  }
  return unidade ? `${val} ${unidade}` : String(val);
}

export function horizontesIndicador(key: string): HorizontePainel[] {
  if (key === "consumo_transbordo" || key === "consumo_colhedora") {
    return ["semanal", "safra"];
  }
  if (key === "perdas" || key === "pisoteio" || key === "abalo_arranquio") {
    return ["semanal", "safra"];
  }
  return ["diario", "safra"];
}
