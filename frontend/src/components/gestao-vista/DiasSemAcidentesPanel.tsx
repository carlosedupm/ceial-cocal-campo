import type { ContadorDiasSemAcidentes } from "@/types/gestao-vista";

export function DiasSemAcidentesPanel({
  contadores,
  compact = false,
}: {
  contadores: ContadorDiasSemAcidentes[];
  compact?: boolean;
}) {
  return (
    <section
      className={`card gestao-dias ${compact ? "compact" : ""}`}
      data-testid="dias-sem-acidentes"
    >
      <h2 className="gestao-panel-title">Dias sem acidentes</h2>
      <div className="gestao-dias-tiles">
        {contadores.map((c) => (
          <div key={`${c.tipo}-${c.rotulo}`} className="gestao-dias-tile">
            <span className="gestao-dias-valor">{c.dias.toLocaleString("pt-BR")}</span>
            <span className="gestao-dias-badge">DIAS</span>
            <span className="gestao-dias-rotulo">{c.rotulo}</span>
            <span className="gestao-dias-tipo">{c.tipo === "unidade" ? "Unidade" : "Operação"}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
