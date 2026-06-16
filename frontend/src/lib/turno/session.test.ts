import { describe, expect, it } from "vitest";
import { turnoMatchesUsuario } from "@/lib/turno/session";
import type { Turno, Usuario } from "@/types/domain";

const usuario: Usuario = {
  id: "u1",
  email: "a@b.c",
  nome: "Test",
  perfil: "operador_colheita",
  area: "colheita",
  unidade_ids: [],
  frente_ids: [],
};

const turno: Turno = {
  id: "t1",
  usuario_id: "u1",
  unidade_id: "un1",
  frente_id: "fr1",
  area: "colheita",
  status: "aberto",
  inicio: "2026-06-16T00:00:00.000Z",
};

describe("turnoMatchesUsuario", () => {
  it("aceita turno do mesmo usuário", () => {
    expect(turnoMatchesUsuario(turno, usuario)).toBe(true);
  });

  it("rejeita turno de outro usuário", () => {
    expect(turnoMatchesUsuario({ ...turno, usuario_id: "u2" }, usuario)).toBe(false);
  });
});
