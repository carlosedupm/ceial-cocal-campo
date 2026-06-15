import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { db } from "../db/schema";
import {
  getDefaultContextoIds,
  loadFrentesFromCache,
  loadUnidadesFromCache,
  saveFrentesCache,
  saveUnidadesCache,
} from "./contexto-cache";

describe("contexto-cache", () => {
  beforeEach(async () => {
    await db.unidades.clear();
    await db.frentes.clear();
    await db.turno_atual.clear();
  });

  afterEach(async () => {
    await db.delete();
    await db.open();
  });

  it("persiste e carrega unidades/frentes do IndexedDB", async () => {
    await saveUnidadesCache([{ id: "u1", nome: "Paraguacu Paulista" }]);
    await saveFrentesCache([
      { id: "f1", unidade_id: "u1", nome: "Frente Colheita 01" },
    ]);

    expect(await loadUnidadesFromCache()).toHaveLength(1);
    expect(await loadFrentesFromCache("u1")).toHaveLength(1);
  });

  it("prefere unidade/frente do último turno local", async () => {
    await db.turno_atual.put({
      id: "t1",
      usuario_id: "u",
      unidade_id: "u1",
      frente_id: "f1",
      area: "colheita",
      status: "fechado",
      inicio: "2026-06-15T00:00:00.000Z",
      fim: "2026-06-15T01:00:00.000Z",
    });
    await saveUnidadesCache([{ id: "u1", nome: "U1" }]);
    await saveFrentesCache([{ id: "f1", unidade_id: "u1", nome: "F1" }]);

    const defaults = await getDefaultContextoIds();
    expect(defaults).toEqual({ unidadeId: "u1", frenteId: "f1" });
  });
});
