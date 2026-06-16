import { api } from "@/lib/api/client";
import { getUsuario } from "@/lib/auth/session";
import { db, updatePendingCount } from "@/lib/db/schema";
import type { Turno, Usuario } from "@/types/domain";

export function turnoMatchesUsuario(
  turno: Turno | null | undefined,
  usuario: Usuario | null | undefined
): boolean {
  if (!turno || !usuario) return false;
  return turno.usuario_id === usuario.id;
}

/**
 * Remove registros pendentes/erro de turnos que não são o turno atual.
 * Sem turnoAtualId, remove todos os pendentes/erro (ex.: troca de usuário).
 */
export async function purgeOrphanRegistros(turnoAtualId?: string): Promise<number> {
  const candidatos = await db.registros
    .where("sync_status")
    .anyOf(["pendente", "erro"])
    .toArray();

  const orphans = turnoAtualId
    ? candidatos.filter((r) => r.turno_id !== turnoAtualId)
    : candidatos;

  if (orphans.length === 0) return 0;
  await db.registros.bulkDelete(orphans.map((r) => r.id));
  await updatePendingCount();
  return orphans.length;
}

/** Remove turno local de outro usuário (ex.: login sem logout explícito). */
export async function clearTurnoIfUsuarioMismatch(): Promise<void> {
  const [turno, usuario] = await Promise.all([
    db.turno_atual.toCollection().first(),
    getUsuario(),
  ]);
  if (turno && usuario && turno.usuario_id !== usuario.id) {
    await db.turno_atual.clear();
    await purgeOrphanRegistros();
    return;
  }
  if (turno?.status === "aberto") {
    await purgeOrphanRegistros(turno.id);
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
