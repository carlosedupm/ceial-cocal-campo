//go:build integration

package repository

import (
	"context"
	"os"
	"testing"

	"github.com/carlosedupm/ceial-cocal-campo/backend/internal/domain"
	"github.com/google/uuid"
)

func TestRegistroCreateEntradaCana(t *testing.T) {
	ctx := context.Background()
	url := os.Getenv("DATABASE_URL")
	if url == "" {
		url = "postgres://cocal:cocal@localhost:5432/cocal_campo?sslmode=disable"
	}
	pool, err := NewPool(ctx, url, false)
	if err != nil {
		t.Skipf("postgres unavailable: %v", err)
	}
	defer pool.Close()

	userRepo := NewUserRepository(pool)
	turnoRepo := NewTurnoRepository(pool)
	regRepo := NewRegistroRepository(pool)

	u, _, err := userRepo.FindByEmail(ctx, "colheita@cocal.dev")
	if err != nil || u == nil {
		t.Fatalf("user: %v", err)
	}
	open, err := turnoRepo.GetOpenByUser(ctx, u.ID)
	if err != nil || open == nil {
		t.Fatalf("need open turno: %v", err)
	}

	reg := &domain.Registro{
		ID:             uuid.NewString(),
		TurnoID:        open.ID,
		Tipo:           "entrada_cana",
		IdempotencyKey: open.ID + ":entrada_cana:integration-" + uuid.NewString()[:8],
		Payload:        map[string]any{"toneladas": 120.5},
		DeviceID:       "integration-test",
		EventoAt:       open.Inicio,
	}
	if err := regRepo.Create(ctx, reg, "abc123hash", u.ID); err != nil {
		t.Fatalf("Create entrada_cana: %v", err)
	}
}
