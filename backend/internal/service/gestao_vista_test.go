package service

import (
	"testing"
)

func TestValidatePainelSnapshot_exemploValido(t *testing.T) {
	snap := exemploPainelSnapshot()
	if err := ValidatePainelSnapshot(snap); err != nil {
		t.Fatalf("snapshot valido rejeitado: %v", err)
	}
}

func TestValidatePainelSnapshot_semSeguranca(t *testing.T) {
	snap := exemploPainelSnapshot()
	delete(snap, "seguranca")
	if err := ValidatePainelSnapshot(snap); err == nil {
		t.Fatal("esperava erro sem seguranca")
	}
}

func TestValidatePainelSnapshot_horizonteInvalido(t *testing.T) {
	snap := exemploPainelSnapshot()
	perf := snap["performance"].(map[string]any)
	entrada := perf["entrada_cana"].(map[string]any)
	horizontes := entrada["horizontes"].(map[string]any)
	horizontes["semanal"] = horizontes["diario"]
	if err := ValidatePainelSnapshot(snap); err == nil {
		t.Fatal("esperava erro com horizonte semanal em entrada_cana")
	}
}

func TestParseComparableNumber_hora(t *testing.T) {
	v, ok := ParseComparableNumber("13:10")
	if !ok {
		t.Fatal("parse hora falhou")
	}
	if v != 13*60+10 {
		t.Fatalf("valor = %v", v)
	}
}

func TestParseComparableNumber_decimal(t *testing.T) {
	v, ok := ParseComparableNumber(0.42)
	if !ok || v != 0.42 {
		t.Fatalf("valor = %v ok=%v", v, ok)
	}
}

func exemploPainelSnapshot() map[string]any {
	return map[string]any{
		"atualizado_em": "2025-08-12T05:30:39Z",
		"seguranca": map[string]any{
			"dias_sem_acidentes": []any{
				map[string]any{"tipo": "unidade", "rotulo": "Paraguacu Paulista", "dias": 1838},
				map[string]any{"tipo": "unidade", "rotulo": "Narandiba", "dias": 1243},
				map[string]any{"tipo": "operacao", "rotulo": "Colheita", "dias": 3224},
				map[string]any{"tipo": "operacao", "rotulo": "Transporte", "dias": 2443},
			},
		},
		"performance": map[string]any{
			"entrada_cana": map[string]any{
				"unidade_medida": "ton",
				"direcao":        "maior_melhor",
				"horizontes": map[string]any{
					"diario": map[string]any{"planejado": 2583, "executado": 0, "disponibilidade": "disponivel"},
					"safra":  map[string]any{"planejado": 1283751, "executado": 252797, "disponibilidade": "disponivel"},
				},
			},
			"densidade": map[string]any{
				"unidade_medida": "ton/carga",
				"direcao":        "maior_melhor",
				"horizontes": map[string]any{
					"diario": map[string]any{"planejado": 69, "executado": 0, "disponibilidade": "disponivel"},
					"safra":  map[string]any{"planejado": 69, "executado": 72, "disponibilidade": "disponivel"},
				},
			},
			"atr": map[string]any{
				"unidade_medida": "kg/ton",
				"direcao":        "maior_melhor",
				"horizontes": map[string]any{
					"diario": map[string]any{"planejado": 126, "executado": 0, "disponibilidade": "disponivel"},
					"safra":  map[string]any{"planejado": 126, "executado": 126, "disponibilidade": "disponivel"},
				},
			},
			"horas_corte": map[string]any{
				"unidade_medida": "h",
				"direcao":        "maior_melhor",
				"horizontes": map[string]any{
					"diario": map[string]any{"planejado": "12:00", "executado": "13:10", "disponibilidade": "disponivel"},
					"safra":  map[string]any{"planejado": "11:00", "executado": "11:51", "disponibilidade": "disponivel"},
				},
			},
			"consumo_transbordo": map[string]any{
				"unidade_medida": "L/t",
				"direcao":        "menor_melhor",
				"horizontes": map[string]any{
					"semanal": map[string]any{"planejado": 0.42, "executado": 0.44, "disponibilidade": "disponivel"},
					"safra":   map[string]any{"planejado": 0.42, "executado": 0.50, "disponibilidade": "disponivel"},
				},
			},
			"consumo_colhedora": map[string]any{
				"unidade_medida": "L/t",
				"direcao":        "menor_melhor",
				"horizontes": map[string]any{
					"semanal": map[string]any{"planejado": 0.80, "executado": 0.65, "disponibilidade": "disponivel"},
					"safra":   map[string]any{"planejado": 0.80, "executado": 0.84, "disponibilidade": "disponivel"},
				},
			},
		},
		"qualidade": map[string]any{
			"impureza_mineral": map[string]any{
				"unidade_medida": "kg/ton",
				"direcao":        "menor_melhor",
				"horizontes": map[string]any{
					"diario": map[string]any{"planejado": 9, "executado": 0, "disponibilidade": "disponivel"},
					"safra":  map[string]any{"planejado": 9, "executado": 9, "disponibilidade": "disponivel"},
				},
			},
			"impureza_vegetal": map[string]any{
				"unidade_medida": "kg/ton",
				"direcao":        "menor_melhor",
				"horizontes": map[string]any{
					"diario": map[string]any{"planejado": 90, "executado": 0, "disponibilidade": "disponivel"},
					"safra":  map[string]any{"planejado": 90, "executado": 100, "disponibilidade": "disponivel"},
				},
			},
			"perdas": map[string]any{
				"unidade_medida": "%",
				"direcao":        "menor_melhor",
				"horizontes": map[string]any{
					"semanal": map[string]any{"planejado": 3.0, "executado": 2.03, "disponibilidade": "disponivel"},
					"safra":   map[string]any{"planejado": 3.0, "executado": 1.85, "disponibilidade": "disponivel"},
				},
			},
			"pisoteio": map[string]any{
				"unidade_medida": "%",
				"direcao":        "menor_melhor",
				"horizontes": map[string]any{
					"semanal": map[string]any{"planejado": 3.0, "executado": 0.78, "disponibilidade": "disponivel"},
					"safra":   map[string]any{"planejado": 3.0, "executado": 1.57, "disponibilidade": "disponivel"},
				},
			},
			"abalo_arranquio": map[string]any{
				"unidade_medida": "%",
				"direcao":        "menor_melhor",
				"horizontes": map[string]any{
					"semanal": map[string]any{"planejado": 2.8, "executado": 0.35, "disponibilidade": "disponivel"},
					"safra":   map[string]any{"planejado": 2.8, "executado": 2.03, "disponibilidade": "disponivel"},
				},
			},
		},
	}
}
