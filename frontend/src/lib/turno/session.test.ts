import "fake-indexeddb/auto";
import { afterEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db/schema";
import { purgeOrphanRegistros, turnoMatchesUsuario } from "@/lib/turno/session";
import type { Turno, Usuario } from "@/types/domain";
import { ERR_CODES } from "@/types/domain";

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

describe("purgeOrphanRegistros", () => {
  afterEach(async () => {
    await db.registros.clear();
  });

  it("remove pendentes de outros turnos", async () => {
    await db.registros.bulkPut([
      {
        id: "r-atual",
        turno_id: "t-atual",
        tipo: "horas_corte",
        idempotency_key: "t-atual:horas_corte:unico",
        payload: { horas: 8, minutos: 0 },
        device_id: "dev",
        evento_at: "2026-06-16T00:00:00.000Z",
        sync_status: "pendente",
        created_at: "2026-06-16T00:00:00.000Z",
      },
      {
        id: "r-antigo",
        turno_id: "t-antigo",
        tipo: "horas_corte",
        idempotency_key: "t-antigo:horas_corte:unico",
        payload: { horas: 4, minutos: 0 },
        device_id: "dev",
        evento_at: "2026-06-15T00:00:00.000Z",
        sync_status: "erro",
        last_error_code: ERR_CODES.TMP002,
        created_at: "2026-06-15T00:00:00.000Z",
      },
    ]);

    const removed = await purgeOrphanRegistros("t-atual");
    expect(removed).toBe(1);
    expect(await db.registros.get("r-atual")).toBeDefined();
    expect(await db.registros.get("r-antigo")).toBeUndefined();
  });
});
