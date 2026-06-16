import { api, ApiClientError } from "@/lib/api/client";
import { getValidAccessToken } from "@/lib/auth/session";
import { buildIdempotencyKey, db, updatePendingCount } from "@/lib/db/schema";
import type { RegistroLocal, SyncStatus } from "@/types/domain";
import { ERR_CODES } from "@/types/domain";

let syncing = false;

export class RegistroImutavelError extends Error {
  constructor(tipo: string) {
    super(
      `O indicador "${tipo}" já foi sincronizado e não pode ser alterado (BR-TRANS-004).`
    );
    this.name = "RegistroImutavelError";
  }
}

export function idempotencyKeyTurno(turnoId: string, tipo: string): string {
  return buildIdempotencyKey(turnoId, tipo, "unico");
}

export function idempotencyKeyViagem(turnoId: string, tipo: string, viagemNumero: number): string {
  return buildIdempotencyKey(turnoId, tipo, String(viagemNumero));
}

export function isSyncConflictPermanent(code?: string): boolean {
  return code === ERR_CODES.SYNC_CONFLICT;
}

export async function enqueueRegistro(
  turnoId: string,
  tipo: string,
  payload: Record<string, unknown>,
  deviceId: string
): Promise<RegistroLocal> {
  const id = crypto.randomUUID();
  const eventoAt = new Date().toISOString();
  const registro: RegistroLocal = {
    id,
    turno_id: turnoId,
    tipo,
    idempotency_key: buildIdempotencyKey(turnoId, tipo, id),
    payload,
    device_id: deviceId,
    evento_at: eventoAt,
    sync_status: "pendente",
    created_at: eventoAt,
  };
  await db.registros.put(registro);
  await updatePendingCount();
  void flushOutbox();
  return registro;
}

/** Um registro por indicador por turno (BRF-002 idempotência). */
export async function enqueueRegistroTurno(
  turnoId: string,
  tipo: string,
  payload: Record<string, unknown>,
  deviceId: string
): Promise<RegistroLocal> {
  const idempotencyKey = idempotencyKeyTurno(turnoId, tipo);
  const existing = await db.registros
    .where("idempotency_key")
    .equals(idempotencyKey)
    .first();

  if (existing?.sync_status === "sincronizado") {
    throw new RegistroImutavelError(tipo);
  }
  if (isSyncConflictPermanent(existing?.last_error_code)) {
    throw new Error(
      `Conflito de sync em "${tipo}": a versão no servidor prevaleceu (BR-SYNC-005). Use "Aceitar versão do servidor" na home.`
    );
  }

  const eventoAt = new Date().toISOString();
  const registro: RegistroLocal = {
    id: existing?.id ?? crypto.randomUUID(),
    turno_id: turnoId,
    tipo,
    idempotency_key: idempotencyKey,
    payload,
    device_id: deviceId,
    evento_at: eventoAt,
    sync_status: "pendente",
    created_at: existing?.created_at ?? eventoAt,
    last_error_code: undefined,
  };
  await db.registros.put(registro);
  await updatePendingCount();
  void flushOutbox();
  return registro;
}

/** Um registro por viagem no turno (BRF-003 idempotência cargas_viagens). */
export async function enqueueRegistroViagem(
  turnoId: string,
  tipo: string,
  viagemNumero: number,
  payload: Record<string, unknown>,
  deviceId: string
): Promise<RegistroLocal> {
  const idempotencyKey = idempotencyKeyViagem(turnoId, tipo, viagemNumero);
  const existing = await db.registros
    .where("idempotency_key")
    .equals(idempotencyKey)
    .first();

  if (existing?.sync_status === "sincronizado") {
    throw new RegistroImutavelError(`${tipo} (viagem ${viagemNumero})`);
  }
  if (isSyncConflictPermanent(existing?.last_error_code)) {
    throw new Error(
      `Conflito de sync em "${tipo}" viagem ${viagemNumero}: a versão no servidor prevaleceu (BR-SYNC-005). Use "Aceitar versão do servidor" na home.`
    );
  }

  const eventoAt = new Date().toISOString();
  const registro: RegistroLocal = {
    id: existing?.id ?? crypto.randomUUID(),
    turno_id: turnoId,
    tipo,
    idempotency_key: idempotencyKey,
    payload,
    device_id: deviceId,
    evento_at: eventoAt,
    sync_status: "pendente",
    created_at: existing?.created_at ?? eventoAt,
    last_error_code: undefined,
  };
  await db.registros.put(registro);
  await updatePendingCount();
  void flushOutbox();
  return registro;
}

/** BR-SYNC-005: encerra conflito aceitando a versão já gravada no servidor. */
export async function aceitarVersaoServidor(registroId: string): Promise<void> {
  await db.registros.update(registroId, {
    sync_status: "sincronizado",
    synced_at: new Date().toISOString(),
    last_error_code: undefined,
  });
  await updatePendingCount();
}

async function syncTurnoLocal(token: string): Promise<void> {
  const turno = await db.turno_atual.toCollection().first();
  if (!turno || turno.status !== "aberto") return;
  try {
    await api.abrirTurno(token, {
      id: turno.id,
      unidade_id: turno.unidade_id,
      frente_id: turno.frente_id,
      device_id: turno.device_id ?? getDeviceIdFromStorage(),
      inicio: turno.inicio,
    });
  } catch (err) {
    if (err instanceof ApiClientError && err.code === "ERR-TURNO-002") {
      return;
    }
    throw err;
  }
}

function getDeviceIdFromStorage(): string {
  return localStorage.getItem("cocal_device_id") ?? "unknown";
}

export async function flushOutbox(): Promise<void> {
  if (syncing || !navigator.onLine) return;
  syncing = true;
  try {
    const token = await getValidAccessToken();
    if (!token) return;

    await syncTurnoLocal(token);

    const pendentes = (await db.registros
      .where("sync_status")
      .anyOf(["pendente", "erro"])
      .toArray()
    ).filter((item) => !isSyncConflictPermanent(item.last_error_code));

    for (const item of pendentes) {
      try {
        const res = await api.syncPush(token, [
          {
            id: item.id,
            turno_id: item.turno_id,
            tipo: item.tipo,
            idempotency_key: item.idempotency_key,
            payload: item.payload,
            device_id: item.device_id,
            evento_at: item.evento_at,
          },
        ]);
        const synced = res.results[0];
        await db.registros.update(item.id, {
          sync_status: "sincronizado" as SyncStatus,
          synced_at: synced?.synced_at ?? new Date().toISOString(),
          last_error_code: undefined,
        });
        await db.sync_meta.put({
          id: "global",
          last_success_at: new Date().toISOString(),
          pending_count: await updatePendingCount(),
        });
      } catch (err) {
        const code = err instanceof ApiClientError ? err.code : "ERR-UNKNOWN";
        await db.registros.update(item.id, {
          sync_status: "erro",
          last_error_code: code,
        });
        await updatePendingCount();
      }
    }
  } finally {
    syncing = false;
  }
}

export function startSyncEngine(): () => void {
  const onOnline = () => void flushOutbox();
  window.addEventListener("online", onOnline);
  const interval = window.setInterval(() => void flushOutbox(), 30_000);
  void flushOutbox();
  return () => {
    window.removeEventListener("online", onOnline);
    window.clearInterval(interval);
  };
}
