package repository

import (
	"context"
	"encoding/json"
	"errors"

	"github.com/carlosedupm/ceial-cocal-campo/backend/internal/domain"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
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

func (r *RegistroRepository) FindByID(ctx context.Context, id string) (*domain.Registro, error) {
	var reg domain.Registro
	var payload map[string]any
	err := r.pool.QueryRow(ctx, `
		SELECT id::text, turno_id::text, tipo, idempotency_key, payload,
		       device_id, evento_at::text, synced_at::text
		FROM registros WHERE id = $1::uuid
	`, id).Scan(&reg.ID, &reg.TurnoID, &reg.Tipo, &reg.IdempotencyKey, &payload,
		&reg.DeviceID, &reg.EventoAt, &reg.SyncedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	reg.Payload = payload
	return &reg, err
}

func (r *RegistroRepository) Create(ctx context.Context, reg *domain.Registro, payloadHash string, userID string) error {
	// pgx: map[string]any sem OID falha no encode; []byte vira bytea (22P02).
	// JSON como string + ::jsonb é o caminho estável.
	payloadJSON, err := json.Marshal(reg.Payload)
	if err != nil {
		return err
	}
	return r.pool.QueryRow(ctx, `
		INSERT INTO registros (id, turno_id, usuario_id, tipo, idempotency_key, payload, payload_hash, device_id, evento_at)
		VALUES ($1::uuid, $2::uuid, $3::uuid, $4, $5, $6::jsonb, $7, $8, $9::timestamptz)
		RETURNING synced_at::text
	`, reg.ID, reg.TurnoID, userID, reg.Tipo, reg.IdempotencyKey, string(payloadJSON), payloadHash,
		reg.DeviceID, reg.EventoAt).Scan(&reg.SyncedAt)
}

// IsUniqueViolation reports Postgres unique constraint violations (SQLSTATE 23505).
func IsUniqueViolation(err error) bool {
	var pgErr *pgconn.PgError
	return errors.As(err, &pgErr) && pgErr.Code == "23505"
}

func (r *RegistroRepository) HasTipoForTurno(ctx context.Context, turnoID, tipo string) (bool, error) {
	var exists bool
	err := r.pool.QueryRow(ctx, `
		SELECT EXISTS(SELECT 1 FROM registros WHERE turno_id = $1::uuid AND tipo = $2)
	`, turnoID, tipo).Scan(&exists)
	return exists, err
}

func (r *RegistroRepository) GetPayloadHash(ctx context.Context, key string) (string, error) {
	var hash string
	err := r.pool.QueryRow(ctx, `SELECT payload_hash FROM registros WHERE idempotency_key = $1`, key).Scan(&hash)
	if errors.Is(err, pgx.ErrNoRows) {
		return "", nil
	}
	return hash, err
}
