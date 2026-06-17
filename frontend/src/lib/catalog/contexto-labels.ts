import { db } from "@/lib/db/schema";

export async function resolveContextoLabels(
  unidadeId: string,
  frenteId: string
): Promise<{ unidadeNome: string; frenteNome: string }> {
  const unidade = await db.unidades.get(unidadeId);
  const frente = await db.frentes.get(frenteId);
  return {
    unidadeNome: unidade?.nome ?? "Unidade",
    frenteNome: frente?.nome ?? "Frente",
  };
}

export function formatContextoLabel(unidadeNome: string, frenteNome: string): string {
  return `${frenteNome} — ${unidadeNome}`;
}
