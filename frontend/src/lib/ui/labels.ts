const PERFIL_LABELS: Record<string, string> = {
  operador_colheita: "Operador de colheita",
  operador_transporte: "Operador de transporte",
  tecnico_qualidade: "Técnico de qualidade",
  tecnico_seguranca: "Técnico de segurança",
  supervisor_frente: "Supervisor de frente",
  simulador_central: "Simulador do sistema central",
};

const AREA_LABELS: Record<string, string> = {
  colheita: "Colheita",
  transporte: "Transporte",
  qualidade: "Qualidade",
  seguranca: "Segurança",
  supervisao: "Supervisão",
};

export function labelPerfil(perfil: string): string {
  return PERFIL_LABELS[perfil] ?? perfil.replace(/_/g, " ");
}

export function labelArea(area: string): string {
  return AREA_LABELS[area] ?? area;
}
