package service

import (
	"context"
	"testing"
	"time"

	"github.com/carlosedupm/ceial-cocal-campo/backend/internal/domain"
)

// TMP-001: timestamp futuro rejeitado
func TestSyncPushRejectsFutureEvent(t *testing.T) {
	svc := &SyncService{}
	user := &domain.Usuario{ID: "user-1"}
	item := domain.SyncPushItem{
		TurnoID:        "turno-1",
		Tipo:           "placeholder",
		IdempotencyKey: "k1",
		Payload:        map[string]any{"nota": "teste"},
		DeviceID:       "dev-1",
		EventoAt:       time.Now().UTC().Add(1 * time.Hour).Format(time.RFC3339),
	}
	_, err := svc.Push(context.Background(), user, item)
	if err == nil {
		t.Fatal("expected error for future event")
	}
	de, ok := domain.IsDomainError(err)
	if !ok || de.Code != domain.ErrTMP001 {
		t.Fatalf("expected ERR-TMP-001, got %v", err)
	}
}

func TestBuildIdempotencyKey(t *testing.T) {
	key := BuildIdempotencyKey("turno", "tipo", "id")
	if key != "turno:tipo:id" {
		t.Fatalf("unexpected key: %s", key)
	}
}
