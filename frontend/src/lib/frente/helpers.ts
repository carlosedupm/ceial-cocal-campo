import { db } from "@/lib/db/schema";
import type { Frente, Usuario } from "@/types/domain";

const FRENTE_KEY = "cocal_frente_selecionada";

export async function loadFrentesForUsuario(usuario: Usuario): Promise<Frente[]> {
  const all = await db.frentes.toArray();
  return all
    .filter((f) => usuario.frente_ids.includes(f.id))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

export function getSelectedFrenteId(usuario: Usuario, current?: string | null): string {
  if (current && usuario.frente_ids.includes(current)) return current;
  const stored = sessionStorage.getItem(FRENTE_KEY);
  if (stored && usuario.frente_ids.includes(stored)) return stored;
  return usuario.frente_ids[0] ?? "";
}

export function setSelectedFrenteId(id: string): void {
  sessionStorage.setItem(FRENTE_KEY, id);
}

export async function frenteNomeById(frenteId: string): Promise<string> {
  const frente = await db.frentes.get(frenteId);
  return frente?.nome ?? frenteId;
}
