import { describe, expect, it } from "vitest";
import {
  validateCargasViagens,
  validateConsumoTransbordo,
  idempotencyKeyViagem,
} from "./validation";

describe("transporte validation BRF-003", () => {
  it("aceita consumo transbordo válido", () => {
    expect(validateConsumoTransbordo(12.5)).toBeNull();
  });

  it("rejeita consumo fora da faixa", () => {
    expect(validateConsumoTransbordo(0.5)).not.toBeNull();
  });

  it("aceita cargas/viagens válidas", () => {
    expect(validateCargasViagens(1, 28.5)).toBeNull();
  });

  it("rejeita toneladas fora da faixa", () => {
    expect(validateCargasViagens(2, 6000)).not.toBeNull();
  });

  it("monta chave idempotência por viagem", () => {
    expect(idempotencyKeyViagem("t1", 3)).toBe("t1:cargas_viagens:3");
  });
});
