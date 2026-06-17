import type { ComparativoPainel } from "@/types/gestao-vista";

export type StatusComparacao = "dentro" | "fora" | "neutro";

/** BR-TRANS-005 — verde/vermelho conforme direção do indicador */
export function comparacaoStatus(
  planejado: number | string | undefined,
  executado: number | string | undefined,
  direcao: "maior_melhor" | "menor_melhor",
  disponibilidade?: string
): StatusComparacao {
  if (disponibilidade && disponibilidade !== "disponivel") {
    return "neutro";
  }
  const p = parseComparable(planejado);
  const e = parseComparable(executado);
  if (p === null || e === null) return "neutro";
  if (direcao === "maior_melhor") {
    return e >= p ? "dentro" : "fora";
  }
  return e <= p ? "dentro" : "fora";
}

export function statusComparativo(comp: ComparativoPainel | undefined, direcao: "maior_melhor" | "menor_melhor") {
  if (!comp) return "neutro" as StatusComparacao;
  return comparacaoStatus(comp.planejado, comp.executado, direcao, comp.disponibilidade);
}

function parseComparable(v: number | string | undefined): number | null {
  if (v === undefined || v === null) return null;
  if (typeof v === "number") return v;
  const s = String(v).trim();
  if (s.includes(":")) {
    const [h, m] = s.split(":");
    const hh = Number(h);
    const mm = Number(m);
    if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
    return hh * 60 + mm;
  }
  const n = Number(s.replace(",", "."));
  return Number.isNaN(n) ? null : n;
}
