import { api } from "@/lib/api/client";
import { getUsuario } from "@/lib/auth/session";
import { db } from "@/lib/db/schema";
import type { Turno, Usuario } from "@/types/domain";

export function turnoMatchesUsuario(
  turno: Turno | null | undefined,
  usuario: Usuario | null | undefined
): boolean {
  if (!turno || !usuario) return false;
  return turno.usuario_id === usuario.id;
}

/** Remove turno local de outro usuário (ex.: login sem logout explícito). */
export async function clearTurnoIfUsuarioMismatch(): Promise<void> {
  const [turno, usuario] = await Promise.all([
    db.turno_atual.toCollection().first(),
    getUsuario(),
  ]);
  if (turno && usuario && turno.usuario_id !== usuario.id) {
    await db.turno_atual.clear();
  }
}

export async function reconcileTurnoFromServer(token: string): Promise<Turno | null> {
  try {
    const remoto = await api.turnoAtual(token);
    if (remoto) {
      await db.turno_atual.put(remoto);
      return remoto;
    }
    await db.turno_atual.clear();
    return null;
  } catch {
    return null;
  }
}
