import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { CocalDatabase } from "./schema";

describe("CocalDatabase schema", () => {
  let db: CocalDatabase;

  beforeEach(() => {
    db = new CocalDatabase();
  });

  afterEach(async () => {
    await db.delete();
  });

  it("ordena registros por created_at decrescente", async () => {
    await db.registros.bulkPut([
      {
        id: "r1",
        turno_id: "t1",
        tipo: "placeholder",
        idempotency_key: "t1:placeholder:r1",
        payload: {},
        device_id: "dev",
        evento_at: "2026-06-01T10:00:00.000Z",
        sync_status: "pendente",
        created_at: "2026-06-01T10:00:00.000Z",
      },
      {
        id: "r2",
        turno_id: "t1",
        tipo: "placeholder",
        idempotency_key: "t1:placeholder:r2",
        payload: {},
        device_id: "dev",
        evento_at: "2026-06-01T12:00:00.000Z",
        sync_status: "sincronizado",
        created_at: "2026-06-01T12:00:00.000Z",
      },
    ]);

    const ordered = await db.registros.orderBy("created_at").reverse().toArray();
    expect(ordered.map((r) => r.id)).toEqual(["r2", "r1"]);
  });

  it("expõe stores unidades e frentes (schema v3)", async () => {
    await db.unidades.put({ id: "u1", nome: "Teste" });
    await db.frentes.put({ id: "f1", unidade_id: "u1", nome: "Frente 1" });
    expect(await db.unidades.count()).toBe(1);
    expect(await db.frentes.where("unidade_id").equals("u1").count()).toBe(1);
  });
});
