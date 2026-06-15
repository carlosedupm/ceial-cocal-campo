import { api } from "@/lib/api/client";
import { db } from "@/lib/db/schema";
import type { Frente, Unidade } from "@/types/domain";

export async function loadUnidadesFromCache(): Promise<Unidade[]> {
  return db.unidades.orderBy("nome").toArray();
}

export async function loadFrentesFromCache(unidadeId: string): Promise<Frente[]> {
  return db.frentes.where("unidade_id").equals(unidadeId).sortBy("nome");
}

export async function saveUnidadesCache(unidades: Unidade[]): Promise<void> {
  if (unidades.length === 0) return;
  await db.unidades.bulkPut(unidades);
}

export async function saveFrentesCache(frentes: Frente[]): Promise<void> {
  if (frentes.length === 0) return;
  await db.frentes.bulkPut(frentes);
}

/** Atualiza catálogo local quando online (BR-TRANS-001). */
export async function refreshContextoCatalog(token: string): Promise<Unidade[]> {
  if (!navigator.onLine) {
    return loadUnidadesFromCache();
  }
  try {
    const unidades = await api.listUnidades(token);
    await saveUnidadesCache(unidades);
    await Promise.all(
      unidades.map(async (u) => {
        const frentes = await api.listFrentes(token, u.id);
        await saveFrentesCache(frentes);
      })
    );
    return unidades;
  } catch {
    return loadUnidadesFromCache();
  }
}

export async function getDefaultContextoIds(): Promise<{
  unidadeId: string;
  frenteId: string;
} | null> {
  const turno = await db.turno_atual.toCollection().first();
  if (turno?.unidade_id && turno.frente_id) {
    return { unidadeId: turno.unidade_id, frenteId: turno.frente_id };
  }
  const unidades = await loadUnidadesFromCache();
  if (unidades.length === 0) return null;
  const frentes = await loadFrentesFromCache(unidades[0].id);
  return {
    unidadeId: unidades[0].id,
    frenteId: frentes[0]?.id ?? "",
  };
}
