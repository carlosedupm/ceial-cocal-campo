package service

import (
	"testing"

	"github.com/carlosedupm/ceial-cocal-campo/backend/internal/domain"
)

func TestValidateHorasCorte(t *testing.T) {
	user := &domain.Usuario{Area: AreaColheita}
	err := ValidateColheitaRegistro(user, TipoHorasCorte, map[string]any{"horas": 8, "minutos": 30})
	if err != nil {
		t.Fatalf("expected valid horas_corte: %v", err)
	}
}

func TestValidateHorasCorteRejectsZero(t *testing.T) {
	user := &domain.Usuario{Area: AreaColheita}
	err := ValidateColheitaRegistro(user, TipoHorasCorte, map[string]any{"horas": 0, "minutos": 0})
	if err == nil {
		t.Fatal("expected error for zero horas")
	}
}

func TestValidateConsumoDensidadeRejectsOutOfRange(t *testing.T) {
	user := &domain.Usuario{Area: AreaColheita}
	err := ValidateColheitaRegistro(user, TipoConsumoDensidade, map[string]any{
		"consumo_lt":           0.1,
		"densidade_ton_carga": 25.0,
	})
	if err == nil {
		t.Fatal("expected error for low consumo")
	}
	de, ok := domain.IsDomainError(err)
	if !ok || de.Code != domain.ErrColheita001 {
		t.Fatalf("expected ERR-COLHEITA-001, got %v", err)
	}
}

func TestValidateColheitaRBAC(t *testing.T) {
	user := &domain.Usuario{Area: "transporte"}
	err := ValidateColheitaRegistro(user, TipoHorasCorte, map[string]any{"horas": 1, "minutos": 0})
	if err == nil {
		t.Fatal("expected RBAC error")
	}
	de, ok := domain.IsDomainError(err)
	if !ok || de.Code != domain.ErrAcesso001 {
		t.Fatalf("expected ERR-ACESSO-001, got %v", err)
	}
}

func TestValidateEntradaCana(t *testing.T) {
	user := &domain.Usuario{Area: AreaColheita}
	err := ValidateColheitaRegistro(user, TipoEntradaCana, map[string]any{"toneladas": 120.5})
	if err != nil {
		t.Fatalf("expected valid entrada_cana: %v", err)
	}
}
