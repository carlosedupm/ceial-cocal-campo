import type { ApiError, Usuario } from "@/types/domain";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

export class ApiClientError extends Error {
  code: string;
  constructor(err: ApiError) {
    super(err.message);
    this.code = err.code;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  accessToken?: string
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (res.status === 204) {
    return undefined as T;
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiClientError({
      code: body.code ?? "ERR-UNKNOWN",
      message: body.message ?? "Erro desconhecido",
    });
  }
  return body as T;
}

export type TokenPair = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  usuario: Usuario;
};

export const api = {
  login: (email: string, password: string) =>
    request<TokenPair>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  refresh: (refreshToken: string) =>
    request<TokenPair>("/api/v1/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    }),
  logout: (refreshToken: string) =>
    request<void>("/api/v1/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    }),
  me: (token: string) => request<Usuario>("/api/v1/me", {}, token),
  listUnidades: (token: string) =>
    request<{ id: string; nome: string }[]>("/api/v1/unidades", {}, token),
  listFrentes: (token: string, unidadeId: string) =>
    request<{ id: string; unidade_id: string; nome: string }[]>(
      `/api/v1/unidades/${unidadeId}/frentes`,
      {},
      token
    ),
  abrirTurno: (
    token: string,
    body: {
      id?: string;
      unidade_id: string;
      frente_id: string;
      device_id: string;
      inicio?: string;
    }
  ) =>
    request<import("@/types/domain").Turno>("/api/v1/turnos", {
      method: "POST",
      body: JSON.stringify(body),
    }, token),
  turnoAtual: (token: string) =>
    request<import("@/types/domain").Turno | null>("/api/v1/turnos/atual", {}, token),
  fecharTurno: (token: string, id: string) =>
    request<import("@/types/domain").Turno>(`/api/v1/turnos/${id}/fechar`, {
      method: "POST",
    }, token),
  syncPush: (
    token: string,
    items: Array<{
      id: string;
      turno_id: string;
      tipo: string;
      idempotency_key: string;
      payload: Record<string, unknown>;
      device_id: string;
      evento_at: string;
    }>
  ) =>
    request<{ results: Array<{ id: string; synced_at: string }> }>(
      "/api/v1/sync/push",
      { method: "POST", body: JSON.stringify({ items }) },
      token
    ),
  indicadoresAtual: (token: string) =>
    request<import("@/types/indicadores").IndicadoresTurno>(
      "/api/v1/turnos/atual/indicadores",
      {},
      token
    ),
  indicadoresTurno: (token: string, turnoId: string) =>
    request<import("@/types/indicadores").IndicadoresTurno>(
      `/api/v1/turnos/${turnoId}/indicadores`,
      {},
      token
    ),
  turnosFrente: (token: string, frenteId: string) =>
    request<import("@/types/indicadores").TurnoComUsuario[]>(
      `/api/v1/frentes/${frenteId}/turnos`,
      {},
      token
    ),
  resumoFrente: (token: string, frenteId: string) =>
    request<import("@/types/indicadores").FrenteResumo>(
      `/api/v1/frentes/${frenteId}/indicadores-resumo`,
      {},
      token
    ),
  gestaoVista: (token: string, unidadeId: string) =>
    request<import("@/types/gestao-vista").PainelUnidade>(
      `/api/v1/unidades/${unidadeId}/gestao-vista`,
      {},
      token
    ),
  putGestaoVista: (token: string, unidadeId: string, snapshot: Record<string, unknown>) =>
    request<import("@/types/gestao-vista").PainelUnidade>(
      `/api/v1/unidades/${unidadeId}/gestao-vista`,
      { method: "PUT", body: JSON.stringify({ snapshot }) },
      token
    ),
};
