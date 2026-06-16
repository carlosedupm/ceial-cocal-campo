import { describe, expect, it } from "vitest";
import {
  validateImpurezas,
  validatePerdasCampo,
  validateTalhaoCodigo,
  idempotencyKeyTalhao,
  QUALIDADE_TIPOS,
} from "./validation";

describe("qualidade validation BRF-004", () => {
  it("aceita impurezas válidas", () => {
    expect(validateImpurezas("T01", 2.5, 1.0)).toBeNull();
  });

  it("rejeita talhão inválido", () => {
    expect(validateTalhaoCodigo("")).not.toBeNull();
    expect(validateTalhaoCodigo("talhão com espaço")).not.toBeNull();
  });

  it("rejeita impureza fora da faixa", () => {
    expect(validateImpurezas("T01", 55, 0)).not.toBeNull();
  });

  it("aceita perdas_campo válidas", () => {
    expect(validatePerdasCampo("T02", 3.5, 0, 0)).toBeNull();
  });

  it("rejeita percentual fora da faixa", () => {
    expect(validatePerdasCampo("T02", 101, 0, 0)).not.toBeNull();
  });

  it("monta chave idempotência por talhão", () => {
    expect(idempotencyKeyTalhao("t1", QUALIDADE_TIPOS.impurezas, "T01")).toBe(
      "t1:impurezas:T01"
    );
  });
});
