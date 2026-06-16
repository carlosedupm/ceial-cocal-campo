import { api } from "@/lib/api/client";
import { db } from "@/lib/db/schema";
import type { IndicadoresTurno } from "@/types/indicadores";

export async function cacheIndicadores(row: IndicadoresTurno): Promise<void> {
  await db.indicadores_cache.put({
    turno_id: row.turno_id,
    snapshot: row.snapshot,
    origem: row.origem,
    atualizado_em: row.atualizado_em ?? new Date().toISOString(),
    cached_at: new Date().toISOString(),
  });
}

export async function getCachedIndicadores(turnoId: string) {
  return db.indicadores_cache.get(turnoId);
}

export async function fetchAndCacheIndicadoresAtual(
  token: string,
  turnoId: string
): Promise<IndicadoresTurno | null> {
  if (!navigator.onLine) {
    const cached = await getCachedIndicadores(turnoId);
    if (!cached) return null;
    return {
      turno_id: turnoId,
      usuario_id: "",
      frente_id: "",
      unidade_id: "",
      area: "colheita",
      snapshot: cached.snapshot,
      origem: cached.origem,
      atualizado_em: cached.atualizado_em,
    };
  }
  try {
    const row = await api.indicadoresAtual(token);
    await cacheIndicadores(row);
    return row;
  } catch {
    const cached = await getCachedIndicadores(turnoId);
    if (!cached) return null;
    return {
      turno_id: turnoId,
      usuario_id: "",
      frente_id: "",
      unidade_id: "",
      area: "colheita",
      snapshot: cached.snapshot,
      origem: cached.origem,
      atualizado_em: cached.atualizado_em,
    };
  }
}

export async function fetchAndCacheIndicadoresTurno(
  token: string,
  turnoId: string
): Promise<IndicadoresTurno | null> {
  if (!navigator.onLine) {
    const cached = await getCachedIndicadores(turnoId);
    if (!cached) return null;
    return {
      turno_id: turnoId,
      usuario_id: "",
      frente_id: "",
      unidade_id: "",
      area: "",
      snapshot: cached.snapshot,
      origem: cached.origem,
      atualizado_em: cached.atualizado_em,
    };
  }
  try {
    const row = await api.indicadoresTurno(token, turnoId);
    await cacheIndicadores(row);
    return row;
  } catch {
    const cached = await getCachedIndicadores(turnoId);
    if (!cached) return null;
    return {
      turno_id: turnoId,
      usuario_id: "",
      frente_id: "",
      unidade_id: "",
      area: "",
      snapshot: cached.snapshot,
      origem: cached.origem,
      atualizado_em: cached.atualizado_em,
    };
  }
}

let pullTimer: ReturnType<typeof setInterval> | null = null;

export function startIndicadoresPull(
  getToken: () => Promise<string | null>,
  getTurnoId: () => Promise<string | null>,
  intervalMs = 45000
): void {
  stopIndicadoresPull();
  const tick = async () => {
    const token = await getToken();
    const turnoId = await getTurnoId();
    if (!token || !turnoId || !navigator.onLine) return;
    try {
      const row = await api.indicadoresAtual(token);
      await cacheIndicadores(row);
    } catch {
      /* mantém cache */
    }
  };
  void tick();
  pullTimer = setInterval(() => void tick(), intervalMs);
  window.addEventListener("online", tick);
}

export function stopIndicadoresPull(): void {
  if (pullTimer) {
    clearInterval(pullTimer);
    pullTimer = null;
  }
}
