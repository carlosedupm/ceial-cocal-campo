/** BR-COLHEITA-* — validação MVP (BRF-002 seção 5). */
export const COLHEITA_TIPOS = {
  horasCorte: "horas_corte",
  consumoDensidade: "consumo_densidade",
  entradaCana: "entrada_cana",
} as const;

export const CONSUMO_MIN_LT = 0.5;
export const CONSUMO_MAX_LT = 15;
export const DENSIDADE_MIN = 20;
export const DENSIDADE_MAX = 35;
export const ENTRADA_CANA_MAX_TON = 5000;

export const OBRIGATORIOS_COLHEITA = [COLHEITA_TIPOS.horasCorte] as const;

export function validateHorasCorte(horas: number, minutos: number): string | null {
  if (!Number.isInteger(horas) || !Number.isInteger(minutos)) {
    return "Horas e minutos devem ser números inteiros";
  }
  if (horas < 0 || horas > 24 || minutos < 0 || minutos > 59) {
    return "Horas de corte fora da faixa permitida";
  }
  if (horas === 0 && minutos === 0) {
    return "Informe um tempo maior que zero";
  }
  return null;
}

export function validateConsumoDensidade(consumo: number, densidade: number): string | null {
  if (Number.isNaN(consumo) || Number.isNaN(densidade)) {
    return "Valores inválidos";
  }
  if (consumo < CONSUMO_MIN_LT || consumo > CONSUMO_MAX_LT) {
    return `Consumo deve estar entre ${CONSUMO_MIN_LT} e ${CONSUMO_MAX_LT} L/t`;
  }
  if (densidade < DENSIDADE_MIN || densidade > DENSIDADE_MAX) {
    return `Densidade deve estar entre ${DENSIDADE_MIN} e ${DENSIDADE_MAX} ton/carga`;
  }
  return null;
}

export function validateEntradaCana(toneladas: number): string | null {
  if (Number.isNaN(toneladas) || toneladas <= 0 || toneladas > ENTRADA_CANA_MAX_TON) {
    return "Toneladas fora da faixa permitida";
  }
  return null;
}

export function formatHorasCorte(horas: number, minutos: number): string {
  return `${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}`;
}
