//go:build integration

package repository

import (
	"context"
	"os"
	"testing"
	"time"

	"github.com/carlosedupm/ceial-cocal-campo/backend/internal/domain"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

func testPool(t *testing.T) *pgxpool.Pool {
	t.Helper()
	ctx := context.Background()
	url := os.Getenv("DATABASE_URL")
	if url == "" {
		url = "postgres://cocal:cocal@localhost:5432/cocal_campo?sslmode=disable"
	}
	pool, err := NewPool(ctx, url, false)
	if err != nil {
		t.Skipf("postgres unavailable: %v", err)
	}
	t.Cleanup(pool.Close)
	return pool
}

func testOpenTurno(t *testing.T, ctx context.Context, turnoRepo *TurnoRepository, userID string) *domain.Turno {
	t.Helper()
	open, err := turnoRepo.GetOpenByUser(ctx, userID)
	if err != nil {
		t.Fatalf("GetOpenByUser: %v", err)
	}
	if open != nil {
		return open
	}
	inicio := time.Now().UTC().Format(time.RFC3339)
	deviceID := "integration-test"
	tn := &domain.Turno{
		ID:        uuid.NewString(),
		UsuarioID: userID,
		UnidadeID: "11111111-1111-1111-1111-111111111111",
		FrenteID:  "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
		Area:      "colheita",
		Status:    domain.TurnoAberto,
		Inicio:    inicio,
		DeviceID:  &deviceID,
	}
	if err := turnoRepo.Create(ctx, tn); err != nil {
		t.Fatalf("Create turno: %v", err)
	}
	return tn
}

func TestRegistroCreateHorasCorte(t *testing.T) {
	ctx := context.Background()
	pool := testPool(t)

	userRepo := NewUserRepository(pool)
	turnoRepo := NewTurnoRepository(pool)
	regRepo := NewRegistroRepository(pool)

	u, _, err := userRepo.FindByEmail(ctx, "colheita@cocal.dev")
	if err != nil || u == nil {
		t.Fatalf("user: %v", err)
	}
	open := testOpenTurno(t, ctx, turnoRepo, u.ID)

	reg := &domain.Registro{
		ID:             uuid.NewString(),
		TurnoID:        open.ID,
		Tipo:           "horas_corte",
		IdempotencyKey: open.ID + ":horas_corte:integration-" + uuid.NewString()[:8],
		Payload:        map[string]any{"horas": 8, "minutos": 30, "exibicao": "08:30"},
		DeviceID:       "integration-test",
		EventoAt:       open.Inicio,
	}
	if err := regRepo.Create(ctx, reg, "abc123hash", u.ID); err != nil {
		t.Fatalf("Create horas_corte: %v", err)
	}
}

func TestRegistroCreateEntradaCana(t *testing.T) {
	ctx := context.Background()
	pool := testPool(t)

	userRepo := NewUserRepository(pool)
	turnoRepo := NewTurnoRepository(pool)
	regRepo := NewRegistroRepository(pool)

	u, _, err := userRepo.FindByEmail(ctx, "colheita@cocal.dev")
	if err != nil || u == nil {
		t.Fatalf("user: %v", err)
	}
	open := testOpenTurno(t, ctx, turnoRepo, u.ID)

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
