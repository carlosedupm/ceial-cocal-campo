/** BR-QUALIDADE-* — validação MVP (BRF-004 seção 5/7). */
export const QUALIDADE_TIPOS = {
  impurezas: "impurezas",
  perdasCampo: "perdas_campo",
} as const;

export const IMPUREZA_MIN_KG_TON = 0;
export const IMPUREZA_MAX_KG_TON = 50;
export const PERCENTUAL_MIN = 0;
export const PERCENTUAL_MAX = 100;
export const TALHAO_CODIGO_MAX_LEN = 20;
const TALHAO_CODIGO_RE = /^[A-Za-z0-9_-]+$/;

export const OBRIGATORIOS_QUALIDADE = [
  QUALIDADE_TIPOS.impurezas,
  QUALIDADE_TIPOS.perdasCampo,
] as const;

export function validateTalhaoCodigo(codigo: string): string | null {
  const trimmed = codigo.trim();
  if (!trimmed || trimmed.length > TALHAO_CODIGO_MAX_LEN) {
    return "Código do talhão inválido (1–20 caracteres)";
  }
  if (!TALHAO_CODIGO_RE.test(trimmed)) {
    return "Código do talhão: use letras, números, _ ou -";
  }
  return null;
}

export function validateImpurezas(
  talhaoCodigo: string,
  mineral: number,
  vegetal: number
): string | null {
  const talhaoMsg = validateTalhaoCodigo(talhaoCodigo);
  if (talhaoMsg) return talhaoMsg;
  if (Number.isNaN(mineral) || Number.isNaN(vegetal)) {
    return "Valores inválidos";
  }
  if (mineral < IMPUREZA_MIN_KG_TON || mineral > IMPUREZA_MAX_KG_TON) {
    return `Impureza mineral deve estar entre ${IMPUREZA_MIN_KG_TON} e ${IMPUREZA_MAX_KG_TON} kg/ton`;
  }
  if (vegetal < IMPUREZA_MIN_KG_TON || vegetal > IMPUREZA_MAX_KG_TON) {
    return `Impureza vegetal deve estar entre ${IMPUREZA_MIN_KG_TON} e ${IMPUREZA_MAX_KG_TON} kg/ton`;
  }
  if (mineral <= 0 && vegetal <= 0) {
    return "Informe ao menos uma impureza maior que zero";
  }
  return null;
}

export function validatePerdasCampo(
  talhaoCodigo: string,
  perdas: number,
  pisoteio: number,
  abaloArranquio: number
): string | null {
  const talhaoMsg = validateTalhaoCodigo(talhaoCodigo);
  if (talhaoMsg) return talhaoMsg;
  if (Number.isNaN(perdas) || Number.isNaN(pisoteio) || Number.isNaN(abaloArranquio)) {
    return "Valores inválidos";
  }
  for (const [label, val] of [
    ["Perdas", perdas],
    ["Pisoteio", pisoteio],
    ["Abalo e arranquio", abaloArranquio],
  ] as const) {
    if (val < PERCENTUAL_MIN || val > PERCENTUAL_MAX) {
      return `${label} deve estar entre ${PERCENTUAL_MIN} e ${PERCENTUAL_MAX}%`;
    }
  }
  if (perdas <= 0 && pisoteio <= 0 && abaloArranquio <= 0) {
    return "Informe ao menos um percentual maior que zero";
  }
  return null;
}

export function idempotencyKeyTalhao(
  turnoId: string,
  tipo: string,
  talhaoCodigo: string
): string {
  return `${turnoId}:${tipo}:${talhaoCodigo.trim()}`;
}

export function talhaoCodigoFromPayload(payload: Record<string, unknown>): string | null {
  const c = payload.talhao_codigo;
  if (typeof c === "string" && c.trim()) return c.trim();
  return null;
}
