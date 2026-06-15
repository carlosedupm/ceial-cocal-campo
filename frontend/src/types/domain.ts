export type SyncStatus = "pendente" | "sincronizado" | "erro";

export type Usuario = {
  id: string;
  email: string;
  nome: string;
  perfil: string;
  area: string;
  unidade_ids: string[];
  frente_ids: string[];
};

export type Turno = {
  id: string;
  usuario_id: string;
  unidade_id: string;
  frente_id: string;
  area: string;
  status: "aberto" | "fechado";
  inicio: string;
  fim?: string;
  device_id?: string;
};

export type Unidade = { id: string; nome: string };
export type Frente = { id: string; unidade_id: string; nome: string };

export type RegistroLocal = {
  id: string;
  turno_id: string;
  tipo: string;
  idempotency_key: string;
  payload: Record<string, unknown>;
  device_id: string;
  evento_at: string;
  sync_status: SyncStatus;
  last_error_code?: string;
  synced_at?: string;
  created_at: string;
};

export type ApiError = {
  code: string;
  message: string;
};

export const ERR_CODES = {
  TURNO002: "ERR-TURNO-002",
  TURNO003: "ERR-TURNO-003",
  TMP001: "ERR-TMP-001",
  TMP002: "ERR-TMP-002",
  SYNC_CONFLICT: "ERR-SYNC-CONFLICT",
  ACESSO001: "ERR-ACESSO-001",
  COLHEITA001: "ERR-COLHEITA-001",
  INT001: "ERR-INT-001",
} as const;
