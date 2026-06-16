package service

import (
	"testing"

	"github.com/carlosedupm/ceial-cocal-campo/backend/internal/domain"
)

func TestOrigemIndicadoresFromRegistros_campoIgnorado(t *testing.T) {
	regs := []domain.Registro{
		{Origem: "campo", Tipo: "placeholder"},
		{Origem: "simulador", Tipo: TipoHorasCorte},
	}
	if got := origemIndicadoresFromRegistros(regs); got != "simulador" {
		t.Fatalf("origem = %q, want simulador", got)
	}
}

func TestOrigemIndicadoresFromRegistros_centralPrioridade(t *testing.T) {
	regs := []domain.Registro{
		{Origem: "simulador", Tipo: TipoHorasCorte},
		{Origem: "central", Tipo: TipoEntradaCana},
	}
	if got := origemIndicadoresFromRegistros(regs); got != "central" {
		t.Fatalf("origem = %q, want central", got)
	}
}

func TestOrigemIndicadoresFromRegistros_apenasCampo(t *testing.T) {
	regs := []domain.Registro{{Origem: "campo", Tipo: "placeholder"}}
	if got := origemIndicadoresFromRegistros(regs); got != "simulador" {
		t.Fatalf("origem = %q, want simulador default", got)
	}
}

func TestBuildSnapshotFromRegistros_ignoraPlaceholder(t *testing.T) {
	regs := []domain.Registro{
		{Origem: "campo", Tipo: "placeholder", Payload: map[string]any{"nota": "x"}},
		{
			Origem: "simulador",
			Tipo:   TipoHorasCorte,
			Payload: map[string]any{
				"horas": 8, "minutos": 0, "exibicao": "08:00", "_disponibilidade": "disponivel",
			},
		},
	}
	snap := buildSnapshotFromRegistros(regs)
	perf, ok := snap["performance"].(map[string]any)
	if !ok {
		t.Fatal("performance ausente")
	}
	item, ok := perf["horas_corte"].(map[string]any)
	if !ok {
		t.Fatal("horas_corte ausente")
	}
	if item["disponibilidade"] != "disponivel" {
		t.Fatalf("disponibilidade = %v", item["disponibilidade"])
	}
}
