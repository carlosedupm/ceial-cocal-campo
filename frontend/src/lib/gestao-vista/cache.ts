import { api } from "@/lib/api/client";
import { db } from "@/lib/db/schema";
import type { PainelUnidade } from "@/types/gestao-vista";

export async function cachePainelUnidade(row: PainelUnidade): Promise<void> {
  await db.painel_unidade_cache.put({
    unidade_id: row.unidade_id,
    snapshot: row.snapshot,
    origem: row.origem,
    atualizado_em: row.atualizado_em ?? new Date().toISOString(),
    cached_at: new Date().toISOString(),
  });
}

export async function getCachedPainelUnidade(unidadeId: string) {
  return db.painel_unidade_cache.get(unidadeId);
}

export async function fetchAndCachePainelUnidade(
  token: string,
  unidadeId: string
): Promise<PainelUnidade | null> {
  if (!navigator.onLine) {
    const cached = await getCachedPainelUnidade(unidadeId);
    if (!cached) return null;
    return {
      unidade_id: unidadeId,
      snapshot: cached.snapshot,
      origem: cached.origem,
      atualizado_em: cached.atualizado_em,
    };
  }
  try {
    const row = await api.gestaoVista(token, unidadeId);
    await cachePainelUnidade(row);
    return row;
  } catch {
    const cached = await getCachedPainelUnidade(unidadeId);
    if (!cached) return null;
    return {
      unidade_id: unidadeId,
      snapshot: cached.snapshot,
      origem: cached.origem,
      atualizado_em: cached.atualizado_em,
    };
  }
}

let pullTimer: ReturnType<typeof setInterval> | null = null;

export function startPainelPull(
  getToken: () => Promise<string | null>,
  getUnidadeId: () => Promise<string | null>,
  onUpdate?: (row: PainelUnidade) => void,
  intervalMs = 45000
): void {
  stopPainelPull();
  const tick = async () => {
    const token = await getToken();
    const unidadeId = await getUnidadeId();
    if (!token || !unidadeId || !navigator.onLine) return;
    try {
      const row = await api.gestaoVista(token, unidadeId);
      await cachePainelUnidade(row);
      onUpdate?.(row);
    } catch {
      /* mantém cache */
    }
  };
  void tick();
  pullTimer = setInterval(() => void tick(), intervalMs);
  window.addEventListener("online", tick);
}

export function stopPainelPull(): void {
  if (pullTimer) {
    clearInterval(pullTimer);
    pullTimer = null;
  }
}
