import { describe, expect, it } from "vitest";
import {
  validateConsumoDensidade,
  validateEntradaCana,
  validateHorasCorte,
} from "./validation";

describe("colheita validation BRF-002", () => {
  it("aceita horas de corte válidas", () => {
    expect(validateHorasCorte(8, 30)).toBeNull();
  });

  it("rejeita horas zero", () => {
    expect(validateHorasCorte(0, 0)).not.toBeNull();
  });

  it("rejeita consumo fora da faixa", () => {
    expect(validateConsumoDensidade(0.1, 25)).not.toBeNull();
  });

  it("aceita entrada de cana válida", () => {
    expect(validateEntradaCana(120)).toBeNull();
  });
});
