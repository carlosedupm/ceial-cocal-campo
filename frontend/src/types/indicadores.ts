export type DisponibilidadeIndicador =
  | "disponivel"
  | "em_processamento"
  | "indisponivel"
  | "erro_integracao";

export type IndicadorItem = {
  valor?: Record<string, unknown>;
  disponibilidade: DisponibilidadeIndicador;
};

export type IndicadoresSnapshot = {
  performance?: Record<string, IndicadorItem>;
  qualidade?: Record<string, IndicadorItem>;
  metas?: Record<string, unknown>;
};

export type IndicadoresTurno = {
  id?: string;
  turno_id: string;
  usuario_id: string;
  frente_id: string;
  unidade_id: string;
  area: string;
  snapshot: IndicadoresSnapshot;
  origem: string;
  atualizado_em?: string;
};

export type TurnoComUsuario = {
  id: string;
  usuario_id: string;
  unidade_id: string;
  frente_id: string;
  area: string;
  status: "aberto" | "fechado";
  inicio: string;
  fim?: string;
  usuario_nome: string;
  usuario_area: string;
};

export type FrenteResumo = {
  frente_id: string;
  turnos: TurnoComUsuario[];
  indicadores: IndicadoresTurno[];
};

export type IndicadoresCacheRecord = {
  turno_id: string;
  snapshot: IndicadoresSnapshot;
  origem: string;
  atualizado_em: string;
  cached_at: string;
};
