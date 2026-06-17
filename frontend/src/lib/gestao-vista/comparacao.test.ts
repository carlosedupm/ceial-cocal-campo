import { describe, expect, it } from "vitest";
import { comparacaoStatus } from "./comparacao";

describe("comparacaoStatus — BR-TRANS-005", () => {
  it("maior_melhor: executado >= planejado → dentro", () => {
    expect(comparacaoStatus(100, 120, "maior_melhor")).toBe("dentro");
    expect(comparacaoStatus(100, 80, "maior_melhor")).toBe("fora");
  });

  it("menor_melhor: executado <= planejado → dentro", () => {
    expect(comparacaoStatus(0.8, 0.65, "menor_melhor")).toBe("dentro");
    expect(comparacaoStatus(0.8, 0.84, "menor_melhor")).toBe("fora");
  });

  it("em_processamento → neutro", () => {
    expect(comparacaoStatus(9, 0, "menor_melhor", "em_processamento")).toBe("neutro");
  });
});
