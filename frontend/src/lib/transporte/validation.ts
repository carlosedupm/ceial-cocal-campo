/** BR-TRANSPORTE-* — validação MVP (BRF-003 seção 5/7). */
export const TRANSPORTE_TIPOS = {
  consumoTransbordo: "consumo_transbordo",
  cargasViagens: "cargas_viagens",
} as const;

export const CONSUMO_TRANSBORDO_MIN_LT = 1;
export const CONSUMO_TRANSBORDO_MAX_LT = 30;
export const CARGAS_VIAGENS_MAX_TON = 5000;

export const OBRIGATORIOS_TRANSPORTE = [TRANSPORTE_TIPOS.consumoTransbordo] as const;

export function validateConsumoTransbordo(consumo: number): string | null {
  if (Number.isNaN(consumo)) {
    return "Valor inválido";
  }
  if (consumo < CONSUMO_TRANSBORDO_MIN_LT || consumo > CONSUMO_TRANSBORDO_MAX_LT) {
    return `Consumo deve estar entre ${CONSUMO_TRANSBORDO_MIN_LT} e ${CONSUMO_TRANSBORDO_MAX_LT} L/t`;
  }
  return null;
}

export function validateCargasViagens(
  viagemNumero: number,
  toneladas: number
): string | null {
  if (!Number.isInteger(viagemNumero) || viagemNumero < 1) {
    return "Número da viagem deve ser inteiro ≥ 1";
  }
  if (Number.isNaN(toneladas) || toneladas <= 0 || toneladas > CARGAS_VIAGENS_MAX_TON) {
    return "Toneladas fora da faixa permitida";
  }
  return null;
}

export function idempotencyKeyViagem(turnoId: string, viagemNumero: number): string {
  return `${turnoId}:${TRANSPORTE_TIPOS.cargasViagens}:${viagemNumero}`;
}
