import type { DisponibilidadeIndicador } from "@/types/indicadores";

export type HorizontePainel = "diario" | "semanal" | "safra";

export type ComparativoPainel = {
  planejado?: number | string;
  executado?: number | string;
  disponibilidade?: DisponibilidadeIndicador;
};

export type IndicadorPainel = {
  unidade_medida: string;
  horizontes: Partial<Record<HorizontePainel, ComparativoPainel>>;
  direcao: "maior_melhor" | "menor_melhor";
};

export type ContadorDiasSemAcidentes = {
  tipo: "unidade" | "operacao";
  rotulo: string;
  dias: number;
};

export type PainelUnidadeSnapshot = {
  atualizado_em?: string;
  seguranca: {
    dias_sem_acidentes: ContadorDiasSemAcidentes[];
  };
  performance: Record<string, IndicadorPainel>;
  qualidade: Record<string, IndicadorPainel>;
};

export type PainelUnidade = {
  unidade_id: string;
  snapshot: PainelUnidadeSnapshot;
  origem: string;
  ingestido_por?: string;
  atualizado_em?: string;
};

export type PainelUnidadeCacheRecord = {
  unidade_id: string;
  snapshot: PainelUnidadeSnapshot;
  origem: string;
  atualizado_em: string;
  cached_at: string;
};
