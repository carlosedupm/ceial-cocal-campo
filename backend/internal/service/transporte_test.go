package service

import (
	"testing"

	"github.com/carlosedupm/ceial-cocal-campo/backend/internal/domain"
)

func TestValidateConsumoTransbordo(t *testing.T) {
	user := &domain.Usuario{Area: AreaTransporte}
	err := ValidateTransporteRegistro(user, TipoConsumoTransbordo, map[string]any{"consumo_lt": 12.5})
	if err != nil {
		t.Fatalf("expected valid consumo_transbordo: %v", err)
	}
}

func TestValidateConsumoTransbordoRejectsOutOfRange(t *testing.T) {
	user := &domain.Usuario{Area: AreaTransporte}
	err := ValidateTransporteRegistro(user, TipoConsumoTransbordo, map[string]any{"consumo_lt": 0.5})
	if err == nil {
		t.Fatal("expected error for low consumo")
	}
	de, ok := domain.IsDomainError(err)
	if !ok || de.Code != domain.ErrTransporte001 {
		t.Fatalf("expected ERR-TRANSPORTE-001, got %v", err)
	}
}

func TestValidateCargasViagens(t *testing.T) {
	user := &domain.Usuario{Area: AreaTransporte}
	err := ValidateTransporteRegistro(user, TipoCargasViagens, map[string]any{
		"viagem_numero":  1,
		"toneladas":      28.5,
		"frente_origem":  "Frente A",
		"frente_destino": "Usina",
	})
	if err != nil {
		t.Fatalf("expected valid cargas_viagens: %v", err)
	}
}

func TestValidateCargasViagensRejectsToneladas(t *testing.T) {
	user := &domain.Usuario{Area: AreaTransporte}
	err := ValidateTransporteRegistro(user, TipoCargasViagens, map[string]any{
		"viagem_numero": 2,
		"toneladas":     6000,
	})
	if err == nil {
		t.Fatal("expected error for high toneladas")
	}
	de, ok := domain.IsDomainError(err)
	if !ok || de.Code != domain.ErrTransporte001 {
		t.Fatalf("expected ERR-TRANSPORTE-001, got %v", err)
	}
}

func TestValidateTransporteRBAC(t *testing.T) {
	user := &domain.Usuario{Area: "colheita"}
	err := ValidateTransporteRegistro(user, TipoConsumoTransbordo, map[string]any{"consumo_lt": 10})
	if err == nil {
		t.Fatal("expected RBAC error")
	}
	de, ok := domain.IsDomainError(err)
	if !ok || de.Code != domain.ErrAcesso001 {
		t.Fatalf("expected ERR-ACESSO-001, got %v", err)
	}
}
