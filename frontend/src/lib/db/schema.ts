import Dexie, { type Table } from "dexie";
import type { Frente, RegistroLocal, Turno, Unidade, Usuario } from "@/types/domain";
import type { IndicadoresCacheRecord } from "@/types/indicadores";

export type SessionRecord = {
  id: string;
  access_token: string;
  refresh_token: string;
  expires_at: number;
  usuario: Usuario;
};

export type SyncMeta = {
  id: string;
  last_success_at?: string;
  pending_count: number;
};

export class CocalDatabase extends Dexie {
  session!: Table<SessionRecord, string>;
  turno_atual!: Table<Turno, string>;
  registros!: Table<RegistroLocal, string>;
  sync_meta!: Table<SyncMeta, string>;
  unidades!: Table<Unidade, string>;
  frentes!: Table<Frente, string>;
  indicadores_cache!: Table<IndicadoresCacheRecord, string>;

  constructor() {
    super("cocal-campo");
    this.version(1).stores({
      session: "id",
      turno_atual: "id",
      registros: "id, turno_id, sync_status, idempotency_key",
      sync_meta: "id",
    });
    this.version(2).stores({
      session: "id",
      turno_atual: "id",
      registros: "id, turno_id, sync_status, idempotency_key, created_at",
      sync_meta: "id",
    });
    this.version(3).stores({
      session: "id",
      turno_atual: "id",
      registros: "id, turno_id, sync_status, idempotency_key, created_at",
      sync_meta: "id",
      unidades: "id, nome",
      frentes: "id, unidade_id, nome",
    });
    this.version(4).stores({
      session: "id",
      turno_atual: "id",
      registros: "id, turno_id, sync_status, idempotency_key, created_at",
      sync_meta: "id",
      unidades: "id, nome",
      frentes: "id, unidade_id, nome",
      indicadores_cache: "turno_id, atualizado_em",
    });
  }
}

export const db = new CocalDatabase();

export function buildIdempotencyKey(
  turnoId: string,
  tipo: string,
  identificador: string
): string {
  return `${turnoId}:${tipo}:${identificador}`;
}

export async function updatePendingCount(): Promise<number> {
  const count = await db.registros.where("sync_status").equals("pendente").count();
  const erroCount = await db.registros.where("sync_status").equals("erro").count();
  const total = count + erroCount;
  await db.sync_meta.put({ id: "global", pending_count: total });
  return total;
}
