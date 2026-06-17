import { ComparativoMatriz } from "@/components/gestao-vista/ComparativoMatriz";
import { DiasSemAcidentesPanel } from "@/components/gestao-vista/DiasSemAcidentesPanel";
import { PERFORMANCE_KEYS, QUALIDADE_KEYS } from "@/lib/gestao-vista/display";
import type { PainelUnidadeSnapshot } from "@/types/gestao-vista";

export function GestaoDashboard({
  snapshot,
  atualizadoEm,
  compact = false,
  testId,
  hideHeader = false,
}: {
  snapshot: PainelUnidadeSnapshot;
  atualizadoEm?: string;
  compact?: boolean;
  testId?: string;
  hideHeader?: boolean;
}) {
  const ts = atualizadoEm ?? snapshot.atualizado_em;

  return (
    <div
      className={`gestao-dashboard ${compact ? "compact" : ""}`}
      data-testid={testId}
    >
      {!hideHeader && (
        <header className="gestao-dashboard-header">
          <h2 className="gestao-dashboard-title">Gestão à vista</h2>
          {ts && (
            <p className="hint gestao-dashboard-ts">
              Última atualização: {new Date(ts).toLocaleString("pt-BR")}
            </p>
          )}
        </header>
      )}

      <DiasSemAcidentesPanel contadores={snapshot.seguranca.dias_sem_acidentes} compact={compact} />

      <div className="gestao-panels-row">
        <ComparativoMatriz
          titulo="Performance"
          indicadores={snapshot.performance}
          keys={PERFORMANCE_KEYS}
          compact={compact}
        />
        <ComparativoMatriz
          titulo="Qualidade"
          indicadores={snapshot.qualidade}
          keys={QUALIDADE_KEYS}
          compact={compact}
        />
      </div>
    </div>
  );
}
