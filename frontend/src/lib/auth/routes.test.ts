import { describe, expect, it } from "vitest";
import { postOpenTurnoPath } from "./routes";

describe("postOpenTurnoPath", () => {
  it("colheita vai para consulta", () => {
    expect(postOpenTurnoPath("colheita")).toBe("/colheita");
  });

  it("demais areas vao para home", () => {
    expect(postOpenTurnoPath("transporte")).toBe("/");
  });
});
