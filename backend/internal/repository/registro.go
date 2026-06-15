package repository

import (
	"context"
	"errors"

	"github.com/carlosedupm/ceial-cocal-campo/backend/internal/domain"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type RegistroRepository struct {
	pool *pgxpool.Pool
}

func NewRegistroRepository(pool *pgxpool.Pool) *RegistroRepository {
	return &RegistroRepository{pool: pool}
}

func (r *RegistroRepository) FindByIdempotencyKey(ctx context.Context, key string) (*domain.Registro, error) {
	var reg domain.Registro
	var payload map[string]any
	err := r.pool.QueryRow(ctx, `
		SELECT id::text, turno_id::text, tipo, idempotency_key, payload,
		       device_id, evento_at::text, synced_at::text
		FROM registros WHERE idempotency_key = $1
	`, key).Scan(&reg.ID, &reg.TurnoID, &reg.Tipo, &reg.IdempotencyKey, &payload,
		&reg.DeviceID, &reg.EventoAt, &reg.SyncedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	reg.Payload = payload
	return &reg, err
}

func (r *RegistroRepository) Create(ctx context.Context, reg *domain.Registro, payloadHash string, userID string) error {
	return r.pool.QueryRow(ctx, `
		INSERT INTO registros (id, turno_id, usuario_id, tipo, idempotency_key, payload, payload_hash, device_id, evento_at)
		VALUES ($1::uuid, $2::uuid, $3::uuid, $4, $5, $6, $7, $8, $9::timestamptz)
		RETURNING synced_at::text
	`, reg.ID, reg.TurnoID, userID, reg.Tipo, reg.IdempotencyKey, reg.Payload, payloadHash,
		reg.DeviceID, reg.EventoAt).Scan(&reg.SyncedAt)
}

func (r *RegistroRepository) GetPayloadHash(ctx context.Context, key string) (string, error) {
	var hash string
	err := r.pool.QueryRow(ctx, `SELECT payload_hash FROM registros WHERE idempotency_key = $1`, key).Scan(&hash)
	if errors.Is(err, pgx.ErrNoRows) {
		return "", nil
	}
	return hash, err
}
