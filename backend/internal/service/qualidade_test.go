package service

import (
	"testing"

	"github.com/carlosedupm/ceial-cocal-campo/backend/internal/domain"
)

func TestValidateImpurezas(t *testing.T) {
	user := &domain.Usuario{Area: AreaQualidade}
	err := ValidateQualidadeRegistro(user, TipoImpurezas, map[string]any{
		"talhao_codigo":            "T01",
		"impureza_mineral_kg_ton":  2.5,
		"impureza_vegetal_kg_ton":  1.0,
	})
	if err != nil {
		t.Fatalf("expected valid impurezas: %v", err)
	}
}

func TestValidateImpurezasRejectsMissingTalhao(t *testing.T) {
	user := &domain.Usuario{Area: AreaQualidade}
	err := ValidateQualidadeRegistro(user, TipoImpurezas, map[string]any{
		"impureza_mineral_kg_ton": 2.0,
		"impureza_vegetal_kg_ton": 0.0,
	})
	if err == nil {
		t.Fatal("expected error for missing talhao")
	}
	de, ok := domain.IsDomainError(err)
	if !ok || de.Code != domain.ErrQualidade001 {
		t.Fatalf("expected ERR-QUALIDADE-001, got %v", err)
	}
}

func TestValidateImpurezasRejectsOutOfRange(t *testing.T) {
	user := &domain.Usuario{Area: AreaQualidade}
	err := ValidateQualidadeRegistro(user, TipoImpurezas, map[string]any{
		"talhao_codigo":            "T01",
		"impureza_mineral_kg_ton":  55.0,
		"impureza_vegetal_kg_ton":  0.0,
	})
	if err == nil {
		t.Fatal("expected error for out of range")
	}
}

func TestValidatePerdasCampo(t *testing.T) {
	user := &domain.Usuario{Area: AreaQualidade}
	err := ValidateQualidadeRegistro(user, TipoPerdasCampo, map[string]any{
		"talhao_codigo":       "T02",
		"perdas_pct":          3.5,
		"pisoteio_pct":        0.0,
		"abalo_arranquio_pct": 0.0,
	})
	if err != nil {
		t.Fatalf("expected valid perdas_campo: %v", err)
	}
}

func TestValidatePerdasCampoRejectsPercentual(t *testing.T) {
	user := &domain.Usuario{Area: AreaQualidade}
	err := ValidateQualidadeRegistro(user, TipoPerdasCampo, map[string]any{
		"talhao_codigo":       "T02",
		"perdas_pct":          101.0,
		"pisoteio_pct":        0.0,
		"abalo_arranquio_pct": 0.0,
	})
	if err == nil {
		t.Fatal("expected error for percentual > 100")
	}
}

func TestValidateQualidadeRBAC(t *testing.T) {
	user := &domain.Usuario{Area: "colheita"}
	err := ValidateQualidadeRegistro(user, TipoImpurezas, map[string]any{
		"talhao_codigo":            "T01",
		"impureza_mineral_kg_ton":  1.0,
		"impureza_vegetal_kg_ton":  0.0,
	})
	if err == nil {
		t.Fatal("expected RBAC error")
	}
	de, ok := domain.IsDomainError(err)
	if !ok || de.Code != domain.ErrAcesso001 {
		t.Fatalf("expected ERR-ACESSO-001, got %v", err)
	}
}
